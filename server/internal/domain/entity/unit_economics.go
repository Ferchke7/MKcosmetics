package entity

import "time"

// ProductUnitStat holds unit-level economics metrics for a product or variant
type ProductUnitStat struct {
	ProductID          string  `json:"productId"`
	ProductTitle       string  `json:"productTitle"`
	Brand              string  `json:"brand"`
	PhotoURL           string  `json:"photoUrl,omitempty"`
	UnitsSold          int     `json:"unitsSold"`
	TotalRevenueKRW    float64 `json:"totalRevenueKRW"`
	TotalCostKRW       float64 `json:"totalCostKRW"`
	TotalCargoCostKRW  float64 `json:"totalCargoCostKRW"`
	AvgSellingPriceKRW float64 `json:"avgSellingPriceKRW"`
	AvgCostPriceKRW    float64 `json:"avgCostPriceKRW"`
	AvgCargoPerUnitKRW float64 `json:"avgCargoPerUnitKRW"`
	UnitMarginKRW      float64 `json:"unitMarginKRW"`     // AvgSellingPrice - AvgCostPrice - AvgCargoPerUnit
	TotalMarginKRW     float64 `json:"totalMarginKRW"`    // TotalRevenue - TotalCost - TotalCargoCost
	GrossMarginPct     float64 `json:"grossMarginPct"`    // (UnitMargin / AvgSellingPrice) * 100
	MarkupPct          float64 `json:"markupPct"`         // (AvgSellingPrice - AvgCostPrice) / AvgCostPrice * 100
	MarginClass        string  `json:"marginClass"`       // 'high' (>45%), 'standard' (25-45%), 'low' (10-25%), 'loss' (<10%)
	BreakEvenUnits     int     `json:"breakEvenUnits"`    // Estimated units needed to cover fixed overhead
	OrdersCount        int     `json:"ordersCount"`
}

// AbcXyzItem represents a product classified inside the ABC/XYZ profitability and demand volatility matrix
type AbcXyzItem struct {
	ProductID        string  `json:"productId"`
	ProductTitle     string  `json:"productTitle"`
	Brand            string  `json:"brand"`
	UnitsSold        int     `json:"unitsSold"`
	RevenueKRW       float64 `json:"revenueKRW"`
	MarginKRW        float64 `json:"marginKRW"`
	RevenueSharePct  float64 `json:"revenueSharePct"`  // % of total catalog revenue
	CumulativeShare  float64 `json:"cumulativeShare"`  // Running cumulative %
	AbcGroup         string  `json:"abcGroup"`         // 'A' (80%), 'B' (15%), 'C' (5%)
	VariationCoeff   float64 `json:"variationCoeff"`   // Standard deviation / mean demand
	XyzGroup         string  `json:"xyzGroup"`         // 'X' (<10%), 'Y' (10-25%), 'Z' (>25%)
	MatrixCode       string  `json:"matrixCode"`       // e.g. "AX", "AY", "AZ", "BX", "BY", "BZ", "CX", "CY", "CZ"
	Recommendation   string  `json:"recommendation"`   // Strategic inventory action advice
}

// PnLPeriod represents a period row inside the P&L (Income Statement)
type PnLPeriod struct {
	PeriodLabel      string  `json:"periodLabel"`      // e.g. "2026-09", "Неделя 38"
	GrossRevenueKRW  float64 `json:"grossRevenueKRW"`  // Raw catalog sales sum
	DiscountsKRW     float64 `json:"discountsKRW"`     // Promo discounts given
	NetRevenueKRW    float64 `json:"netRevenueKRW"`    // Gross - Discounts
	CogsKRW          float64 `json:"cogsKRW"`          // Cost of goods sold (Korea purchase)
	LogisticsKRW     float64 `json:"logisticsKRW"`     // Cargo freight & air delivery costs
	CommissionsKRW   float64 `json:"commissionsKRW"`   // Payment gateway & sales staff bonuses
	GrossProfitKRW   float64 `json:"grossProfitKRW"`   // Net Revenue - COGS - Logistics
	OperatingProfit  float64 `json:"operatingProfit"`  // Gross Profit - Commissions
	GrossMarginPct   float64 `json:"grossMarginPct"`
	NetMarginPct     float64 `json:"netMarginPct"`
	OrdersCount      int     `json:"ordersCount"`
	UnitsCount       int     `json:"unitsCount"`
}

// CohortData represents a customer acquisition cohort and its retention behavior
type CohortData struct {
	CohortMonth        string    `json:"cohortMonth"`        // e.g. "2026-05"
	NewCustomersCount  int       `json:"newCustomersCount"`  // Customers acquired in this month
	TotalOrders        int       `json:"totalOrders"`
	TotalRevenueKRW    float64   `json:"totalRevenueKRW"`
	AvgCustomerLtvKRW  float64   `json:"avgCustomerLtvKRW"`
	RetentionRates     []float64 `json:"retentionRates"`     // [M0 (100%), M1, M2, M3, M4, M5...]
}

