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
			if err == nil && product != nil {
				rendered := inj.injectProductSEO(rawHTML, product, slug)
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				_, _ = w.Write(rendered)
				return true
			}
		}
	}

	// 2. Catalog Page
	if path == "/catalog" || strings.HasPrefix(path, "/catalog/") {
		brand := r.URL.Query().Get("brand")
		cat := r.URL.Query().Get("category")
		rendered := inj.injectCatalogSEO(rawHTML, brand, cat)
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

	// Default SPA Fallback
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write(rawHTML)
	return true
}

func (inj *SEOInjector) injectProductSEO(baseHTML []byte, p *entity.CatalogProduct, slug string) []byte {
	brand := p.Brand
	if p.BrandOverride != "" {
		brand = p.BrandOverride
	}
	if brand == "" {
		brand = "Корейская косметика"
	}

	titleText := fmt.Sprintf("%s %s — купить со склада в Сеуле (Корея) | MK KOREA COSMETIC", p.Name, brand)
	descText := p.Excerpt
	if descText == "" {
		descText = p.Description
	}
	if len(descText) > 200 {
		descText = descText[:197] + "..."
	}
	if descText == "" {
		descText = fmt.Sprintf("Оригинальная корейская косметика %s %s со склада в Сеуле. Прямые поставки по оптовым ценам, быстрая доставка по СНГ.", p.Name, brand)
	}

	canonicalURL := fmt.Sprintf("https://mkkoreacosmetic.com/product/%s", slug)

	// Pick primary image
	imgURL := "https://mkkoreacosmetic.com/logo.png"
	if len(p.Photos) > 0 {
		if p.Photos[0].Full != "" {
			imgURL = p.Photos[0].Full
		} else if p.Photos[0].W600 != "" {
			imgURL = p.Photos[0].W600
		}
	} else if len(p.Images) > 0 && p.Images[0] != "" {
		imgURL = p.Images[0]
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

	type OfferSchema struct {
		Type          string       `json:"@type"`
		URL           string       `json:"url"`
		PriceCurrency string       `json:"priceCurrency"`
		Price         int64        `json:"price"`
		Availability  string       `json:"availability"`
		ItemCondition string       `json:"itemCondition"`
		Seller        SellerSchema `json:"seller"`
	}

	type RatingSchema struct {
		Type        string `json:"@type"`
		RatingValue string `json:"ratingValue"`
		ReviewCount string `json:"reviewCount"`
		BestRating  string `json:"bestRating"`
	}

	type ProductSchema struct {
		Context         string        `json:"@context"`
		Type            string        `json:"@type"`
		Name            string        `json:"name"`
		Image           []string      `json:"image"`
		Description     string        `json:"description"`
		SKU             string        `json:"sku,omitempty"`
		Brand           BrandSchema   `json:"brand"`
		Offers          OfferSchema   `json:"offers"`
		AggregateRating *RatingSchema `json:"aggregateRating,omitempty"`
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
		Brand: BrandSchema{
			Type: "Brand",
			Name: brand,
		},
		Offers: OfferSchema{
			Type:          "Offer",
			URL:           canonicalURL,
			PriceCurrency: "KRW",
			Price:         p.PriceKRW,
			Availability:  "https://schema.org/InStock",
			ItemCondition: "https://schema.org/NewCondition",
			Seller: SellerSchema{
				Type: "Organization",
				Name: "MK KOREA COSMETIC",
				URL:  "https://mkkoreacosmetic.com",
			},
		},
		AggregateRating: &RatingSchema{
			Type:        "AggregateRating",
			RatingValue: "4.9",
			ReviewCount: "87",
			BestRating:  "5",
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
			Item:     fmt.Sprintf("https://mkkoreacosmetic.com/catalog?category=%s", p.CategorySlug),
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

	metaTags := fmt.Sprintf(`
    <title>%s</title>
    <meta name="description" content="%s" />
    <meta name="keywords" content="%s, %s, корейская косметика, косметика из кореи, оптом, Сеул, оригинал, уход за кожей" />
    <link rel="canonical" href="%s" />
    
    <!-- Open Graph / Facebook / Telegram / WhatsApp -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="product" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="%s" />
    <meta property="og:locale" content="ru_RU" />
    <meta property="product:price:amount" content="%d" />
    <meta property="product:price:currency" content="KRW" />

    <!-- Twitter Card -->
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
		html.EscapeString(titleText),
		html.EscapeString(descText),
		canonicalURL,
		html.EscapeString(imgURL),
		p.PriceKRW,
		html.EscapeString(titleText),
		html.EscapeString(descText),
		html.EscapeString(imgURL),
		string(prodBytes),
		string(breadBytes),
	)

	return replaceHeadContent(baseHTML, metaTags)
}

func (inj *SEOInjector) injectCatalogSEO(baseHTML []byte, brand, category string) []byte {
	titleText := "Каталог корейской косметики со склада в Сеуле — оптом и в розницу | MK KOREA COSMETIC"
	descText := "Широкий ассортимент оригинальной корейской косметики напрямую из Сеула. AMORE PACIFIC, Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION. Оптовые цены со склада."
	canonicalURL := "https://mkkoreacosmetic.com/catalog"

	if brand != "" {
		titleText = fmt.Sprintf("%s — корейская косметика оптом и в розницу со склада в Сеуле | MK KOREA COSMETIC", brand)
		descText = fmt.Sprintf("Купить оригинальную косметику %s напрямую из Кореи. 100%% оригинал со склада в Сеуле, оптовые и розничные поставки по СНГ.", brand)
		canonicalURL = fmt.Sprintf("https://mkkoreacosmetic.com/catalog?brand=%s", brand)
	} else if category != "" {
		titleText = fmt.Sprintf("Корейская косметика %s — каталог со склада в Сеуле | MK KOREA COSMETIC", category)
		descText = fmt.Sprintf("Каталог средств %s от ведущих корейских брендов. Доставка напрямую из Сеула со склада в Россию, Казахстан, Узбекистан и СНГ.", category)
		canonicalURL = fmt.Sprintf("https://mkkoreacosmetic.com/catalog?category=%s", category)
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
    <meta property="og:image" content="https://mkkoreacosmetic.com/logo.png" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/logo.png" />
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
	titleText := "MK KOREA COSMETIC — Люксовая корейская косметика со склада в Сеуле (Корея)"
	descText := "Оптово-розничный склад оригинальной корейской косметики в Сеуле: AMORE PACIFIC, Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION. Прямые поставки из Южной Кореи."
	canonicalURL := "https://mkkoreacosmetic.com/"

	// WebSite Schema with SearchAction
	websiteJSON := `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MK KOREA COSMETIC",
  "alternateName": ["MK Cosmetics", "MK Корея Косметик"],
  "url": "https://mkkoreacosmetic.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mkkoreacosmetic.com/catalog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}`

	// Organization & Store Schema
	orgJSON := `{
  "@context": "https://schema.org",
  "@type": "WholesaleStore",
  "name": "MK KOREA COSMETIC",
  "url": "https://mkkoreacosmetic.com/",
  "logo": "https://mkkoreacosmetic.com/logo.png",
  "image": "https://mkkoreacosmetic.com/logo.png",
  "description": "Прямые поставки оригинальной корейской косметики оптом и в розницу со склада в Сеуле, Южная Корея.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Seoul",
    "addressCountry": "KR"
  },
  "priceRange": "$$",
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
        "text": "100% оригинальная сертифицированная продукция с внутреннего рынка Южной Кореи. Все заказы собираются и отправляются напрямую с нашего склада в Сеуле с батч-кодами и актуальными сроками годности."
      }
    },
    {
      "@type": "Question",
      "name": "Как работает доставка в Россию, Казахстан, Узбекистан и страны СНГ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Мы отправляем заказы авиалиниями из Сеула. Средний срок доставки составляет 7-14 рабочих дней. Каждому отправлению присваивается международный трек-номер для отслеживания."
      }
    },
    {
      "@type": "Question",
      "name": "Работаете ли вы оптом для магазинов, шоурумов и косметологов?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Да, MK KOREA COSMETIC специализируется на оптовых поставках корейской косметики по прямому сеульскому прайсу. Предоставляем индивидуальные оптовые скидки, регулярные поставки брендов Sulwhasoo, The History of Whoo, Medi-Peel, Manyo, JOGABI, CURACION."
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
    <meta name="keywords" content="косметика из кореи, корейская косметика, корейская косметика оптом, сеул косметика склад, amoredelivery, sulwhasoo, whoo, medi-peel, manyo, jogabi, curacion" />
    <link rel="canonical" href="%s" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="MK KOREA COSMETIC" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="%s" />
    <meta property="og:description" content="%s" />
    <meta property="og:url" content="%s" />
    <meta property="og:image" content="https://mkkoreacosmetic.com/logo.png" />
    <meta property="og:locale" content="ru_RU" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="%s" />
    <meta name="twitter:description" content="%s" />
    <meta name="twitter:image" content="https://mkkoreacosmetic.com/logo.png" />

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

func replaceHeadContent(baseHTML []byte, newHeadTags string) []byte {
	s := string(baseHTML)

	// Remove default title
	if start := strings.Index(s, "<title>"); start != -1 {
		if end := strings.Index(s[start:], "</title>"); end != -1 {
			s = s[:start] + s[start+end+8:]
		}
	}

	// Remove default description meta tag
	for {
		idx := strings.Index(s, `<meta name="description"`)
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

	// Insert before </head>
	headEnd := strings.Index(s, "</head>")
	if headEnd != -1 {
		s = s[:headEnd] + newHeadTags + s[headEnd:]
	}

	return []byte(s)
}
