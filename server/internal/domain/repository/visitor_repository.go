package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// RecordVisitParams contains details of an incoming visitor
type RecordVisitParams struct {
	IP          string
	CountryCode string
	CountryName string
	City        string
	Flag        string
	UserAgent   string
	Path        string
}

// VisitorRepository defines operations for visitor tracking and geo stats
type VisitorRepository interface {
	RecordVisit(ctx context.Context, params RecordVisitParams) error
	GetStats(ctx context.Context) (*entity.VisitorStats, error)
	GetRecentLogs(ctx context.Context, limit int) ([]entity.VisitorLog, error)
}
