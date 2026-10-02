package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// VariantRepository defines database operations for product variants (SKUs)
type VariantRepository interface {
	Create(ctx context.Context, variant *entity.ProductVariant) error
	Update(ctx context.Context, variant *entity.ProductVariant) error
	FindByProductID(ctx context.Context, productID string) ([]*entity.ProductVariant, error)
	FindByID(ctx context.Context, id int64) (*entity.ProductVariant, error)
	FindAll(ctx context.Context) ([]*entity.ProductVariant, error)
	UpdateStock(ctx context.Context, id int64, stockQuantity int, stockStatus string) error
	Delete(ctx context.Context, id int64) error
}
