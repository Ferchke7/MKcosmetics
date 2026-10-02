package entity

import "time"

// CargoBatch represents a freight shipment batch/flight from Seoul to destination
type CargoBatch struct {
	ID            int64     `json:"id"`
	BatchCode     string    `json:"batchCode"` // e.g. "MK-CARGO-2026-01"
	Title         string    `json:"title"`     // e.g. "Рейс Сеул (Инчхон) -> Ташкент #01"
	Origin        string    `json:"origin"`    // e.g. "Seoul (ICN)"
	Destination   string    `json:"destination"` // e.g. "Tashkent (TAS)"
	AWBNumber     string    `json:"awbNumber"` // Air Waybill number / Cargo tracking
	Carrier       string    `json:"carrier"`   // e.g. "Asiana Cargo", "Silk Road Cargo"
	WeightKg      float64   `json:"weightKg"`
	RatePerKg     float64   `json:"ratePerKg"` // Rate in USD or KRW per kg
	DepartureDate string    `json:"departureDate"`
	ArrivalDate   string    `json:"arrivalDate"`
	Status        string    `json:"status"` // 'draft', 'in_transit', 'customs', 'arrived', 'completed'
	OrderCount    int       `json:"orderCount"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
