package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// CargoRepository defines database operations for cargo flight batches
type CargoRepository interface {
	Create(ctx context.Context, batch *entity.CargoBatch) error
	Update(ctx context.Context, batch *entity.CargoBatch) error
	FindAll(ctx context.Context) ([]*entity.CargoBatch, error)
	FindByID(ctx context.Context, id int64) (*entity.CargoBatch, error)
	FindByBatchCode(ctx context.Context, code string) (*entity.CargoBatch, error)
	UpdateStatus(ctx context.Context, id int64, status string) error
	Delete(ctx context.Context, id int64) error
	Count(ctx context.Context) (int, error)
}
