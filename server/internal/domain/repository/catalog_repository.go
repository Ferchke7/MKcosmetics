package repository

import (
	"context"

	"mkcosmetics/server/internal/domain/entity"
)

type CatalogFilter struct {
	CategoryID   *int64
	CategorySlug string
	Brands       []string
	MinPrice     *int64
	MaxPrice     *int64
	InStockOnly  bool
	DiscountOnly bool
	Query        string
	Sort         string // "popular", "newest", "price_asc", "price_desc", "discount", "name_asc"
	Page         int
	PageSize     int
	IncludeAdmin bool // include hidden and archived
}

type CatalogRepository interface {
	UpsertProducts(ctx context.Context, products []entity.CatalogProduct) (added int, updated int, err error)
	UpsertCategories(ctx context.Context, categories []entity.CatalogCategory) error
	ArchiveMissing(ctx context.Context, currentSourceIDs []int64) (archived int, err error)
	List(ctx context.Context, filter CatalogFilter) (products []entity.CatalogProduct, total int, err error)
	GetBySlug(ctx context.Context, slug string) (*entity.CatalogProduct, error)
	GetByID(ctx context.Context, id int64) (*entity.CatalogProduct, error)
	GetByIDs(ctx context.Context, ids []int64) ([]entity.CatalogProduct, error)
	GetCategories(ctx context.Context) ([]entity.CatalogCategory, error)
	GetBrands(ctx context.Context) ([]entity.CatalogBrand, error)
	GetHits(ctx context.Context, limit int) ([]entity.CatalogProduct, error)
	GetSets(ctx context.Context, limit int) ([]entity.CatalogProduct, error)
	GetRelated(ctx context.Context, categoryID int64, currentID int64, limit int) ([]entity.CatalogProduct, error)
	UpdateOverrides(ctx context.Context, id int64, isHit *bool, isHidden *bool, brandOverride *string, excerptOverride *string) error
	LogSync(ctx context.Context, res entity.CatalogSyncResult) error
	GetLatestSyncLogs(ctx context.Context, limit int) ([]entity.CatalogSyncResult, error)
	GetCatalogStats(ctx context.Context) (total int, inStock int, hits int, hidden int, archived int, err error)
}
