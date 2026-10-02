package entity

import (
	"time"
)

// Prices represents multi-currency prices for a product post
type Prices struct {
	KRW *int     `json:"krw,omitempty"`
	RUB *int     `json:"rub,omitempty"`
	USD *float64 `json:"usd,omitempty"`
	EUR *float64 `json:"eur,omitempty"`
	KZT *int     `json:"kzt,omitempty"`
	UZS *int     `json:"uzs,omitempty"`
}

// ProductPost represents a scraped cosmetic item from Telegram channel
type ProductPost struct {
	ID              string    `json:"id"`
	PostURL         string    `json:"postUrl"`
	Date            string    `json:"date"`
	Timestamp       int64     `json:"timestamp"`
	ProductTitle    string    `json:"productTitle"`
	Brand           string    `json:"brand"`
	Text            string    `json:"text"`
	Prices          Prices    `json:"prices"`
	Photos          []string  `json:"photos"`
	Tags            []string  `json:"tags"`
	DiscountPercent int       `json:"discountPercent"`
	IsBestseller    bool      `json:"isBestseller"`
	Views           int       `json:"views"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
