package usecase

import (
	"bytes"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/excel"
	"mkcosmetics/server/internal/infrastructure/telegram"
)

type OrderUseCase struct {
	orderRepo     repository.OrderRepository
	customerRepo  repository.CustomerRepository
	excelExporter *excel.ExcelExporter
	botService    *telegram.BotService
}

func NewOrderUseCase(
	orderRepo repository.OrderRepository,
	customerRepo repository.CustomerRepository,
	excelExporter *excel.ExcelExporter,
	botService *telegram.BotService,
) *OrderUseCase {
	return &OrderUseCase{
		orderRepo:     orderRepo,
		customerRepo:  customerRepo,
		excelExporter: excelExporter,
		botService:    botService,
	}
}

type CreateOrderInput struct {
	CustomerName      string             `json:"customerName"`
	Phone             string             `json:"phone"`
	ChannelSource     string             `json:"channelSource"`
	Type              string             `json:"type"`
	Items             []entity.OrderItem `json:"items"`
	TotalAmount       float64            `json:"totalAmount"`
	CostPrice         float64            `json:"costPrice"`
	Currency          string             `json:"currency"`
	PaymentReceiptURL string             `json:"paymentReceiptUrl"`
	PaymentMethod     string             `json:"paymentMethod"`
	TrackingNumber    string             `json:"trackingNumber"`
	ShippingAddress   string             `json:"shippingAddress"`
	City              string             `json:"city"`
	AssignedTo        string             `json:"assignedTo"`
	CargoBatchID      int64              `json:"cargoBatchId"`
	Notes             string             `json:"notes"`
}

