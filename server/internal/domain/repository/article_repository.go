package repository

import (
	"context"

	"mkcosmetics/server/internal/domain/entity"
)

type ArticleRepository interface {
	GetAll(ctx context.Context, filter entity.ArticleFilter) ([]entity.Article, int, error)
	GetByID(ctx context.Context, id string) (*entity.Article, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Article, error)
	Upsert(ctx context.Context, article entity.Article) error
	IncrementViews(ctx context.Context, id string) error
	Delete(ctx context.Context, id string) error
}
