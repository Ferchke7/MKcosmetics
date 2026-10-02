package entity

import "time"

// OrderItem represents a single product item inside an order
type OrderItem struct {
	ProductID string  `json:"productId"`
	Title     string  `json:"title"`
	Price     float64 `json:"price"`
	Currency  string  `json:"currency"`
	Quantity  int     `json:"quantity"`
	PhotoURL  string  `json:"photoUrl,omitempty"`
}

// Order represents a CRM lead or e-commerce purchase order
type Order struct {
	ID                int64       `json:"id"`
	OrderNumber       string      `json:"orderNumber"`
	CustomerName      string      `json:"customerName"`
	Phone             string      `json:"phone"`
	ChannelSource     string      `json:"channelSource"` // 'web', 'whatsapp', 'telegram', 'quiz'
	Type              string      `json:"type"`          // 'order', 'quick_order', 'cart', 'quiz_consultation'
	Items             []OrderItem `json:"items"`
	TotalAmount       float64     `json:"totalAmount"`
	CostPrice         float64     `json:"costPrice"` // Purchase cost in KRW for margin calculation
	Currency          string      `json:"currency"`
	Status            string      `json:"status"` // 'new', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'
	PaymentReceiptURL string      `json:"paymentReceiptUrl"`
	PaymentMethod     string      `json:"paymentMethod"`
	TrackingNumber    string      `json:"trackingNumber"`
	ShippingAddress   string      `json:"shippingAddress"`
	City              string      `json:"city"`
	AssignedTo        string      `json:"assignedTo"`   // Manager username
	CargoBatchID      int64       `json:"cargoBatchId"` // Linked shipment flight
	Notes             string      `json:"notes"`
	CreatedAt         time.Time   `json:"createdAt"`
	UpdatedAt         time.Time   `json:"updatedAt"`
}
