package entity

import "time"

// ProductVariant represents a product variation (volume, shade, set packaging)
type ProductVariant struct {
	ID            int64     `json:"id"`
	ProductID     string    `json:"productId"`     // References post ID
	VariantType   string    `json:"variantType"`   // 'volume', 'shade', 'bundle'
	Name          string    `json:"name"`          // e.g. "50 ml", "#21 Light Beige", "Duo Box"
	SKU           string    `json:"sku"`           // e.g. "MED-COL-50ML"
	CostPrice     float64   `json:"costPrice"`     // Purchase cost in KRW
	RetailPrice   float64   `json:"retailPrice"`   // Retail selling price in KRW
	StockQuantity int       `json:"stockQuantity"` // Units in warehouse
	StockStatus   string    `json:"stockStatus"`   // 'in_stock', 'pre_order', 'out_of_stock'
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