// UnitSaleLedgerItem represents a single item line sold inside a customer order
type UnitSaleLedgerItem struct {
	ID            int64     `json:"id"`
	OrderID       int64     `json:"orderId"`
	OrderNumber   string    `json:"orderNumber"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customerName"`
	Phone         string    `json:"phone"`
	City          string    `json:"city"`
	ProductID     string    `json:"productId"`
	ProductTitle  string    `json:"productTitle"`
	Brand         string    `json:"brand"`
	Quantity      int       `json:"quantity"`
	UnitPriceKRW  float64   `json:"unitPriceKRW"`
	UnitCostKRW   float64   `json:"unitCostKRW"`
	UnitCargoKRW  float64   `json:"unitCargoKRW"`
	UnitMarginKRW float64   `json:"unitMarginKRW"`
	TotalMarginKRW float64  `json:"totalMarginKRW"`
	MarginPct     float64   `json:"marginPct"`
	AssignedTo    string    `json:"assignedTo"`
	PaymentMethod string    `json:"paymentMethod"`
	ChannelSource string    `json:"channelSource"`
}

// UnitEconomicsSummary provides macro-level unit metrics across the selected time period
type UnitEconomicsSummary struct {
	PeriodDays            int     `json:"periodDays"`
	TotalUnitsSold        int     `json:"totalUnitsSold"`
	TotalOrders           int     `json:"totalOrders"`
	TotalRevenueKRW       float64 `json:"totalRevenueKRW"`
	TotalCostKRW          float64 `json:"totalCostKRW"`
	TotalCargoCostKRW     float64 `json:"totalCargoCostKRW"`
	TotalGrossProfitKRW   float64 `json:"totalGrossProfitKRW"`
	AvgSellingPriceKRW    float64 `json:"avgSellingPriceKRW"`    // Revenue / Units
	AvgCostPriceKRW       float64 `json:"avgCostPriceKRW"`       // COGS / Units
	AvgCargoCostPerUnitKRW float64 `json:"avgCargoCostPerUnitKRW"` // Cargo / Units
	AvgMarginPerUnitKRW   float64 `json:"avgMarginPerUnitKRW"`   // Profit / Units
	OverallMarginPct      float64 `json:"overallMarginPct"`      // (Profit / Revenue) * 100
	OverallMarkupPct      float64 `json:"overallMarkupPct"`      // (Revenue - COGS) / COGS * 100
	TopProfitableProduct  string  `json:"topProfitableProduct"`
	TopVolumeProduct      string  `json:"topVolumeProduct"`
}

// UnitEconomicsResponse is the complete payload returned to the frontend
type UnitEconomicsResponse struct {
	Summary              *UnitEconomicsSummary `json:"summary"`
	WaterfallData        []map[string]any      `json:"waterfallData"`
	ProductsEconomics    []*ProductUnitStat    `json:"productsEconomics"`
	AbcXyzMatrix         []*AbcXyzItem         `json:"abcXyzMatrix"`
	AbcXyzCounts         map[string]int        `json:"abcXyzCounts"` // "AX" -> 12, "AY" -> 5...
	PnLStatements        []*PnLPeriod          `json:"pnlStatements"`
	Cohorts              []*CohortData         `json:"cohorts"`
	RecentLedger         []*UnitSaleLedgerItem `json:"recentLedger"`
}

// StaffPayroll represents a calculated payslip and commission record for a staff member
type StaffPayroll struct {
	UserID           int64   `json:"userId"`
	DisplayName      string  `json:"displayName"`
	Role             string  `json:"role"`
	Phone            string  `json:"phone"`
	Period           string  `json:"period"`
	OrdersCount      int     `json:"ordersCount"`
	RevenueGenerated float64 `json:"revenueGenerated"`
	BaseSalary       float64 `json:"baseSalary"`
	CommissionRate   float64 `json:"commissionRate"`
	CommissionAmount float64 `json:"commissionAmount"`
	BonusAmount      float64 `json:"bonusAmount"`
	TotalPayout      float64 `json:"totalPayout"`
}

// SalesLedgerItem represents an accounting line for export
type SalesLedgerItem struct {
	OrderNumber     string  `json:"orderNumber"`
	Date            string  `json:"date"`
	CustomerName    string  `json:"customerName"`
	ChannelSource   string  `json:"channelSource"`
	ProductNames    string  `json:"productNames"`
	ItemsCount      int     `json:"itemsCount"`
	Revenue         float64 `json:"revenue"`
	CostPrice       float64 `json:"costPrice"`
	GrossMargin     float64 `json:"grossMargin"`
	MarginPercent   float64 `json:"marginPercent"`
	AssignedTo      string  `json:"assignedTo"`
	StaffCommission float64 `json:"staffCommission"`
	NetProfit       float64 `json:"netProfit"`
	Status          string  `json:"status"`
}
