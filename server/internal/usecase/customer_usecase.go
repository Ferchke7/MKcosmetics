package usecase

import (
	"context"
	"fmt"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/excel"
)

type CustomerUseCase struct {
	repo          repository.CustomerRepository
	excelExporter *excel.ExcelExporter
}

func NewCustomerUseCase(repo repository.CustomerRepository, excelExporter *excel.ExcelExporter) *CustomerUseCase {
	return &CustomerUseCase{
		repo:          repo,
		excelExporter: excelExporter,
	}
}

func (u *CustomerUseCase) GetAll(ctx context.Context, filter entity.CustomerFilter) ([]entity.Customer, int, error) {
	return u.repo.GetAll(ctx, filter)
}

func (u *CustomerUseCase) GetByID(ctx context.Context, id int64) (*entity.Customer, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *CustomerUseCase) Update(ctx context.Context, customer entity.Customer) error {
	return u.repo.Update(ctx, customer)
}

func (u *CustomerUseCase) Delete(ctx context.Context, id int64) error {
	return u.repo.Delete(ctx, id)
}

func (u *CustomerUseCase) GetCRMStats(ctx context.Context) (map[string]interface{}, error) {
	totalCustomers, vipCount, totalSpent, avgLTV, err := u.repo.GetStats(ctx)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"totalCustomers": totalCustomers,
		"vipCustomers":   vipCount,
		"totalRevenue":   totalSpent,
		"averageLTV":     avgLTV,
	}, nil
}

func (u *CustomerUseCase) ExportCustomersXLSX(ctx context.Context, filter entity.CustomerFilter) ([]byte, error) {
	filter.Limit = 10000 // Get all for export
	filter.Offset = 0
	customers, _, err := u.repo.GetAll(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch customers for export: %w", err)
	}
	return u.excelExporter.ExportCustomersXLSX(customers)
}
