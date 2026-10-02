package usecase

import (
	"context"
	"fmt"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type VariantUseCase struct {
	variantRepo repository.VariantRepository
}

func NewVariantUseCase(variantRepo repository.VariantRepository) *VariantUseCase {
	return &VariantUseCase{variantRepo: variantRepo}
}

func (uc *VariantUseCase) GetVariantsByProduct(ctx context.Context, productID string) ([]*entity.ProductVariant, error) {
	return uc.variantRepo.FindByProductID(ctx, productID)
}

func (uc *VariantUseCase) GetAllVariants(ctx context.Context) ([]*entity.ProductVariant, error) {
	return uc.variantRepo.FindAll(ctx)
}

func (uc *VariantUseCase) CreateVariant(ctx context.Context, variant *entity.ProductVariant) error {
	if variant.ProductID == "" {
		return fmt.Errorf("productId is required")
	}
	if variant.Name == "" {
		return fmt.Errorf("variant name is required")
	}
	return uc.variantRepo.Create(ctx, variant)
}

func (uc *VariantUseCase) UpdateVariant(ctx context.Context, variant *entity.ProductVariant) error {
	if variant.ID <= 0 {
		return fmt.Errorf("invalid variant ID")
	}
	return uc.variantRepo.Update(ctx, variant)
}

func (uc *VariantUseCase) UpdateStock(ctx context.Context, id int64, quantity int, status string) error {
	return uc.variantRepo.UpdateStock(ctx, id, quantity, status)
}

func (uc *VariantUseCase) DeleteVariant(ctx context.Context, id int64) error {
	return uc.variantRepo.Delete(ctx, id)
}
