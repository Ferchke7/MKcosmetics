package repository

import (
	"context"

	"mkcosmetics/server/internal/domain/entity"
)

type CustomerRepository interface {
	GetAll(ctx context.Context, filter entity.CustomerFilter) ([]entity.Customer, int, error)
	GetByID(ctx context.Context, id int64) (*entity.Customer, error)
	GetByPhone(ctx context.Context, phone string) (*entity.Customer, error)
	UpsertFromOrder(ctx context.Context, customer entity.Customer) (*entity.Customer, error)
	Update(ctx context.Context, customer entity.Customer) error
	Delete(ctx context.Context, id int64) error
	GetStats(ctx context.Context) (totalCustomers int, vipCount int, totalSpent float64, avgLTV float64, err error)
}
