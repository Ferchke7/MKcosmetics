package router

import (
	"context"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type SEOInjector struct {
	catalogRepo repository.CatalogRepository
	staticDir   string
	mu          sync.RWMutex
	cachedIndex []byte
	lastRead    time.Time
}

func NewSEOInjector(catalogRepo repository.CatalogRepository, staticDir string) *SEOInjector {
	return &SEOInjector{
		catalogRepo: catalogRepo,
		staticDir:   staticDir,
	}
}

func (inj *SEOInjector) getIndexHTML() []byte {
	inj.mu.RLock()
	if len(inj.cachedIndex) > 0 && time.Since(inj.lastRead) < 10*time.Minute {
		defer inj.mu.RUnlock()
		return inj.cachedIndex
	}
	inj.mu.RUnlock()

	inj.mu.Lock()
	defer inj.mu.Unlock()

	indexPath := filepath.Join(inj.staticDir, "index.html")
	data, err := os.ReadFile(indexPath)
	if err != nil {
		return nil
	}
	inj.cachedIndex = data
	inj.lastRead = time.Now()
	return data
}

// ServeDynamicSPA serves index.html with pre-rendered SEO title, meta tags, and Schema.org JSON-LD
func (inj *SEOInjector) ServeDynamicSPA(w http.ResponseWriter, r *http.Request) bool {
	rawHTML := inj.getIndexHTML()
	if len(rawHTML) == 0 {
		return false
	}

	path := r.URL.Path

	// 1. Product Detail Page
	if strings.HasPrefix(path, "/product/") {
		slug := strings.Trim(strings.TrimPrefix(path, "/product/"), "/")
		if slug != "" {
			ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
			defer cancel()

			product, err := inj.catalogRepo.GetBySlug(ctx, slug)
			if err == nil && product != nil && !product.IsHidden && !product.Archived {
				rendered := inj.injectProductSEO(rawHTML, product, slug)
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				_, _ = w.Write(rendered)
				return true
			}

			// Missing / archived product: Genuine 404 with noindex to prevent Google Soft 404
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.WriteHeader(http.StatusNotFound)
			rendered := inj.injectNotFoundSEO(rawHTML, path)
			_, _ = w.Write(rendered)
			return true
		}
	}

	// 2. Catalog Page & Canonical 301 Redirect for /catalog/:slug -> /catalog?categorySlug=:slug
	if strings.HasPrefix(path, "/catalog/") {
		sub := strings.Trim(strings.TrimPrefix(path, "/catalog/"), "/")
		if sub != "" {
			target := fmt.Sprintf("/catalog?categorySlug=%s", sub)
			if r.URL.RawQuery != "" {
				target = fmt.Sprintf("%s&%s", target, r.URL.RawQuery)
			}
			http.Redirect(w, r, target, http.StatusMovedPermanently)
			return true
		}
	}

	if path == "/catalog" {
		// Clean search template crawl trap
		q := r.URL.Query().Get("q")
		if q == "{search_term_string}" || strings.Contains(q, "search_term_string") {
			http.Redirect(w, r, "/catalog", http.StatusMovedPermanently)
			return true
		}

		rawBrand := r.URL.Query().Get("brand")
		trimmedBrand := strings.TrimSpace(rawBrand)
		if rawBrand != "" && rawBrand != trimmedBrand {
			values := r.URL.Query()
			values.Set("brand", trimmedBrand)
			http.Redirect(w, r, "/catalog?"+values.Encode(), http.StatusMovedPermanently)
			return true
		}

		cat := r.URL.Query().Get("categorySlug")
		if cat == "" {
			cat = r.URL.Query().Get("category")
		}

		// If internal search query is active, serve noindex to prevent crawl trap
		if q != "" {
			rendered := inj.injectNoindexSEO(rawHTML, path)
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			_, _ = w.Write(rendered)
			return true
		}

		rendered := inj.injectCatalogSEO(rawHTML, trimmedBrand, cat)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(rendered)
		return true
	}

	// 3. Home Page
	if path == "/" || path == "" {
		rendered := inj.injectHomeSEO(rawHTML)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(rendered)
		return true
	}

	// 4. Delivery Page
	if path == "/delivery" || path == "/delivery/" {
		rendered := inj.injectDeliverySEO(rawHTML)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(rendered)
		return true
	}

	// 5. About Page
	if path == "/about" || path == "/about/" {
		rendered := inj.injectAboutSEO(rawHTML)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(rendered)
		return true
	}

	// 6. Contacts Page
	if path == "/contacts" || path == "/contacts/" {
		rendered := inj.injectContactsSEO(rawHTML)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(rendered)
		return true
	}

	// 7. Non-indexable utility & transactional pages
	if strings.HasPrefix(path, "/wishlist") || strings.HasPrefix(path, "/checkout") || strings.HasPrefix(path, "/cart") || strings.HasPrefix(path, "/admin") {
		rendered := inj.injectNoindexSEO(rawHTML, path)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(rendered)
		return true
	}

	// Default SPA Fallback: Inject canonical for any other route
	rendered := inj.injectDefaultSEO(rawHTML, path)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write(rendered)
	return true
}

func formatNumber(n int64) string {
	in := fmt.Sprintf("%d", n)
	out := ""
	for i, c := range in {
		if i > 0 && (len(in)-i)%3 == 0 {
			out += " "
		}
		out += string(c)
	}
	return out
}

func cleanPreviewText(s string, maxRunes int) string {
	s = strings.ReplaceAll(s, "\r\n", " ")
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.ReplaceAll(s, "\t", " ")
	s = strings.ReplaceAll(s, "*", "")
	s = strings.ReplaceAll(s, "#", "")

	fields := strings.Fields(s)
	joined := strings.Join(fields, " ")

	runes := []rune(joined)
	if len(runes) <= maxRunes {
		return joined
	}
	return string(runes[:maxRunes-3]) + "..."
}

func (inj *SEOInjector) injectProductSEO(baseHTML []byte, p *entity.CatalogProduct, slug string) []byte {
	brand := p.Brand
	if p.BrandOverride != "" {
		brand = p.BrandOverride
	}
	if brand == "" {
		brand = "Корейская косметика"
	}

	titleText := fmt.Sprintf("%s %s — купить со склада в Южной Корее | MK KOREA COSMETIC", p.Name, brand)

	var ogTitleText string
	if p.PriceKRW > 0 {
		ogTitleText = fmt.Sprintf("%s • %s — %s ₩", p.Name, brand, formatNumber(p.PriceKRW))
	} else {
		ogTitleText = fmt.Sprintf("%s • %s", p.Name, brand)
	}

	descSource := p.Excerpt
	if descSource == "" {
		descSource = p.Description
	}
	descText := cleanPreviewText(descSource, 200)
	if descText == "" {
		descText = fmt.Sprintf("Оригинальная корейская косметика %s %s со склада в Южной Корее (Сеул). Прямые оптовые поставки, быстрая доставка по СНГ.", p.Name, brand)
	}

	canonicalURL := fmt.Sprintf("https://mkkoreacosmetic.com/product/%s", slug)

	// Pick primary image
	imgURL := "https://mkkoreacosmetic.com/og-image.jpg"
	isDefaultImage := true
	if len(p.Photos) > 0 {
		if p.Photos[0].Full != "" {
			imgURL = p.Photos[0].Full
			isDefaultImage = false
		} else if p.Photos[0].W600 != "" {
			imgURL = p.Photos[0].W600
			isDefaultImage = false
		}
	} else if len(p.Images) > 0 && p.Images[0] != "" {
		imgURL = p.Images[0]
		isDefaultImage = false
	}

	if strings.HasPrefix(imgURL, "/") {
		imgURL = "https://mkkoreacosmetic.com" + imgURL
	}

	// JSON-LD Product Schema
	type BrandSchema struct {
		Type string `json:"@type"`
		Name string `json:"name"`
	}

	type SellerSchema struct {
		Type string `json:"@type"`
		Name string `json:"name"`
		URL  string `json:"url"`
	}

	type MonetaryAmountSchema struct {
		Type     string `json:"@type"`
		Value    string `json:"value"`
		Currency string `json:"currency"`
	}

	type DefinedRegionSchema struct {
		Type           string `json:"@type"`
		AddressCountry string `json:"addressCountry"`
	}

	type QuantitativeValueSchema struct {
		Type     string `json:"@type"`
		MinValue int    `json:"minValue"`
		MaxValue int    `json:"maxValue"`
		UnitCode string `json:"unitCode"`
	}

	type ShippingDeliveryTimeSchema struct {
		Type         string                  `json:"@type"`
		HandlingTime QuantitativeValueSchema `json:"handlingTime"`
		TransitTime  QuantitativeValueSchema `json:"transitTime"`
	}

	type OfferShippingDetailsSchema struct {
		Type                string                     `json:"@type"`
		ShippingRate        MonetaryAmountSchema       `json:"shippingRate"`
		ShippingDestination DefinedRegionSchema        `json:"shippingDestination"`
		DeliveryTime        ShippingDeliveryTimeSchema `json:"deliveryTime"`
	}

	type MerchantReturnPolicySchema struct {
		Type                 string   `json:"@type"`
		ApplicableCountry    []string `json:"applicableCountry"`
		ReturnPolicyCategory string   `json:"returnPolicyCategory"`
		MerchantReturnDays   int      `json:"merchantReturnDays"`
		ReturnMethod         string   `json:"returnMethod"`
		ReturnFees           string   `json:"returnFees"`
	}

	type CountrySchema struct {
		Type string `json:"@type"`
		Name string `json:"name"`
	}

	type OfferSchema struct {
		Type                    string                       `json:"@type"`
		URL                     string                       `json:"url"`
		PriceCurrency           string                       `json:"priceCurrency"`
		Price                   int64                        `json:"price"`
		PriceValidUntil         string                       `json:"priceValidUntil,omitempty"`
		Availability            string                       `json:"availability"`
		ItemCondition           string                       `json:"itemCondition"`
		Seller                  SellerSchema                 `json:"seller"`
		ShippingDetails         []OfferShippingDetailsSchema `json:"shippingDetails"`
		HasMerchantReturnPolicy MerchantReturnPolicySchema   `json:"hasMerchantReturnPolicy"`
	}

	type RatingSchema struct {
		Type        string `json:"@type"`
		RatingValue string `json:"ratingValue"`
		ReviewCount string `json:"reviewCount"`
		BestRating  string `json:"bestRating"`
	}

	type ProductSchema struct {
		Context         string         `json:"@context"`
		Type            string         `json:"@type"`
		Name            string         `json:"name"`
		Image           []string       `json:"image"`
		Description     string         `json:"description"`
		SKU             string         `json:"sku,omitempty"`
		Category        string         `json:"category,omitempty"`
		Brand           BrandSchema    `json:"brand"`
		CountryOfOrigin *CountrySchema `json:"countryOfOrigin,omitempty"`
		Offers          OfferSchema    `json:"offers"`
		AggregateRating *RatingSchema  `json:"aggregateRating,omitempty"`
	}

	imagesList := []string{imgURL}
	for _, ph := range p.Photos {
		if ph.Full != "" && ph.Full != imgURL {
			loc := ph.Full
			if strings.HasPrefix(loc, "/") {
				loc = "https://mkkoreacosmetic.com" + loc
			}
			imagesList = append(imagesList, loc)
		}
	}

	prodJSON := ProductSchema{
		Context:     "https://schema.org/",
		Type:        "Product",
		Name:        p.Name,
		Image:       imagesList,
		Description: descText,
		SKU:         p.Code,
		Category:    p.CategoryName,
		CountryOfOrigin: &CountrySchema{
			Type: "Country",
			Name: "KR",
		},
		Brand: BrandSchema{
			Type: "Brand",
			Name: brand,
		},
		Offers: OfferSchema{
			Type:            "Offer",
			URL:             canonicalURL,
			PriceCurrency:   "KRW",
			Price:           p.PriceKRW,
			PriceValidUntil: "2027-12-31",
			Availability:    "https://schema.org/InStock",
			ItemCondition: "https://schema.org/NewCondition",
			Seller: SellerSchema{
				Type: "Organization",
				Name: "MK KOREA COSMETIC",
				URL:  "https://mkkoreacosmetic.com",
			},
			ShippingDetails: []OfferShippingDetailsSchema{
				{
					Type: "OfferShippingDetails",
					ShippingRate: MonetaryAmountSchema{
						Type:     "MonetaryAmount",
						Value:    "0",
						Currency: "KRW",
					},
					ShippingDestination: DefinedRegionSchema{
						Type:           "DefinedRegion",
						AddressCountry: "RU",
					},
					DeliveryTime: ShippingDeliveryTimeSchema{
						Type: "ShippingDeliveryTime",
						HandlingTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 1,
							MaxValue: 2,
							UnitCode: "DAY",
						},
						TransitTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 5,
							MaxValue: 14,
							UnitCode: "DAY",
						},
					},
				},
				{
					Type: "OfferShippingDetails",
					ShippingRate: MonetaryAmountSchema{
						Type:     "MonetaryAmount",
						Value:    "0",
						Currency: "KRW",
					},
					ShippingDestination: DefinedRegionSchema{
						Type:           "DefinedRegion",
						AddressCountry: "KZ",
					},
					DeliveryTime: ShippingDeliveryTimeSchema{
						Type: "ShippingDeliveryTime",
						HandlingTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 1,
							MaxValue: 2,
							UnitCode: "DAY",
						},
						TransitTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 5,
							MaxValue: 14,
							UnitCode: "DAY",
						},
					},
				},
				{
					Type: "OfferShippingDetails",
					ShippingRate: MonetaryAmountSchema{
						Type:     "MonetaryAmount",
						Value:    "0",
						Currency: "KRW",
					},
					ShippingDestination: DefinedRegionSchema{
						Type:           "DefinedRegion",
						AddressCountry: "UZ",
					},
					DeliveryTime: ShippingDeliveryTimeSchema{
						Type: "ShippingDeliveryTime",
						HandlingTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 1,
							MaxValue: 2,
							UnitCode: "DAY",
						},
						TransitTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 5,
							MaxValue: 14,
							UnitCode: "DAY",
						},
					},
				},
				{
					Type: "OfferShippingDetails",
					ShippingRate: MonetaryAmountSchema{
						Type:     "MonetaryAmount",
						Value:    "0",
						Currency: "KRW",
					},
					ShippingDestination: DefinedRegionSchema{
						Type:           "DefinedRegion",
						AddressCountry: "KR",
					},
					DeliveryTime: ShippingDeliveryTimeSchema{
						Type: "ShippingDeliveryTime",
						HandlingTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 1,
							MaxValue: 2,
							UnitCode: "DAY",
						},
						TransitTime: QuantitativeValueSchema{
							Type:     "QuantitativeValue",
							MinValue: 1,
							MaxValue: 3,
							UnitCode: "DAY",
						},
					},
				},
			},
			HasMerchantReturnPolicy: MerchantReturnPolicySchema{
				Type:                 "MerchantReturnPolicy",
				ApplicableCountry:    []string{"RU", "KZ", "UZ", "KR", "BY", "KG"},
				ReturnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
				MerchantReturnDays:   14,
				ReturnMethod:         "https://schema.org/ReturnByMail",
				ReturnFees:           "https://schema.org/FreeReturn",
			},
		},
	}

	prodBytes, _ := json.Marshal(prodJSON)

	// BreadcrumbList Schema
	type BreadcrumbItem struct {
		Type     string `json:"@type"`
		Position int    `json:"position"`
		Name     string `json:"name"`
		Item     string `json:"item"`
	}

	type BreadcrumbSchema struct {
		Context         string           `json:"@context"`
		Type            string           `json:"@type"`
		ItemListElement []BreadcrumbItem `json:"itemListElement"`
	}

	breadItems := []BreadcrumbItem{
		{Type: "ListItem", Position: 1, Name: "Главная", Item: "https://mkkoreacosmetic.com"},
		{Type: "ListItem", Position: 2, Name: "Каталог", Item: "https://mkkoreacosmetic.com/catalog"},
	}

	if p.CategoryName != "" {
		breadItems = append(breadItems, BreadcrumbItem{
			Type:     "ListItem",
			Position: 3,
			Name:     p.CategoryName,
			Item:     fmt.Sprintf("https://mkkoreacosmetic.com/catalog?categorySlug=%s", p.CategorySlug),
		})
		breadItems = append(breadItems, BreadcrumbItem{
			Type:     "ListItem",
			Position: 4,
			Name:     p.Name,
			Item:     canonicalURL,
		})
	} else {
		breadItems = append(breadItems, BreadcrumbItem{
			Type:     "ListItem",
			Position: 3,
			Name:     p.Name,
			Item:     canonicalURL,
		})
	}

	breadJSON := BreadcrumbSchema{
		Context:         "https://schema.org",
		Type:            "BreadcrumbList",
		ItemListElement: breadItems,
	}
	breadBytes, _ := json.Marshal(breadJSON)

	imgDims := ""
	if isDefaultImage {
		imgDims = "\n    <meta property=\"og:image:width\" content=\"1200\" />\n    <meta property=\"og:image:height\" content=\"630\" />"
	}

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="%s, %s, корейская косметика, косметика из кореи, оптом, Южная Корея, оригинал, уход за кожей" />
    <link rel="canonical" href="%s" />
    
    <!-- Open Graph / Telegram / WhatsApp / Facebook -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="%s" />
    <meta property="og:image:secure_url" content="%s" />
    <meta property="og:image:type" content="image/jpeg" />%s
    <meta property="og:locale" content="ru_RU" />
    <meta property="product:price:amount" content="%d" />
    <meta property="product:price:currency" content="KRW" />

    <!-- Twitter Card for Telegram / Twitter / Slack -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="%s" />

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">%s</script>
    <script type="application/ld+json">%s</script>
