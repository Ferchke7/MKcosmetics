package bcatalog

import (
	"html"
	"regexp"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
)

var tagRegex = regexp.MustCompile(`<[^>]*>`)
var spaceRegex = regexp.MustCompile(`\s+`)

func CleanText(raw string) string {
	decoded := html.UnescapeString(raw)
	withoutTags := tagRegex.ReplaceAllString(decoded, " ")
	clean := spaceRegex.ReplaceAllString(withoutTags, " ")
	return strings.TrimSpace(clean)
}

func MakeExcerpt(description string, maxLen int) string {
	clean := CleanText(description)
	if len([]rune(clean)) <= maxLen {
		return clean
	}
	runes := []rune(clean)
	return string(runes[:maxLen]) + "..."
}

func MapRawProductToEntity(raw RawProduct) entity.CatalogProduct {
	brand := ExtractBrand(raw.Title)
	cleanDesc := html.UnescapeString(raw.Description)
	excerpt := MakeExcerpt(cleanDesc, 140)

	discountPct := 0
	if raw.OldPrice > raw.Price && raw.OldPrice > 0 {
		discountPct = int(float64(raw.OldPrice-raw.Price) / float64(raw.OldPrice) * 100)
	}

	var photos []entity.CatalogPhoto
	for _, p := range raw.Photos {
		fullUrl := p.URL
		w600 := p.Preview600.URL
		if w600 == "" {
			w600 = fullUrl
		}
		w300 := p.Preview300.URL
		if w300 == "" {
			w300 = w600
		}
		w150 := p.Preview150.URL
		if w150 == "" {
			w150 = w300
		}

		photos = append(photos, entity.CatalogPhoto{
			Full: fullUrl,
			W600: w600,
			W300: w300,
			W150: w150,
		})
	}

	catTitle := ""
	catSlug := ""
	if raw.Category != nil {
		catTitle = raw.Category.Title
		catSlug = raw.Category.Slug
	}

	inStock := raw.Amount > 0 && !raw.Archive

	now := time.Now()

	return entity.CatalogProduct{
		SourceID:      raw.ID,
		Slug:          raw.Slug,
		Title:         strings.TrimSpace(raw.Title),
		Brand:         brand,
		Description:   cleanDesc,
		Excerpt:       excerpt,
		CategoryID:    raw.CategoryID,
		CategoryTitle: catTitle,
		CategorySlug:  catSlug,
		PriceKRW:      raw.Price,
		OldPriceKRW:   raw.OldPrice,
		DiscountPct:   discountPct,
		Stock:         raw.Amount,
		InStock:       inStock,
		Archived:      raw.Archive,
		Photos:        photos,
		SyncedAt:      now,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
}

func MapRawCategoryToEntity(raw RawCategory) entity.CatalogCategory {
	var parentID int64
	if raw.CategoryID != nil {
		parentID = *raw.CategoryID
	}

	photoUrl := ""
	if len(raw.Photos) > 0 {
		photoUrl = raw.Photos[0].URL
		if raw.Photos[0].Preview600.URL != "" {
			photoUrl = raw.Photos[0].Preview600.URL
		}
	}

	return entity.CatalogCategory{
		ID:       raw.ID,
		ParentID: parentID,
		Title:    strings.TrimSpace(raw.Title),
		Slug:     raw.Slug,
		Photo:    photoUrl,
		Count:    raw.ProductsCount,
	}
}
