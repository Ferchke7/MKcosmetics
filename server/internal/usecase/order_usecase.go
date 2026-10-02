package usecase

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type OrderUseCase struct {
	orderRepo repository.OrderRepository
}

func NewOrderUseCase(orderRepo repository.OrderRepository) *OrderUseCase {
	return &OrderUseCase{
		orderRepo: orderRepo,
	}
}

type CreateOrderInput struct {
	CustomerName  string             `json:"customerName"`
	Phone         string             `json:"phone"`
	ChannelSource string             `json:"channelSource"`
	Type          string             `json:"type"`
	Items         []entity.OrderItem `json:"items"`
	TotalAmount   float64            `json:"totalAmount"`
	Currency      string             `json:"currency"`
	Notes         string             `json:"notes"`
}

func (uc *OrderUseCase) CreateOrder(ctx context.Context, input CreateOrderInput) (*entity.Order, error) {
	if strings.TrimSpace(input.CustomerName) == "" {
		input.CustomerName = "Покупатель"
	}
	if strings.TrimSpace(input.Phone) == "" {
		return nil, errors.New("укажите номер телефона или WhatsApp")
	}
	if input.Currency == "" {
		input.Currency = "UZS"
	}
	if input.ChannelSource == "" {
		input.ChannelSource = "web"
	}
	if input.Type == "" {
		input.Type = "order"
	}

	// Generate human-friendly order number: MK-74829
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	orderNumber := fmt.Sprintf("MK-%05d", r.Intn(100000))

	order := &entity.Order{
		OrderNumber:   orderNumber,
		CustomerName:  strings.TrimSpace(input.CustomerName),
		Phone:         strings.TrimSpace(input.Phone),
		ChannelSource: input.ChannelSource,
		Type:          input.Type,
		Items:         input.Items,
		TotalAmount:   input.TotalAmount,
		Currency:      input.Currency,
		Status:        "new",
		Notes:         strings.TrimSpace(input.Notes),
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

type OrderListResponse struct {
	Orders []*entity.Order `json:"orders"`
	Total  int             `json:"total"`
	Counts map[string]int  `json:"statusCounts"`
}

func (uc *OrderUseCase) GetOrders(ctx context.Context, status, search string, limit, offset int) (*OrderListResponse, error) {
	orders, total, err := uc.orderRepo.FindAll(ctx, status, search, limit, offset)
	if err != nil {
		return nil, err
	}

	counts, err := uc.orderRepo.CountByStatus(ctx)
	if err != nil {
		counts = make(map[string]int)
	}

	return &OrderListResponse{
		Orders: orders,
		Total:  total,
		Counts: counts,
	}, nil
}

func (uc *OrderUseCase) GetOrderByNumber(ctx context.Context, orderNumber string) (*entity.Order, error) {
	return uc.orderRepo.FindByOrderNumber(ctx, strings.TrimSpace(orderNumber))
}

func (uc *OrderUseCase) UpdateStatus(ctx context.Context, id int64, status string) error {
	validStatuses := map[string]bool{
		"new":        true,
		"processing": true,
		"paid":       true,
		"shipped":    true,
		"delivered":  true,
		"cancelled":  true,
	}
	if !validStatuses[status] {
		return errors.New("неверный статус заказа")
	}
	return uc.orderRepo.UpdateStatus(ctx, id, status)
}

func (uc *OrderUseCase) UpdateNotes(ctx context.Context, id int64, notes string) error {
	return uc.orderRepo.UpdateNotes(ctx, id, notes)
}

func (uc *OrderUseCase) DeleteOrder(ctx context.Context, id int64) error {
	return uc.orderRepo.Delete(ctx, id)
}
