package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// VisitorRepository defines operations for visitor tracking and geo stats
type VisitorRepository interface {
	RecordVisit(ctx context.Context, countryCode string, ip string) error
	GetStats(ctx context.Context) (*entity.VisitorStats, error)
	GetRecentLogs(ctx context.Context, limit int) ([]entity.VisitorLog, error)
}
