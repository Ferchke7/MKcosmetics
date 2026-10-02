package usecase

import (
	"context"
	"fmt"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type CargoUseCase struct {
	cargoRepo repository.CargoRepository
	orderRepo repository.OrderRepository
}

func NewCargoUseCase(cargoRepo repository.CargoRepository, orderRepo repository.OrderRepository) *CargoUseCase {
	return &CargoUseCase{
		cargoRepo: cargoRepo,
		orderRepo: orderRepo,
	}
}

type CreateCargoBatchInput struct {
	Title         string  `json:"title"`
	Origin        string  `json:"origin"`
	Destination   string  `json:"destination"`
	AWBNumber     string  `json:"awbNumber"`
	Carrier       string  `json:"carrier"`
	WeightKg      float64 `json:"weightKg"`
	RatePerKg     float64 `json:"ratePerKg"`
	DepartureDate string  `json:"departureDate"`
	ArrivalDate   string  `json:"arrivalDate"`
	Status        string  `json:"status"`
	Notes         string  `json:"notes"`
	OrderIDs      []int64 `json:"orderIds"`
}

func (uc *CargoUseCase) GetAllBatches(ctx context.Context) ([]*entity.CargoBatch, error) {
	return uc.cargoRepo.FindAll(ctx)
}

func (uc *CargoUseCase) GetBatchByID(ctx context.Context, id int64) (*entity.CargoBatch, []*entity.Order, error) {
	batch, err := uc.cargoRepo.FindByID(ctx, id)
	if err != nil || batch == nil {
		return nil, nil, err
	}
	orders, _ := uc.orderRepo.FindByCargoBatchID(ctx, id)
	return batch, orders, nil
}

func (uc *CargoUseCase) CreateBatch(ctx context.Context, input CreateCargoBatchInput) (*entity.CargoBatch, error) {
	batch := &entity.CargoBatch{
		BatchCode:     fmt.Sprintf("MK-CARGO-%d", time.Now().Unix()%100000),
		Title:         input.Title,
		Origin:        input.Origin,
		Destination:   input.Destination,
		AWBNumber:     input.AWBNumber,
		Carrier:       input.Carrier,
		WeightKg:      input.WeightKg,
		RatePerKg:     input.RatePerKg,
		DepartureDate: input.DepartureDate,
		ArrivalDate:   input.ArrivalDate,
		Status:        input.Status,
		Notes:         input.Notes,
	}
	if batch.Origin == "" {
		batch.Origin = "Seoul (ICN)"
	}
	if batch.Destination == "" {
		batch.Destination = "Tashkent (TAS)"
	}
	if batch.Status == "" {
		batch.Status = "draft"
	}

	if err := uc.cargoRepo.Create(ctx, batch); err != nil {
		return nil, err
	}

	// Link selected orders to this batch
	for _, orderID := range input.OrderIDs {
		if ord, err := uc.orderRepo.FindByID(ctx, orderID); err == nil && ord != nil {
			ord.CargoBatchID = batch.ID
			if batch.AWBNumber != "" && ord.TrackingNumber == "" {
				ord.TrackingNumber = batch.AWBNumber
			}
			_ = uc.orderRepo.Update(ctx, ord)
		}
	}

	return batch, nil
}

func (uc *CargoUseCase) UpdateBatch(ctx context.Context, id int64, input CreateCargoBatchInput) (*entity.CargoBatch, error) {
	batch, err := uc.cargoRepo.FindByID(ctx, id)
	if err != nil || batch == nil {
		return nil, fmt.Errorf("batch not found")
	}

	batch.Title = input.Title
	batch.Origin = input.Origin
	batch.Destination = input.Destination
	batch.AWBNumber = input.AWBNumber
	batch.Carrier = input.Carrier
	batch.WeightKg = input.WeightKg
	batch.RatePerKg = input.RatePerKg
	batch.DepartureDate = input.DepartureDate
	batch.ArrivalDate = input.ArrivalDate
	batch.Status = input.Status
	batch.Notes = input.Notes

	if err := uc.cargoRepo.Update(ctx, batch); err != nil {
		return nil, err
	}

	// If status changed to in_transit or shipped, bulk update linked orders
	if batch.Status == "in_transit" || batch.Status == "arrived" {
		orderStatus := "shipped"
		if batch.Status == "arrived" {
			orderStatus = "delivered"
		}
		_ = uc.orderRepo.BulkUpdateStatusByBatchID(ctx, batch.ID, orderStatus, batch.AWBNumber)
	}

	return batch, nil
}

func (uc *CargoUseCase) AssignOrderToBatch(ctx context.Context, orderID int64, batchID int64) error {
	order, err := uc.orderRepo.FindByID(ctx, orderID)
	if err != nil || order == nil {
		return fmt.Errorf("order not found")
	}
	order.CargoBatchID = batchID
	if batchID > 0 {
		if batch, err := uc.cargoRepo.FindByID(ctx, batchID); err == nil && batch != nil && batch.AWBNumber != "" {
			if order.TrackingNumber == "" {
				order.TrackingNumber = batch.AWBNumber
			}
		}
	}
	return uc.orderRepo.Update(ctx, order)
}

func (uc *CargoUseCase) DeleteBatch(ctx context.Context, id int64) error {
	return uc.cargoRepo.Delete(ctx, id)
}
