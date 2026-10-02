package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// OrderRepository defines database operations for CRM orders and leads
type OrderRepository interface {
	Create(ctx context.Context, order *entity.Order) error
	Update(ctx context.Context, order *entity.Order) error
	FindAll(ctx context.Context, status string, search string, limit int, offset int) ([]*entity.Order, int, error)
	FindByID(ctx context.Context, id int64) (*entity.Order, error)
	FindByOrderNumber(ctx context.Context, orderNumber string) (*entity.Order, error)
	UpdateStatus(ctx context.Context, id int64, status string) error
	UpdateNotes(ctx context.Context, id int64, notes string) error
	UpdatePaymentReceipt(ctx context.Context, id int64, receiptURL, paymentMethod string) error
	FindByCargoBatchID(ctx context.Context, batchID int64) ([]*entity.Order, error)
	BulkUpdateStatusByBatchID(ctx context.Context, batchID int64, status string, trackingPrefix string) error
	Delete(ctx context.Context, id int64) error
	Count(ctx context.Context) (int, error)
	CountByStatus(ctx context.Context) (map[string]int, error)
}
