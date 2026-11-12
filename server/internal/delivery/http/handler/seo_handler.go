package handler

import (
	"context"
	"encoding/xml"
	"fmt"
	"net/http"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/repository"
)

type SEOHandler struct {
	catalogRepo repository.CatalogRepository
}

func NewSEOHandler(catalogRepo repository.CatalogRepository) *SEOHandler {
	return &SEOHandler{
		catalogRepo: catalogRepo,
	}
}

// Robots.txt Handler
func (h *SEOHandler) GetRobotsTXT(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=86400")

	robots := `User-agent: *
Allow: /
Allow: /catalog
Allow: /product/
Allow: /uploads/
Disallow: /admin/
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /wishlist

User-agent: Googlebot
Allow: /
Allow: /catalog
Allow: /product/
Allow: /uploads/
Disallow: /admin/
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /wishlist

User-agent: Yandex
Allow: /
Allow: /catalog
Allow: /product/
Allow: /uploads/
Disallow: /admin/
Disallow: /admin
Disallow: /api/
Disallow: /checkout
Disallow: /wishlist

User-agent: Googlebot-Image
Allow: /uploads/
Allow: /

User-agent: YandexImages
Allow: /uploads/
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://mkkoreacosmetic.com/sitemap.xml
Sitemap: https://mkkoreacosmetic.com/sitemap-main.xml
Sitemap: https://mkkoreacosmetic.com/sitemap-categories.xml
Sitemap: https://mkkoreacosmetic.com/sitemap-brands.xml
Sitemap: https://mkkoreacosmetic.com/sitemap-products.xml
Host: https://mkkoreacosmetic.com
`
	_, _ = w.Write([]byte(robots))
}

// Sitemap XML structures with Google Image Sitemap Extensions
type SitemapImage struct {
	XMLName xml.Name `xml:"image:image"`
	Loc     string   `xml:"image:loc"`
	Title   string   `xml:"image:title,omitempty"`
	Caption string   `xml:"image:caption,omitempty"`
}

type SitemapURL struct {
	XMLName    xml.Name       `xml:"url"`
	Loc        string         `xml:"loc"`
	LastMod    string         `xml:"lastmod,omitempty"`
	ChangeFreq string         `xml:"changefreq,omitempty"`
	Priority   string         `xml:"priority,omitempty"`
	Images     []SitemapImage `xml:"image:image,omitempty"`
}

type SitemapURLSet struct {
	XMLName    xml.Name     `xml:"urlset"`
	XMLNS      string       `xml:"xmlns,attr"`
	XMLNSImage string       `xml:"xmlns:image,attr,omitempty"`
	URLs       []SitemapURL `xml:"url"`
}

// Sitemap Index structures (Standard protocol for multi-part sitemaps)
type SitemapIndexEntry struct {
	XMLName xml.Name `xml:"sitemap"`
	Loc     string   `xml:"loc"`
	LastMod string   `xml:"lastmod,omitempty"`
}

type SitemapIndex struct {
	XMLName  xml.Name            `xml:"sitemapindex"`
	XMLNS    string              `xml:"xmlns,attr"`
	Sitemaps []SitemapIndexEntry `xml:"sitemap"`
}

func writeXML(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	_, _ = w.Write([]byte(xml.Header))
	enc := xml.NewEncoder(w)
	enc.Indent("", "  ")
	_ = enc.Encode(data)
}

// GetSitemapXML returns the Master Sitemap Index referencing specialized child sitemaps
func (h *SEOHandler) GetSitemapXML(w http.ResponseWriter, r *http.Request) {
	baseURL := "https://mkkoreacosmetic.com"
	today := time.Now().Format("2006-01-02")

	idx := SitemapIndex{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		Sitemaps: []SitemapIndexEntry{
			{Loc: baseURL + "/sitemap-main.xml", LastMod: today},
			{Loc: baseURL + "/sitemap-categories.xml", LastMod: today},
			{Loc: baseURL + "/sitemap-brands.xml", LastMod: today},
			{Loc: baseURL + "/sitemap-products.xml", LastMod: today},
		},
	}

	writeXML(w, idx)
}

// GetSitemapMainXML returns static landing pages
func (h *SEOHandler) GetSitemapMainXML(w http.ResponseWriter, r *http.Request) {
	baseURL := "https://mkkoreacosmetic.com"
	today := time.Now().Format("2006-01-02")

	urlSet := SitemapURLSet{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  make([]SitemapURL, 0, 10),
	}

	staticPages := []struct {
		path     string
		freq     string
		priority string
	}{
		{"/", "daily", "1.0"},
		{"/catalog", "daily", "0.9"},
		{"/delivery", "weekly", "0.7"},
		{"/about", "monthly", "0.6"},
		{"/contacts", "monthly", "0.6"},
	}

	for _, p := range staticPages {
		urlSet.URLs = append(urlSet.URLs, SitemapURL{
			Loc:        baseURL + p.path,
			LastMod:    today,
			ChangeFreq: p.freq,
			Priority:   p.priority,
		})
	}

	writeXML(w, urlSet)
}

