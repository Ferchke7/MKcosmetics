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
	CustomerName      string             `json:"customerName"`
	Phone             string             `json:"phone"`
	ChannelSource     string             `json:"channelSource"`
	Type              string             `json:"type"`
	Items             []entity.OrderItem `json:"items"`
	TotalAmount       float64            `json:"totalAmount"`
	Currency          string             `json:"currency"`
	PaymentReceiptURL string             `json:"paymentReceiptUrl"`
	PaymentMethod     string             `json:"paymentMethod"`
	TrackingNumber    string             `json:"trackingNumber"`
	ShippingAddress   string             `json:"shippingAddress"`
	Notes             string             `json:"notes"`
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
		OrderNumber:       orderNumber,
		CustomerName:      strings.TrimSpace(input.CustomerName),
		Phone:             strings.TrimSpace(input.Phone),
		ChannelSource:     input.ChannelSource,
		Type:              input.Type,
		Items:             input.Items,
		TotalAmount:       input.TotalAmount,
		Currency:          input.Currency,
		Status:            "new",
		PaymentReceiptURL: strings.TrimSpace(input.PaymentReceiptURL),
		PaymentMethod:     strings.TrimSpace(input.PaymentMethod),
		TrackingNumber:    strings.TrimSpace(input.TrackingNumber),
		ShippingAddress:   strings.TrimSpace(input.ShippingAddress),
		Notes:             strings.TrimSpace(input.Notes),
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

type ProcessOrderInput struct {
	ID                int64              `json:"id"`
	CustomerName      string             `json:"customerName"`
	Phone             string             `json:"phone"`
	Status            string             `json:"status"`
	PaymentReceiptURL string             `json:"paymentReceiptUrl"`
	PaymentMethod     string             `json:"paymentMethod"`
	TrackingNumber    string             `json:"trackingNumber"`
	ShippingAddress   string             `json:"shippingAddress"`
	Notes             string             `json:"notes"`
	Items             []entity.OrderItem `json:"items,omitempty"`
	TotalAmount       *float64           `json:"totalAmount,omitempty"`
	Currency          string             `json:"currency,omitempty"`
}

func (uc *OrderUseCase) ProcessOrder(ctx context.Context, input ProcessOrderInput) (*entity.Order, error) {
	order, err := uc.orderRepo.FindByID(ctx, input.ID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("заказ не найден")
	}

	if input.CustomerName != "" {
		order.CustomerName = strings.TrimSpace(input.CustomerName)
	}
	if input.Phone != "" {
		order.Phone = strings.TrimSpace(input.Phone)
	}
	if input.Status != "" {
		validStatuses := map[string]bool{
			"new":        true,
			"processing": true,
			"paid":       true,
			"shipped":    true,
			"delivered":  true,
			"cancelled":  true,
		}
		if !validStatuses[input.Status] {
			return nil, errors.New("неверный статус заказа")
		}
		order.Status = input.Status
	}

	if input.PaymentReceiptURL != "" {
		order.PaymentReceiptURL = strings.TrimSpace(input.PaymentReceiptURL)
	}
	if input.PaymentMethod != "" {
		order.PaymentMethod = strings.TrimSpace(input.PaymentMethod)
	}
	if input.TrackingNumber != "" {
		order.TrackingNumber = strings.TrimSpace(input.TrackingNumber)
	}
	if input.ShippingAddress != "" {
		order.ShippingAddress = strings.TrimSpace(input.ShippingAddress)
	}
	if input.Notes != "" {
		order.Notes = strings.TrimSpace(input.Notes)
	}
	if len(input.Items) > 0 {
		order.Items = input.Items
	}
	if input.TotalAmount != nil {
		order.TotalAmount = *input.TotalAmount
	}
	if input.Currency != "" {
		order.Currency = input.Currency
	}

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

func (uc *OrderUseCase) AttachPaymentReceipt(ctx context.Context, id int64, receiptURL, paymentMethod string) error {
	return uc.orderRepo.UpdatePaymentReceipt(ctx, id, strings.TrimSpace(receiptURL), strings.TrimSpace(paymentMethod))
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
