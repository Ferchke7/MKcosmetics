package usecase

import (
	"context"
	"fmt"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type AdminUseCase struct {
	productRepo repository.ProductRepository
	visitorRepo repository.VisitorRepository
	channelRepo repository.ChannelRepository
	orderRepo   repository.OrderRepository
}

func NewAdminUseCase(
	productRepo repository.ProductRepository,
	visitorRepo repository.VisitorRepository,
	channelRepo repository.ChannelRepository,
	orderRepo repository.OrderRepository,
) *AdminUseCase {
	return &AdminUseCase{
		productRepo: productRepo,
		visitorRepo: visitorRepo,
		channelRepo: channelRepo,
		orderRepo:   orderRepo,
	}
}

type DashboardStats struct {
	TotalProducts int64                `json:"totalProducts"`
	TotalVisits   int64                `json:"totalVisits"`
	TotalOrders   int64                `json:"totalOrders"`
	OrderCounts   map[string]int       `json:"orderCounts"`
	Countries     []entity.CountryStat `json:"countries"`
	ChannelInfo   *entity.ChannelInfo  `json:"channelInfo"`
	RecentLogs    []entity.VisitorLog  `json:"recentLogs"`
}

func (uc *AdminUseCase) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	prodCount, _ := uc.productRepo.Count(ctx)
	visitorStats, _ := uc.visitorRepo.GetStats(ctx)
	channelInfo, _ := uc.channelRepo.Get(ctx)
	logs, _ := uc.visitorRepo.GetRecentLogs(ctx, 20)
	orderCount, _ := uc.orderRepo.Count(ctx)
	orderCounts, _ := uc.orderRepo.CountByStatus(ctx)

	totalVisits := int64(0)
	var countries []entity.CountryStat
	if visitorStats != nil {
		totalVisits = visitorStats.TotalVisits
		countries = visitorStats.Countries
	}

	return &DashboardStats{
		TotalProducts: int64(prodCount),
		TotalVisits:   totalVisits,
		TotalOrders:   int64(orderCount),
		OrderCounts:   orderCounts,
		Countries:     countries,
		ChannelInfo:   channelInfo,
		RecentLogs:    logs,
	}, nil
}

func (uc *AdminUseCase) CreateProduct(ctx context.Context, post *entity.ProductPost) error {
	if post.ID == "" {
		post.ID = fmt.Sprintf("custom_%d", time.Now().UnixMilli())
	}
	if post.Date == "" {
		post.Date = time.Now().Format(time.RFC3339)
	}
	if post.Timestamp == 0 {
		post.Timestamp = time.Now().UnixMilli()
	}
	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()

	return uc.productRepo.Save(ctx, post)
}

func (uc *AdminUseCase) UpdateProduct(ctx context.Context, post *entity.ProductPost) error {
	post.UpdatedAt = time.Now()
	return uc.productRepo.Save(ctx, post)
}

func (uc *AdminUseCase) DeleteProduct(ctx context.Context, id string) error {
	return uc.productRepo.Delete(ctx, id)
}

func (uc *AdminUseCase) GetVisitorLogs(ctx context.Context, limit int) ([]entity.VisitorLog, error) {
	return uc.visitorRepo.GetRecentLogs(ctx, limit)
}
