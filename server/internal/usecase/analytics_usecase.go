package usecase

import (
	"context"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type AnalyticsUseCase struct {
	orderRepo   repository.OrderRepository
	productRepo repository.ProductRepository
	userRepo    repository.UserRepository
	visitorRepo repository.VisitorRepository
}

func NewAnalyticsUseCase(
	orderRepo repository.OrderRepository,
	productRepo repository.ProductRepository,
	userRepo repository.UserRepository,
	visitorRepo repository.VisitorRepository,
) *AnalyticsUseCase {
	return &AnalyticsUseCase{
		orderRepo:   orderRepo,
		productRepo: productRepo,
		userRepo:    userRepo,
		visitorRepo: visitorRepo,
	}
}

type RevenuePoint struct {
	Date        string  `json:"date"`
	RevenueKRW  float64 `json:"revenueKRW"`
	CostKRW     float64 `json:"costKRW"`
	ProfitKRW   float64 `json:"profitKRW"`
	OrdersCount int     `json:"ordersCount"`
}

type GeoStat struct {
	City        string  `json:"city"`
	OrdersCount int     `json:"ordersCount"`
	RevenueKRW  float64 `json:"revenueKRW"`
	Percentage  float64 `json:"percentage"`
}

type BrandStat struct {
	Brand       string  `json:"brand"`
	UnitsSold   int     `json:"unitsSold"`
	RevenueKRW  float64 `json:"revenueKRW"`
	OrdersCount int     `json:"ordersCount"`
}

type CategoryStat struct {
	Category    string       `json:"category"`
	UnitsSold   int          `json:"unitsSold"`
	RevenueKRW  float64      `json:"revenueKRW"`
	Brands      []*BrandStat `json:"brands"`
}

type PaymentMethodStat struct {
	Method      string  `json:"method"`
	OrdersCount int     `json:"ordersCount"`
	RevenueKRW  float64 `json:"revenueKRW"`
	Percentage  float64 `json:"percentage"`
}

type FunnelStep struct {
	Step        string  `json:"step"`
	Label       string  `json:"label"`
	Count       int     `json:"count"`
	Percentage  float64 `json:"percentage"`
}

type SellerRadarStat struct {
	Username          string   `json:"username"`
	DisplayName       string   `json:"displayName"`
	Role              string   `json:"role"`
	OrdersCount       int      `json:"ordersCount"`
	RevenueKRW        float64  `json:"revenueKRW"`
	PaidCount         int      `json:"paidCount"`
	ShippedCount      int      `json:"shippedCount"`
	AvgTicketKRW      float64  `json:"avgTicketKRW"`
	ConversionPercent float64  `json:"conversionPercent"`
	RadarScores       []int    `json:"radarScores"` // [Revenue, Orders, PaidSpeed, Conversion, AvgTicket] (0-100 scale)
}

type DeepAnalyticsResponse struct {
	PeriodDays        int                  `json:"periodDays"`
	TotalOrders       int                  `json:"totalOrders"`
	TotalRevenueKRW   float64              `json:"totalRevenueKRW"`
	TotalCostKRW      float64              `json:"totalCostKRW"`
	TotalProfitKRW    float64              `json:"totalProfitKRW"`
	AverageOrderKRW   float64              `json:"averageOrderKRW"`
	GrossMarginPct    float64              `json:"grossMarginPct"`
	RevenueTimeline   []*RevenuePoint      `json:"revenueTimeline"`
	GeographyStats    []*GeoStat           `json:"geographyStats"`
	TopBrands         []*BrandStat         `json:"topBrands"`
	CategoryTree      []*CategoryStat      `json:"categoryTree"`
	Heatmap24h7d      [][]int              `json:"heatmap24h7d"` // [dayIndex, hourIndex, count]
	PaymentMethods    []*PaymentMethodStat `json:"paymentMethods"`
	FunnelSteps       []*FunnelStep        `json:"funnelSteps"`
	SellersRadar      []*SellerRadarStat   `json:"sellersRadar"`
}

func (uc *AnalyticsUseCase) GetDeepAnalytics(ctx context.Context, days int) (*DeepAnalyticsResponse, error) {
	if days <= 0 {
		days = 30
	}

	orders, _, err := uc.orderRepo.FindAll(ctx, "", "", 1000, 0)
	if err != nil {
		return nil, err
	}

	users, _ := uc.userRepo.FindAll(ctx)
	userMap := make(map[string]*entity.User)
	for _, u := range users {
		userMap[u.Username] = u
	}

	cutoff := time.Now().AddDate(0, 0, -days)

	var (
		totalOrders     int
		totalRevenueKRW float64
		totalCostKRW    float64
		timelineMap     = make(map[string]*RevenuePoint)
		cityMap         = make(map[string]*GeoStat)
		brandMap        = make(map[string]*BrandStat)
		categoryMap     = make(map[string]*CategoryStat)
		paymentMap      = make(map[string]*PaymentMethodStat)
		statusCounts    = make(map[string]int)
		sellerMap       = make(map[string]*SellerRadarStat)
		heatmapMatrix   = make(map[string]int) // "day-hour" -> count
	)

	// Initialize last N days timeline
	for i := days - 1; i >= 0; i-- {
		dt := time.Now().AddDate(0, 0, -i).Format("2006-01-02")
		timelineMap[dt] = &RevenuePoint{
			Date: dt,
		}
	}

	// Helper city extractor
	extractCity := func(o *entity.Order) string {
		if o.City != "" {
			return o.City
		}
		addr := strings.ToLower(o.ShippingAddress)
		if strings.Contains(addr, "ташкент") || strings.Contains(addr, "tashkent") {
			return "Ташкент"
		}
		if strings.Contains(addr, "самарканд") || strings.Contains(addr, "samarkand") {
			return "Самарканд"
		}
		if strings.Contains(addr, "бухар") || strings.Contains(addr, "bukhara") {
			return "Бухара"
		}
		if strings.Contains(addr, "андижан") || strings.Contains(addr, "andijan") {
			return "Андижан"
		}
		if strings.Contains(addr, "ферган") || strings.Contains(addr, "fergana") {
			return "Фергана"
		}
		if strings.Contains(addr, "наманган") || strings.Contains(addr, "namangan") {
			return "Наманган"
		}
		if strings.Contains(addr, "алмат") || strings.Contains(addr, "almaty") {
			return "Алматы"
		}
		if strings.Contains(addr, "астан") || strings.Contains(addr, "astana") || strings.Contains(addr, "нур-султан") {
			return "Астана"
		}
		if strings.Contains(addr, "шымкент") || strings.Contains(addr, "shymkent") {
			return "Шымкент"
		}
		if strings.Contains(addr, "москв") || strings.Contains(addr, "moscow") {
			return "Москва"
		}
		if strings.Contains(addr, "сеул") || strings.Contains(addr, "seoul") {
			return "Сеул"
		}
		return "Ташкент / Онлайн"
	}

	// Helper category extractor
	detectCategory := func(title string) string {
		t := strings.ToLower(title)
		if strings.Contains(t, "cream") || strings.Contains(t, "крем") {
			return "Кремы для лица"
		}
		if strings.Contains(t, "serum") || strings.Contains(t, "сыворотк") || strings.Contains(t, "ampoule") {
			return "Сыворотки & Ампулы"
		}
		if strings.Contains(t, "toner") || strings.Contains(t, "тонер") || strings.Contains(t, "pad") {
			return "Тонеры & Пэды"
		}
		if strings.Contains(t, "sun") || strings.Contains(t, "spf") || strings.Contains(t, "солнц") {
			return "Солнцезащитные средства SPF"
		}
		if strings.Contains(t, "cleans") || strings.Contains(t, "oil") || strings.Contains(t, "пенк") || strings.Contains(t, "масло") {
			return "Очищение & Демакияж"
		}
		if strings.Contains(t, "mask") || strings.Contains(t, "маск") {
			return "Маски & Патчи"
		}
		return "Уход & Бьюти-боксы"
	}

	// Process orders
	for _, o := range orders {
		statusCounts[o.Status]++

		// Filter for period
		if o.CreatedAt.Before(cutoff) {
			continue
		}

		totalOrders++
		amount := o.TotalAmount
		cost := o.CostPrice
		if cost == 0 && amount > 0 {
			cost = amount * 0.65 // fallback 35% margin default if not explicitly entered
		}

		totalRevenueKRW += amount
		totalCostKRW += cost

		// Timeline
		dt := o.CreatedAt.Format("2006-01-02")
		if pt, exists := timelineMap[dt]; exists {
			pt.RevenueKRW += amount
			pt.CostKRW += cost
			pt.ProfitKRW += (amount - cost)
			pt.OrdersCount++
		}

		// Geography
		city := extractCity(o)
		if _, exists := cityMap[city]; !exists {
			cityMap[city] = &GeoStat{City: city}
		}
		cityMap[city].OrdersCount++
		cityMap[city].RevenueKRW += amount

		// Payment method
		pm := o.PaymentMethod
		if pm == "" {
			pm = "Не указан / Ожидание"
		}
		if _, exists := paymentMap[pm]; !exists {
			paymentMap[pm] = &PaymentMethodStat{Method: pm}
		}
		paymentMap[pm].OrdersCount++
		paymentMap[pm].RevenueKRW += amount

		// Heatmap (day of week: 0=Mon..6=Sun, hour: 0..23)
		weekday := int(o.CreatedAt.Weekday())
		if weekday == 0 {
			weekday = 6 // Sunday is 6
		} else {
			weekday = weekday - 1 // Monday is 0
		}
		hour := o.CreatedAt.Hour()
		hKey := fmt.Sprintf("%d-%d", weekday, hour)
		heatmapMatrix[hKey]++

		// Seller assignment
		assigned := o.AssignedTo
		if assigned == "" {
			assigned = "admin"
		}
		if _, exists := sellerMap[assigned]; !exists {
			dName := assigned
			role := "manager"
			if u, ok := userMap[assigned]; ok {
				if u.DisplayName != "" {
					dName = u.DisplayName
				}
				role = u.Role
			}
			sellerMap[assigned] = &SellerRadarStat{
				Username:    assigned,
				DisplayName: dName,
				Role:        role,
			}
		}
		sStat := sellerMap[assigned]
		sStat.OrdersCount++
		sStat.RevenueKRW += amount
		if o.Status == "paid" || o.Status == "shipped" || o.Status == "delivered" {
			sStat.PaidCount++
		}
		if o.Status == "shipped" || o.Status == "delivered" {
			sStat.ShippedCount++
		}

		// Items & Brands
		for _, item := range o.Items {
			bName := "MK Cosmetics"
			words := strings.Fields(item.Title)
			if len(words) > 0 {
				first := words[0]
				if len(first) > 2 {
					bName = first
				}
			}

			if _, exists := brandMap[bName]; !exists {
				brandMap[bName] = &BrandStat{Brand: bName}
			}
			qty := item.Quantity
			if qty <= 0 {
				qty = 1
			}
			itemTotal := item.Price * float64(qty)
			if itemTotal == 0 {
				itemTotal = amount
			}
			brandMap[bName].UnitsSold += qty
			brandMap[bName].RevenueKRW += itemTotal
			brandMap[bName].OrdersCount++

			// Category
			cat := detectCategory(item.Title)
			if _, exists := categoryMap[cat]; !exists {
				categoryMap[cat] = &CategoryStat{Category: cat}
			}
			categoryMap[cat].UnitsSold += qty
			categoryMap[cat].RevenueKRW += itemTotal
		}
	}

	// Timeline sorted array
	var timelineList []*RevenuePoint
	for _, pt := range timelineMap {
		timelineList = append(timelineList, pt)
	}
	sort.Slice(timelineList, func(i, j int) bool {
		return timelineList[i].Date < timelineList[j].Date
	})

	// Geo stats array
	var geoList []*GeoStat
	for _, g := range cityMap {
		if totalRevenueKRW > 0 {
			g.Percentage = math.Round((g.RevenueKRW/totalRevenueKRW)*1000) / 10
		}
		geoList = append(geoList, g)
	}
	sort.Slice(geoList, func(i, j int) bool {
		return geoList[i].RevenueKRW > geoList[j].RevenueKRW
	})

	// Top brands
	var brandList []*BrandStat
	for _, b := range brandMap {
		brandList = append(brandList, b)
	}
	sort.Slice(brandList, func(i, j int) bool {
		return brandList[i].RevenueKRW > brandList[j].RevenueKRW
	})
	if len(brandList) > 10 {
		brandList = brandList[:10]
	}

	// Categories tree
	var catList []*CategoryStat
	for _, c := range categoryMap {
		catList = append(catList, c)
	}
	sort.Slice(catList, func(i, j int) bool {
		return catList[i].RevenueKRW > catList[j].RevenueKRW
	})

	// Heatmap 2D list
	var heatmapList [][]int
	for d := 0; d < 7; d++ {
		for h := 0; h < 24; h++ {
			k := fmt.Sprintf("%d-%d", d, h)
			heatmapList = append(heatmapList, []int{d, h, heatmapMatrix[k]})
		}
	}

	// Payment methods
	var paymentList []*PaymentMethodStat
	for _, pm := range paymentMap {
		if totalRevenueKRW > 0 {
			pm.Percentage = math.Round((pm.RevenueKRW/totalRevenueKRW)*1000) / 10
		}
		paymentList = append(paymentList, pm)
	}
	sort.Slice(paymentList, func(i, j int) bool {
		return paymentList[i].RevenueKRW > paymentList[j].RevenueKRW
	})

	// Funnel
	totAll := len(orders)
	if totAll == 0 {
		totAll = 1
	}
	funnelSteps := []*FunnelStep{
		{Step: "new", Label: "🟡 Новые заявки", Count: statusCounts["new"] + statusCounts["processing"] + statusCounts["paid"] + statusCounts["shipped"] + statusCounts["delivered"]},
		{Step: "processing", Label: "🔵 В обработке менеджером", Count: statusCounts["processing"] + statusCounts["paid"] + statusCounts["shipped"] + statusCounts["delivered"]},
		{Step: "paid", Label: "🟣 Оплачено (Прикреплен чек)", Count: statusCounts["paid"] + statusCounts["shipped"] + statusCounts["delivered"]},
		{Step: "shipped", Label: "🚚 Отправлено из Сеула", Count: statusCounts["shipped"] + statusCounts["delivered"]},
		{Step: "delivered", Label: "🟢 Успешно вручено клиенту", Count: statusCounts["delivered"]},
	}
	for _, f := range funnelSteps {
		f.Percentage = math.Round((float64(f.Count)/float64(totAll))*1000) / 10
	}

	// Sellers radar
	var sellerList []*SellerRadarStat
	for _, s := range sellerMap {
		if s.OrdersCount > 0 {
			s.AvgTicketKRW = math.Round(s.RevenueKRW / float64(s.OrdersCount))
			s.ConversionPercent = math.Round((float64(s.PaidCount)/float64(s.OrdersCount))*1000) / 10
		}
		// Calculate 0-100 radar scores
		revScore := int(math.Min(100, (s.RevenueKRW/1000000)*20))
		if revScore < 20 && s.RevenueKRW > 0 {
			revScore = 40
		}
		ordScore := int(math.Min(100, float64(s.OrdersCount)*10))
		convScore := int(s.ConversionPercent)
		paidSpeedScore := 80
		avgTicketScore := int(math.Min(100, (s.AvgTicketKRW/200000)*100))

		s.RadarScores = []int{revScore, ordScore, paidSpeedScore, convScore, avgTicketScore}
		sellerList = append(sellerList, s)
	}

	totalProfit := totalRevenueKRW - totalCostKRW
	marginPct := 0.0
	avgOrder := 0.0
	if totalRevenueKRW > 0 {
		marginPct = math.Round((totalProfit/totalRevenueKRW)*1000) / 10
	}
	if totalOrders > 0 {
		avgOrder = math.Round(totalRevenueKRW / float64(totalOrders))
	}

	return &DeepAnalyticsResponse{
		PeriodDays:      days,
		TotalOrders:     totalOrders,
		TotalRevenueKRW: totalRevenueKRW,
		TotalCostKRW:    totalCostKRW,
		TotalProfitKRW:  totalProfit,
		AverageOrderKRW: avgOrder,
		GrossMarginPct:  marginPct,
		RevenueTimeline: timelineList,
		GeographyStats:  geoList,
		TopBrands:       brandList,
		CategoryTree:    catList,
		Heatmap24h7d:    heatmapList,
		PaymentMethods:  paymentList,
		FunnelSteps:     funnelSteps,
		SellersRadar:    sellerList,
	}, nil
}
