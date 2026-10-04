package entity

import "time"

type CatalogPhoto struct {
	Full string `json:"full"`
	W600 string `json:"w600"`
	W300 string `json:"w300"`
	W150 string `json:"w150"`
}

type CatalogCategory struct {
	ID        int64  `json:"id"`
	ParentID  int64  `json:"parentId"`
	Title     string `json:"title"`
	Slug      string `json:"slug"`
	Photo     string `json:"photo"`
	Count     int    `json:"count"`
}

type CatalogProduct struct {
	ID              int64          `json:"id"`
	SourceID        int64          `json:"sourceId"`
	Slug            string         `json:"slug"`
	Title           string         `json:"title"`
	Brand           string         `json:"brand"`
	Description     string         `json:"description"`
	Excerpt         string         `json:"excerpt"`
	CategoryID      int64          `json:"categoryId"`
	CategoryTitle   string         `json:"categoryTitle"`
	CategorySlug    string         `json:"categorySlug"`
	PriceKRW        int64          `json:"priceKrw"`
	OldPriceKRW     int64          `json:"oldPriceKrw"`
	DiscountPct     int            `json:"discountPct"`
	Stock           int            `json:"stock"`
	InStock         bool           `json:"inStock"`
	Archived        bool           `json:"archived"`
	Photos          []CatalogPhoto `json:"photos"`
	// Overrides (manual in admin)
	IsHit           bool           `json:"isHit"`
	IsHidden        bool           `json:"isHidden"`
	BrandOverride   string         `json:"brandOverride"`
	ExcerptOverride string         `json:"excerptOverride"`
	SyncedAt        time.Time      `json:"syncedAt"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
}

type CatalogSyncResult struct {
	Added      int       `json:"added"`
	Updated    int       `json:"updated"`
	Archived   int       `json:"archived"`
	Total      int       `json:"total"`
	DurationMs int64     `json:"durationMs"`
	Error      string    `json:"error,omitempty"`
	At         time.Time `json:"at"`
}

type CatalogBrand struct {
	Name  string `json:"name"`
	Slug  string `json:"slug"`
	Count int    `json:"count"`
}