func (uc *OrderUseCase) CreateOrder(ctx context.Context, input CreateOrderInput) (*entity.Order, error) {
	if strings.TrimSpace(input.CustomerName) == "" {
		input.CustomerName = "Покупатель"
	}
	if strings.TrimSpace(input.Phone) == "" {
		input.Phone = "Не указан"
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
		CostPrice:         input.CostPrice,
		Currency:          input.Currency,
		Status:            "new",
		PaymentReceiptURL: strings.TrimSpace(input.PaymentReceiptURL),
		PaymentMethod:     strings.TrimSpace(input.PaymentMethod),
		TrackingNumber:    strings.TrimSpace(input.TrackingNumber),
		ShippingAddress:   strings.TrimSpace(input.ShippingAddress),
		City:              strings.TrimSpace(input.City),
		AssignedTo:        strings.TrimSpace(input.AssignedTo),
		CargoBatchID:      input.CargoBatchID,
		Notes:             strings.TrimSpace(input.Notes),
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	// 1. Auto sync with CRM customer record
	if uc.customerRepo != nil && order.Phone != "" {
		_, _ = uc.customerRepo.UpsertFromOrder(ctx, entity.Customer{
			Name:            order.CustomerName,
			Phone:           order.Phone,
			City:            order.City,
			DeliveryAddress: order.ShippingAddress,
			TotalOrders:     1,
			TotalSpent:      order.TotalAmount,
		})
	}

	// 2. Auto dispatch real-time Telegram Bot Notification to Admin/Manager Chat!
	if uc.botService != nil {
		go func(ord *entity.Order) {
			_ = uc.botService.SendOrderNotification(context.Background(), ord, "")
		}(order)
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
	City              string             `json:"city"`
	AssignedTo        string             `json:"assignedTo"`
	CargoBatchID      *int64             `json:"cargoBatchId,omitempty"`
	Notes             string             `json:"notes"`
	Items             []entity.OrderItem `json:"items,omitempty"`
	TotalAmount       *float64           `json:"totalAmount,omitempty"`
	CostPrice         *float64           `json:"costPrice,omitempty"`
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
	if input.City != "" {
		order.City = strings.TrimSpace(input.City)
	}
	if input.AssignedTo != "" {
		order.AssignedTo = strings.TrimSpace(input.AssignedTo)
	}
	if input.CargoBatchID != nil {
		order.CargoBatchID = *input.CargoBatchID
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
	if input.CostPrice != nil {
		order.CostPrice = *input.CostPrice
	}
	if input.Currency != "" {
		order.Currency = input.Currency
	}

	order.UpdatedAt = time.Now()

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

func (uc *OrderUseCase) GetOrderByID(ctx context.Context, id int64) (*entity.Order, error) {
	return uc.orderRepo.FindByID(ctx, id)
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

func (uc *OrderUseCase) UpdateStatusFromTelegram(ctx context.Context, orderID int64, newStatus string, managerName string) (*entity.Order, error) {
	order, err := uc.orderRepo.FindByID(ctx, orderID)
	if err != nil || order == nil {
		return nil, errors.New("order not found")
	}

	order.Status = newStatus
	if order.AssignedTo == "" && managerName != "" {
		order.AssignedTo = managerName
	}
	order.UpdatedAt = time.Now()

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

func (uc *OrderUseCase) AssignManagerFromTelegram(ctx context.Context, orderID int64, managerName string) (*entity.Order, error) {
	order, err := uc.orderRepo.FindByID(ctx, orderID)
	if err != nil || order == nil {
		return nil, errors.New("order not found")
	}

	order.AssignedTo = managerName
	if order.Status == "new" {
		order.Status = "processing"
	}
	order.UpdatedAt = time.Now()

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

func (uc *OrderUseCase) UpdateNotes(ctx context.Context, id int64, notes string) error {
	return uc.orderRepo.UpdateNotes(ctx, id, notes)
}

func (uc *OrderUseCase) DeleteOrder(ctx context.Context, id int64) error {
	return uc.orderRepo.Delete(ctx, id)
}

func (uc *OrderUseCase) ExportOrdersCSV(ctx context.Context, status, search string) ([]byte, error) {
	orders, _, err := uc.orderRepo.FindAll(ctx, status, search, 5000, 0)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	buf.WriteString("\xEF\xBB\xBF")

	writer := csv.NewWriter(&buf)
	writer.Comma = ';'

	header := []string{
		"Номер заказа",
		"Дата создания",
		"Клиент",
		"Телефон",
		"Состав заказа",
		"Сумма заказа",
		"Себестоимость",
		"Валюта",
		"Статус",
		"Способ оплаты",
		"Чек прикреплен",
		"Трек-номер",
		"Адрес доставки",
		"Город / Регион",
		"Ответственный менеджер",
		"Карго партия",
		"Заметки",
	}
	_ = writer.Write(header)

	statusLabels := map[string]string{
		"new":        "Новый",
		"processing": "В обработке",
		"paid":       "Оплачен",
		"shipped":    "Отправлен из Кореи",
		"delivered":  "Доставлен клиенту",
		"cancelled":  "Отменен",
	}

	for _, o := range orders {
		var itemTitles []string
		for _, item := range o.Items {
			itemTitles = append(itemTitles, fmt.Sprintf("%s (%d шт.)", item.Title, item.Quantity))
		}
		itemsStr := strings.Join(itemTitles, ", ")

		hasReceipt := "Нет"
		if o.PaymentReceiptURL != "" {
			hasReceipt = "Да (чек загружен)"
		}

		st := statusLabels[o.Status]
		if st == "" {
			st = o.Status
		}

		cargoID := ""
		if o.CargoBatchID > 0 {
			cargoID = fmt.Sprintf("Рейс #%d", o.CargoBatchID)
		}

		row := []string{
			o.OrderNumber,
			o.CreatedAt.Format("2006-01-02 15:04:05"),
			o.CustomerName,
			o.Phone,
			itemsStr,
			fmt.Sprintf("%.2f", o.TotalAmount),
			fmt.Sprintf("%.2f", o.CostPrice),
			o.Currency,
			st,
			o.PaymentMethod,
			hasReceipt,
			o.TrackingNumber,
			o.ShippingAddress,
			o.City,
			o.AssignedTo,
			cargoID,
			o.Notes,
		}
		_ = writer.Write(row)
	}

	writer.Flush()
	return buf.Bytes(), nil
}

func (uc *OrderUseCase) ExportOrdersXLSX(ctx context.Context, status, search string) ([]byte, error) {
	orders, _, err := uc.orderRepo.FindAll(ctx, status, search, 10000, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch orders for export: %w", err)
	}
	return uc.excelExporter.ExportOrdersXLSX(orders)
}