`,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		html.EscapeString(p.Name),
		html.EscapeString(brand),
		canonicalURL,
		html.EscapeString(ogTitleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(imgURL),
		html.EscapeString(imgURL),
		imgDims,
		p.PriceKRW,
		html.EscapeString(ogTitleText),
		html.EscapeString(descText),
		html.EscapeString(imgURL),
		string(prodBytes),
		string(breadBytes),
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectCatalogSEO(baseHTML []byte, brand, category string) []byte {
	titleText := "Каталог корейской косметики со склада в Южной Корее — оптом и в розницу | MK KOREA COSMETIC"
	descText := "Широкий ассортимент оригинальной корейской косметики напрямую из Южной Кореи. AMORE PACIFIC, Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION. Оптовые цены со склада."
	canonicalURL := "https://mkkoreacosmetic.com/catalog"

	if brand != "" {
		titleText = fmt.Sprintf("%s — корейская косметика оптом и в розницу со склада в Южной Корее | MK KOREA COSMETIC", brand)
		descText = fmt.Sprintf("Купить оригинальную косметику %s напрямую из Кореи. 100%% оригинал со склада в Южной Корее, оптовые и розничные поставки по СНГ.", brand)
		canonicalURL = fmt.Sprintf("https://mkkoreacosmetic.com/catalog?brand=%s", brand)
	} else if category != "" {
		titleText = fmt.Sprintf("Корейская косметика %s — каталог со склада в Южной Корее | MK KOREA COSMETIC", category)
		descText = fmt.Sprintf("Каталог средств %s от ведущих корейских брендов. Доставка напрямую из Южной Кореи со склада в Россию, Казахстан, Узбекистан и СНГ.", category)
		canonicalURL = fmt.Sprintf("https://mkkoreacosmetic.com/catalog?categorySlug=%s", category)
	}

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="корейская косметика, косметика из кореи, оптом из кореи, склад в сеуле, sulwhasoo, whoo, medi-peel, manyo, jogabi, curacion" />
    <link rel="canonical" href="%s" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:secure_url" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
`,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectHomeSEO(baseHTML []byte) []byte {
	titleText := "MK KOREA COSMETIC — Люксовая корейская косметика со склада в Южной Корее"
	descText := "Оптово-розничный склад оригинальной корейской косметики в Южной Корее: AMORE PACIFIC, Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION. Прямые поставки из Южной Кореи."
	canonicalURL := "https://mkkoreacosmetic.com/"

	// WebSite Schema with Sitelinks Searchbox
	websiteJSON := `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MK KOREA COSMETIC",
  "alternateName": ["MK Cosmetics", "MK Корея Косметик"],
  "url": "https://mkkoreacosmetic.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://mkkoreacosmetic.com/catalog?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}`

	// Organization & Store Schema with Seoul headquarters and social links
	orgJSON := `{
  "@context": "https://schema.org",
  "@type": "WholesaleStore",
  "name": "MK KOREA COSMETIC",
  "url": "https://mkkoreacosmetic.com/",
  "logo": "https://mkkoreacosmetic.com/logo.png",
  "image": "https://mkkoreacosmetic.com/logo.png",
  "description": "Прямые поставки оригинальной корейской косметики оптом и в розницу со склада в Южной Корее, Сеул.",
  "sameAs": [
    "https://t.me/mkcosmetkor",
    "https://instagram.com/muhabbat.kim.mk"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Seoul",
    "addressCountry": "KR"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+82-10-8390-5577",
      "contactType": "sales",
      "areaServed": ["RU", "KZ", "UZ", "KG", "BY", "KR"],
      "availableLanguage": ["Russian", "Korean", "English"]
    }
  ],
  "priceRange": "$",
  "currenciesAccepted": "KRW, USD, RUB, KZT, UZS",
  "paymentAccepted": "Cash, Credit Card, Wire Transfer, Crypto",
  "areaServed": ["RU", "KZ", "UZ", "KG", "BY", "KR"]
}`

	// FAQPage Schema for Google Rich Snippet Accordion
	faqJSON := `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Оригинальная ли косметика и откуда отправляются заказы?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "100% оригинальная сертифицированная продукция с внутреннего рынка Южной Кореи. Все заказы собираются и отправляются напрямую с нашего склада в Южной Корее с батч-кодами и актуальными сроками годности."
      }
    },
    {
      "@type": "Question",
      "name": "Как работает доставка в Россию, Казахстан, Узбекистан и страны СНГ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Мы отправляем заказы авиалиниями из Южной Кореи. Средний срок доставки составляет 7-14 рабочих дней. Каждому отправлению присваивается международный трек-номер для отслеживания."
      }
    },
    {
      "@type": "Question",
      "name": "Работаете ли вы оптом для магазинов, шоурумов и косметологов?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, MK KOREA COSMETIC специализируется на оптовых поставках корейской косметики по прямому прямому корейскому прайсу. Предоставляем индивидуальные оптовые скидки, регулярные поставки брендов Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION."
      }
    },
    {
      "@type": "Question",
      "name": "Какие способы оплаты принимаются?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Оплата принимается в удобной для вас валюте: безналичный расчет, перевод на банковские карты, USDT/Crypto, корейские воны (KRW)."
      }
    }
  ]
}`

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="косметика из кореи, корейская косметика, корейская косметика оптом, косметика из южной кореи склад, amoredelivery, sulwhasoo, whoo, medi-peel, manyo, jogabi, curacion" />
    <link rel="canonical" href="%s" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:secure_url" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/og-image.jpg" />

    <!-- Schema.org Rich Snippets JSON-LD -->
    <script type="application/ld+json">%s</script>
    <script type="application/ld+json">%s</script>
    <script type="application/ld+json">%s</script>
`,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		websiteJSON,
		orgJSON,
		faqJSON,
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func stripTag(s, prefix string) string {
	for {
		idx := strings.Index(s, prefix)
		if idx == -1 {
			break
		}
		end := strings.Index(s[idx:], "/>")
		if end == -1 {
			end = strings.Index(s[idx:], ">")
		}
		if end != -1 {
			s = s[:idx] + s[idx+end+2:]
		} else {
			break
		}
	}
	return s
}

func replaceHeadContent(baseHTML []byte, newHeadTags string) []byte {
	s := string(baseHTML)

	// Remove default title
	if start := strings.Index(s, "<title>"); start != -1 {
		if end := strings.Index(s[start:], "</title>"); end != -1 {
			s = s[:start] + s[start+end+8:]
		}
	}

	// Remove default and fallback meta/og/twitter tags so injected ones take full precedence
	s = stripTag(s, `<meta name="description"`)
	s = stripTag(s, `<meta name="keywords"`)
	s = stripTag(s, `<meta property="og:`)
	s = stripTag(s, `<meta name="twitter:`)
	s = stripTag(s, `<link rel="canonical"`)

	// Insert before </head>
	headEnd := strings.Index(s, "</head>")
	if headEnd != -1 {
		s = s[:headEnd] + newHeadTags + s[headEnd:]
	}

	return []byte(s)
}

