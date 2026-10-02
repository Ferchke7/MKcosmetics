package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// ProductRepository defines storage operations for telegram product posts
type ProductRepository interface {
	Save(ctx context.Context, post *entity.ProductPost) error
	SaveBatch(ctx context.Context, posts []*entity.ProductPost) (int, error)
	FindAll(ctx context.Context) ([]*entity.ProductPost, error)
	FindByID(ctx context.Context, id string) (*entity.ProductPost, error)
	Count(ctx context.Context) (int, error)
}