// GetSitemapCategoriesXML returns all catalog categories
func (h *SEOHandler) GetSitemapCategoriesXML(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	baseURL := "https://mkkoreacosmetic.com"
	today := time.Now().Format("2006-01-02")

	urlSet := SitemapURLSet{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  make([]SitemapURL, 0, 50),
	}

	categories, err := h.catalogRepo.GetCategories(ctx)
	if err == nil {
		for _, cat := range categories {
			if cat.Slug == "" {
				continue
			}
			urlSet.URLs = append(urlSet.URLs, SitemapURL{
				Loc:        fmt.Sprintf("%s/catalog?categorySlug=%s", baseURL, cat.Slug),
				LastMod:    today,
				ChangeFreq: "daily",
				Priority:   "0.8",
			})
		}
	}

	writeXML(w, urlSet)
}

// GetSitemapBrandsXML returns all catalog brands
func (h *SEOHandler) GetSitemapBrandsXML(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	baseURL := "https://mkkoreacosmetic.com"
	today := time.Now().Format("2006-01-02")

	urlSet := SitemapURLSet{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  make([]SitemapURL, 0, 100),
	}

	brands, err := h.catalogRepo.GetBrands(ctx)
	if err == nil {
		for _, b := range brands {
			if b.Name == "" && b.Slug == "" {
				continue
			}
			brandName := b.Name
			if brandName == "" {
				brandName = b.Slug
			}
			urlSet.URLs = append(urlSet.URLs, SitemapURL{
				Loc:        fmt.Sprintf("%s/catalog?brand=%s", baseURL, brandName),
				LastMod:    today,
				ChangeFreq: "daily",
				Priority:   "0.8",
			})
		}
	}

	writeXML(w, urlSet)
}

// GetSitemapProductsXML returns all active catalog products with Google Images extensions
func (h *SEOHandler) GetSitemapProductsXML(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 25*time.Second)
	defer cancel()

	baseURL := "https://mkkoreacosmetic.com"
	today := time.Now().Format("2006-01-02")

	urlSet := SitemapURLSet{
		XMLNS:      "http://www.sitemaps.org/schemas/sitemap/0.9",
		XMLNSImage: "http://www.google.com/schemas/sitemap-image/1.1",
		URLs:       make([]SitemapURL, 0, 2000),
	}

	filter := repository.CatalogFilter{
		Page:         1,
		PageSize:     10000,
		IncludeAdmin: false,
	}

	products, _, err := h.catalogRepo.List(ctx, filter)
	if err == nil {
		for _, p := range products {
			if p.Slug == "" || p.IsHidden || p.Archived {
				continue
			}

			lastMod := today
			if !p.UpdatedAt.IsZero() {
				lastMod = p.UpdatedAt.Format("2006-01-02")
			}

			productURL := SitemapURL{
				Loc:        fmt.Sprintf("%s/product/%s", baseURL, p.Slug),
				LastMod:    lastMod,
				ChangeFreq: "weekly",
				Priority:   "0.8",
				Images:     make([]SitemapImage, 0, len(p.Photos)),
			}

			brandName := p.Brand
			if p.BrandOverride != "" {
				brandName = p.BrandOverride
			}
			if brandName == "" {
				brandName = "Корейская косметика"
			}

			caption := fmt.Sprintf("%s — %s. Прямые поставки из Кореи (Сеул)", p.Name, brandName)

			for _, photo := range p.Photos {
				imgURL := photo.Full
				if imgURL == "" {
					imgURL = photo.W600
				}
				if imgURL == "" {
					continue
				}

				if strings.HasPrefix(imgURL, "/") {
					imgURL = baseURL + imgURL
				}

				productURL.Images = append(productURL.Images, SitemapImage{
					Loc:     imgURL,
					Title:   p.Name,
					Caption: caption,
				})
			}

			if len(productURL.Images) == 0 && len(p.Images) > 0 {
				for _, rawImg := range p.Images {
					if rawImg == "" {
						continue
					}
					if strings.HasPrefix(rawImg, "/") {
						rawImg = baseURL + rawImg
					}
					productURL.Images = append(productURL.Images, SitemapImage{
						Loc:     rawImg,
						Title:   p.Name,
						Caption: caption,
					})
				}
			}

			urlSet.URLs = append(urlSet.URLs, productURL)
		}
	}

	writeXML(w, urlSet)
}