func (inj *SEOInjector) injectDeliverySEO(baseHTML []byte) []byte {
	titleText := "Доставка и оплата корейской косметики из Южной Кореи | MK KOREA COSMETIC"
	descText := "Условия международной авиа-доставки и экспресс-карго оригинальной корейской косметики в Россию, Казахстан, Узбекистан и СНГ. Сроки от 5 до 14 дней со склада в Сеуле."
	canonicalURL := "https://mkkoreacosmetic.com/delivery"

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="доставка косметики из кореи, карго корея, доставка в россию, доставка в казахстан, доставка в узбекистан, оптовая доставка корейской косметики" />
    <link rel="canonical" href="%s" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:secure_url" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
`,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
	)

	deliveryFaqJSON := `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "В какие страны осуществляется доставка корейской косметики?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Мы осуществляем регулярную авиа-доставку и карго со склада в Сеуле (Южная Корея) в Россию, Казахстан, Узбекистан, Кыргызстан, Беларусь и другие страны СНГ."
      }
    },
    {
      "@type": "Question",
      "name": "Каковы сроки доставки из Южной Кореи?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Сроки международной доставки составляют в среднем от 5 до 14 рабочих дней в зависимости от города назначения и выбранного типа отправки (авиа-экспресс или карго)."
      }
    },
    {
      "@type": "Question",
      "name": "Предоставляется ли трек-номер для отслеживания посылки?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, после сборки и отправки заказа со склада в Корее клиенту высылается международный трек-номер для полного онлайн-отслеживания груза на всем пути следования."
      }
    },
    {
      "@type": "Question",
      "name": "Как упаковывается косметика при международной перевозке?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Каждый заказ надежно упаковывается в плотные гофрокороба с многослойной воздушно-пузырчатой пленкой (Bubble wrap), исключая повреждение флаконов, банок и подарочных наборов."
      }
    }
  ]
}`

	metaTags += fmt.Sprintf("\n    <!-- Delivery FAQ Schema -->\n    <script type=\"application/ld+json\">%s</script>\n", deliveryFaqJSON)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectAboutSEO(baseHTML []byte) []byte {
	titleText := "О компании MK KOREA COSMETIC — Оптово-розничный склад в Южной Корее"
	descText := "MK KOREA COSMETIC — прямой поставщик сертифицированной корейской косметики оптом и в розницу. Собственный склад в Южной Корее, официальные контракты, 100%% оригинальная продукция."
	canonicalURL := "https://mkkoreacosmetic.com/about"

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="о компании mk korea cosmetic, оптовый склад косметики сеул, поставщик корейской косметики, amoredelivery, официальная корейская косметика" />
    <link rel="canonical" href="%s" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:secure_url" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
`,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectContactsSEO(baseHTML []byte) []byte {
	titleText := "Контакты оптово-розничного склада в Южной Корее | MK KOREA COSMETIC"
	descText := "Свяжитесь с отделом оптовых и розничных продаж MK KOREA COSMETIC: WhatsApp +82 10 8390 5577, Telegram @mkcosmetkor. Склад в Южной Корее, поддержка клиентов 7 дней в неделю."
	canonicalURL := "https://mkkoreacosmetic.com/contacts"

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="контакты mk korea cosmetic, телефон склад корея, whatsapp корейская косметика, telegram канал корейская косметика" />
    <link rel="canonical" href="%s" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:secure_url" content="https://mkkoreacosmetic.com/og-image.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/og-image.jpg" />
`,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(titleText),
		html.EscapeString(descText),
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectNoindexSEO(baseHTML []byte, path string) []byte {
	cleanPath := strings.TrimRight(path, "/")
	canonicalURL := "https://mkkoreacosmetic.com" + cleanPath

	metaTags := fmt.Sprintf(`
    <title>MK KOREA COSMETIC — Личный кабинет</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="%s" />
`,
		canonicalURL,
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectDefaultSEO(baseHTML []byte, path string) []byte {
	cleanPath := strings.TrimRight(path, "/")
	canonicalURL := "https://mkkoreacosmetic.com" + cleanPath
	if cleanPath == "" {
		canonicalURL = "https://mkkoreacosmetic.com/"
	}

	metaTags := fmt.Sprintf(`
    <link rel="canonical" href="%s" />
`,
		canonicalURL,
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectNotFoundSEO(baseHTML []byte, path string) []byte {
	cleanPath := strings.TrimRight(path, "/")
	canonicalURL := "https://mkkoreacosmetic.com" + cleanPath

	metaTags := fmt.Sprintf(`
    <title>Товар не найден (404) | MK KOREA COSMETIC</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="%s" />
`,
		canonicalURL,
	)

	return replaceHeadContent(baseHTML, metaTags)
}
