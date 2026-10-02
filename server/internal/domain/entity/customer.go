package entity

import "time"

// Customer represents a retail or wholesale client in the CRM system
type Customer struct {
	ID                int64     `json:"id"`
	Name              string    `json:"name"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	TelegramUsername  string    `json:"telegramUsername"`
	City              string    `json:"city"`
	DeliveryAddress   string    `json:"deliveryAddress"`
	TotalOrders       int       `json:"totalOrders"`
	TotalSpent        float64   `json:"totalSpent"`
	AverageOrderValue float64   `json:"averageOrderValue"`
	LastOrderAt       *time.Time `json:"lastOrderAt,omitempty"`
	Segment           string    `json:"segment"` // "vip", "regular", "new", "inactive"
	Notes             string    `json:"notes"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type CustomerFilter struct {
	Search  string `json:"search"`
	Segment string `json:"segment"`
	City    string `json:"city"`
	Limit   int    `json:"limit"`
	Offset  int    `json:"offset"`
}
