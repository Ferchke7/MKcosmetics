package usecase

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"math"
	"sort"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/excel"
	"mkcosmetics/server/internal/infrastructure/persistence/sqlite"
)

type StaffUseCase struct {
	userRepo      repository.UserRepository
	orderRepo     repository.OrderRepository
	excelExporter *excel.ExcelExporter
}

func NewStaffUseCase(
	userRepo repository.UserRepository,
	orderRepo repository.OrderRepository,
	excelExporter *excel.ExcelExporter,
) *StaffUseCase {
	return &StaffUseCase{
		userRepo:      userRepo,
		orderRepo:     orderRepo,
		excelExporter: excelExporter,
	}
}

type CreateStaffInput struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Phone       string `json:"phone"`
	Password    string `json:"password"`
	Role        string `json:"role"` // 'admin', 'manager', 'logistics'
	IsActive    bool   `json:"isActive"`
}

type StaffMemberResponse struct {
	ID          int64  `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Phone       string `json:"phone"`
	Role        string `json:"role"`
	IsActive    bool   `json:"isActive"`
	OrdersCount int    `json:"ordersCount"`
	PaidCount   int    `json:"paidCount"`
}

type StaffPayrollOrder struct {
	ID            int64     `json:"id"`
	OrderNumber   string    `json:"orderNumber"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customerName"`
	City          string    `json:"city"`
	TotalAmount   float64   `json:"totalAmount"`
	TotalKRW      float64   `json:"totalKRW"`
	TotalUZS      float64   `json:"totalUZS"`
	CostPriceKRW  float64   `json:"costPriceKRW"`
	MarginKRW     float64   `json:"marginKRW"`
	MarginUZS     float64   `json:"marginUZS"`
	Status        string    `json:"status"`
	PaymentMethod string    `json:"paymentMethod"`
}

type StaffPayrollSummary struct {
	Username            string               `json:"username"`
	DisplayName         string               `json:"displayName"`
	Phone               string               `json:"phone"`
	Role                string               `json:"role"`
	OrdersCount         int                  `json:"ordersCount"`
	PaidCount           int                  `json:"paidCount"`
	TotalRevenueKRW     float64              `json:"totalRevenueKRW"`
	TotalRevenueUZS     float64              `json:"totalRevenueUZS"`
	TotalMarginKRW      float64              `json:"totalMarginKRW"`
	TotalMarginUZS      float64              `json:"totalMarginUZS"`
	BaseSalaryUZS       float64              `json:"baseSalaryUZS"`
	CommissionRatePct   float64              `json:"commissionRatePct"`
	CommissionType      string               `json:"commissionType"` // 'revenue' or 'margin'
	CommissionEarnedUZS float64              `json:"commissionEarnedUZS"`
	CommissionEarnedKRW float64              `json:"commissionEarnedKRW"`
	KpiBonusUZS         float64              `json:"kpiBonusUZS"`
	TotalPayoutUZS      float64              `json:"totalPayoutUZS"`
	TotalPayoutKRW      float64              `json:"totalPayoutKRW"`
	Orders              []*StaffPayrollOrder `json:"orders"`
}

type PayrollReportResponse struct {
	Month           string                 `json:"month"`
	CommissionType  string                 `json:"commissionType"`
	TotalStaffCount int                    `json:"totalStaffCount"`
	TotalPaidOrders int                    `json:"totalPaidOrders"`
	TotalRevenueUZS float64                `json:"totalRevenueUZS"`
	TotalMarginUZS  float64                `json:"totalMarginUZS"`
	TotalPayoutUZS  float64                `json:"totalPayoutUZS"`
	StaffPayrolls   []*StaffPayrollSummary `json:"staffPayrolls"`
}

func (uc *StaffUseCase) GetAllStaff(ctx context.Context) ([]*StaffMemberResponse, error) {
	users, err := uc.userRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	orders, _, _ := uc.orderRepo.FindAll(ctx, "", "", 2000, 0)
	orderCounts := make(map[string]int)
	paidCounts := make(map[string]int)

	for _, o := range orders {
		assigned := o.AssignedTo
		if assigned == "" {
			assigned = "admin"
		}
		orderCounts[assigned]++
		if o.Status == "paid" || o.Status == "shipped" || o.Status == "delivered" {
			paidCounts[assigned]++
		}
	}

	var res []*StaffMemberResponse
	for _, u := range users {
		dName := u.DisplayName
		if dName == "" {
			dName = u.Username
		}
		res = append(res, &StaffMemberResponse{
			ID:          u.ID,
			Username:    u.Username,
			DisplayName: dName,
			Phone:       u.Phone,
			Role:        u.Role,
			IsActive:    u.IsActive,
			OrdersCount: orderCounts[u.Username],
			PaidCount:   paidCounts[u.Username],
		})
	}
	return res, nil
}

func (uc *StaffUseCase) CreateStaff(ctx context.Context, input CreateStaffInput) (*entity.User, error) {
	username := strings.TrimSpace(input.Username)
	if username == "" {
		return nil, fmt.Errorf("username is required")
	}
	if len(input.Password) < 4 {
		return nil, fmt.Errorf("password must be at least 4 characters")
	}

	existing, _ := uc.userRepo.FindByUsername(ctx, username)
	if existing != nil {
		return nil, fmt.Errorf("user with username '%s' already exists", username)
	}

	hash, err := sqlite.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	role := input.Role
	if role == "" {
		role = "manager"
	}

	user := &entity.User{
		Username:     username,
		DisplayName:  input.DisplayName,
		Phone:        input.Phone,
		PasswordHash: hash,
		Role:         role,
		IsActive:     input.IsActive,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (uc *StaffUseCase) UpdateStaff(ctx context.Context, id int64, input CreateStaffInput) error {
	user, err := uc.userRepo.FindByID(ctx, id)
	if err != nil || user == nil {
		return fmt.Errorf("user not found")
	}

	user.DisplayName = input.DisplayName
	user.Phone = input.Phone
	user.Role = input.Role
	user.IsActive = input.IsActive

	if err := uc.userRepo.Update(ctx, user); err != nil {
		return err
	}

	if input.Password != "" && len(input.Password) >= 4 {
		hash, err := sqlite.HashPassword(input.Password)
		if err == nil {
			_ = uc.userRepo.UpdatePassword(ctx, id, hash)
		}
	}
	return nil
}

func (uc *StaffUseCase) DeleteStaff(ctx context.Context, id int64) error {
	return uc.userRepo.Delete(ctx, id)
}

// GetPayrollReport calculates commissions and salaries for all staff for a given month/period
func (uc *StaffUseCase) GetPayrollReport(
	ctx context.Context,
	month string,
	commissionType string,
	commissionRate float64,
	baseSalaryUZS float64,
	kpiBonusUZS float64,
) (*PayrollReportResponse, error) {
	users, err := uc.userRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	if commissionType == "" {
		commissionType = "revenue" // 'revenue' or 'margin'
	}
	if commissionRate <= 0 {
		if commissionType == "revenue" {
			commissionRate = 3.0 // 3% on revenue
		} else {
			commissionRate = 15.0 // 15% on margin
		}
	}
	if baseSalaryUZS <= 0 {
		baseSalaryUZS = 2500000.0 // Default base salary 2.5M UZS (~$200)
	}

	orders, _, err := uc.orderRepo.FindAll(ctx, "", "", 2000, 0)
	if err != nil {
		return nil, err
	}

	// Filter by month if provided (e.g. "2026-10")
	var filteredOrders []*entity.Order
	for _, o := range orders {
		if o.Status == "cancelled" {
			continue
		}
		if month != "" && month != "all" {
			ordMonth := o.CreatedAt.Format("2006-01")
			if ordMonth != month {
				continue
			}
		}
		filteredOrders = append(filteredOrders, o)
	}

	// Group orders by staff
	ordersByStaff := make(map[string][]*StaffPayrollOrder)
	for _, o := range filteredOrders {
		assigned := strings.TrimSpace(o.AssignedTo)
		if assigned == "" {
			assigned = "admin"
		}

		revKRW := o.TotalAmount
		revUZS := o.TotalAmount
		if o.Currency == "UZS" {
			revKRW = o.TotalAmount / 9.5
		} else {
			revUZS = o.TotalAmount * 9.5
		}

		costKRW := o.CostPrice
		if costKRW <= 0 && revKRW > 0 {
			costKRW = revKRW * 0.55
		}
		marginKRW := revKRW - costKRW - (revKRW * 0.06) // minus cargo
		if marginKRW < 0 {
			marginKRW = 0
		}
		marginUZS := marginKRW * 9.5

		ordersByStaff[assigned] = append(ordersByStaff[assigned], &StaffPayrollOrder{
			ID:            o.ID,
			OrderNumber:   o.OrderNumber,
			Date:          o.CreatedAt,
			CustomerName:  o.CustomerName,
			City:          o.City,
			TotalAmount:   o.TotalAmount,
			TotalKRW:      revKRW,
			TotalUZS:      revUZS,
			CostPriceKRW:  costKRW,
			MarginKRW:     marginKRW,
			MarginUZS:     marginUZS,
			Status:        o.Status,
			PaymentMethod: o.PaymentMethod,
		})
	}

	var (
		totalPaidOrdersCount int
		totalRevenueSumUZS   float64
		totalMarginSumUZS    float64
		totalPayoutSumUZS    float64
		staffPayrolls        []*StaffPayrollSummary
	)

	for _, u := range users {
		staffOrders := ordersByStaff[u.Username]
		ordersCount := len(staffOrders)
		paidCount := 0
		var staffRevKRW, staffRevUZS, staffMarginKRW, staffMarginUZS float64

		for _, so := range staffOrders {
			if so.Status == "paid" || so.Status == "shipped" || so.Status == "delivered" {
				paidCount++
				staffRevKRW += so.TotalKRW
				staffRevUZS += so.TotalUZS
				staffMarginKRW += so.MarginKRW
				staffMarginUZS += so.MarginUZS
			}
		}

		// Calculate commission
		var commEarnedUZS, commEarnedKRW float64
		if commissionType == "margin" {
			commEarnedUZS = staffMarginUZS * (commissionRate / 100.0)
			commEarnedKRW = staffMarginKRW * (commissionRate / 100.0)
		} else {
			commEarnedUZS = staffRevUZS * (commissionRate / 100.0)
			commEarnedKRW = staffRevKRW * (commissionRate / 100.0)
		}

		// KPI Bonus (e.g. if manager paid count >= 10 orders or staffRevUZS >= 10,000,000)
		staffBonusUZS := 0.0
		if paidCount >= 10 && kpiBonusUZS > 0 {
			staffBonusUZS = kpiBonusUZS
		} else if paidCount >= 10 {
			staffBonusUZS = 500000.0 // 500k UZS default KPI achievement bonus
		}

		// Only active staff get base salary
		staffBaseUZS := baseSalaryUZS
		if !u.IsActive {
			staffBaseUZS = 0
		}

		payoutUZS := staffBaseUZS + commEarnedUZS + staffBonusUZS
		payoutKRW := payoutUZS / 9.5

		totalPaidOrdersCount += paidCount
		totalRevenueSumUZS += staffRevUZS
		totalMarginSumUZS += staffMarginUZS
		totalPayoutSumUZS += payoutUZS

		dName := u.DisplayName
		if dName == "" {
			dName = u.Username
		}

		// Sort orders in summary descending
		sort.Slice(staffOrders, func(i, j int) bool {
			return staffOrders[i].Date.After(staffOrders[j].Date)
		})

		staffPayrolls = append(staffPayrolls, &StaffPayrollSummary{
			Username:            u.Username,
			DisplayName:         dName,
			Phone:               u.Phone,
			Role:                u.Role,
			OrdersCount:         ordersCount,
			PaidCount:           paidCount,
			TotalRevenueKRW:     math.Round(staffRevKRW),
			TotalRevenueUZS:     math.Round(staffRevUZS),
			TotalMarginKRW:      math.Round(staffMarginKRW),
			TotalMarginUZS:      math.Round(staffMarginUZS),
			BaseSalaryUZS:       math.Round(staffBaseUZS),
			CommissionRatePct:   commissionRate,
			CommissionType:      commissionType,
			CommissionEarnedUZS: math.Round(commEarnedUZS),
			CommissionEarnedKRW: math.Round(commEarnedKRW),
			KpiBonusUZS:         math.Round(staffBonusUZS),
			TotalPayoutUZS:      math.Round(payoutUZS),
			TotalPayoutKRW:      math.Round(payoutKRW),
			Orders:              staffOrders,
		})
	}

	// Sort staff by total revenue descending
	sort.Slice(staffPayrolls, func(i, j int) bool {
		return staffPayrolls[i].TotalRevenueUZS > staffPayrolls[j].TotalRevenueUZS
	})

	if month == "" {
		month = time.Now().Format("2006-01")
	}

	return &PayrollReportResponse{
		Month:           month,
		CommissionType:  commissionType,
		TotalStaffCount: len(users),
		TotalPaidOrders: totalPaidOrdersCount,
		TotalRevenueUZS: math.Round(totalRevenueSumUZS),
		TotalMarginUZS:  math.Round(totalMarginSumUZS),
		TotalPayoutUZS:  math.Round(totalPayoutSumUZS),
		StaffPayrolls:   staffPayrolls,
	}, nil
}

// ExportPayrollCSV generates a formatted salary and commission payroll sheet for Microsoft Excel
func (uc *StaffUseCase) ExportPayrollCSV(
	ctx context.Context,
	month string,
	commissionType string,
	commissionRate float64,
	baseSalaryUZS float64,
	kpiBonusUZS float64,
) ([]byte, error) {
	report, err := uc.GetPayrollReport(ctx, month, commissionType, commissionRate, baseSalaryUZS, kpiBonusUZS)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	// UTF-8 BOM
	buf.Write([]byte{0xEF, 0xBB, 0xBF})

	writer := csv.NewWriter(&buf)
	writer.Comma = ';' // Semicolon for Russian/Uzbek Excel

	headers := []string{
		"ФИО Сотрудника",
		"Логин",
		"Роль / Должность",
		"Телефон",
		"Закрытых Заказов (шт)",
		"Оборот Продаж (сум)",
		"Маржа Продаж (сум)",
		"Базовый Оклад (сум)",
		"Тип Комиссии",
		"Ставка %",
		"Начислено Комиссии (сум)",
		"KPI Премия (сум)",
		"ИТОГО К ВЫПЛАТЕ (сум)",
	}
	_ = writer.Write(headers)

	for _, s := range report.StaffPayrolls {
		commTypeLabel := "От выручки"
		if s.CommissionType == "margin" {
			commTypeLabel = "От маржи"
		}

		row := []string{
			s.DisplayName,
			s.Username,
			s.Role,
			s.Phone,
			fmt.Sprintf("%d", s.PaidCount),
			fmt.Sprintf("%.0f", s.TotalRevenueUZS),
			fmt.Sprintf("%.0f", s.TotalMarginUZS),
			fmt.Sprintf("%.0f", s.BaseSalaryUZS),
			commTypeLabel,
			fmt.Sprintf("%.1f%%", s.CommissionRatePct),
			fmt.Sprintf("%.0f", s.CommissionEarnedUZS),
			fmt.Sprintf("%.0f", s.KpiBonusUZS),
			fmt.Sprintf("%.0f", s.TotalPayoutUZS),
		}
		_ = writer.Write(row)
	}

	writer.Flush()
	return buf.Bytes(), nil
}

func (uc *StaffUseCase) ExportPayrollXLSX(ctx context.Context, month string) ([]byte, error) {
	report, err := uc.GetPayrollReport(ctx, month, "revenue", 3.0, 2500000.0, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate payroll for XLSX export: %w", err)
	}

	var payrollList []entity.StaffPayroll
	for idx, s := range report.StaffPayrolls {
		payrollList = append(payrollList, entity.StaffPayroll{
			UserID:           int64(idx + 1),
			DisplayName:      s.DisplayName,
			Role:             s.Role,
			Phone:            s.Phone,
			Period:           report.Month,
			OrdersCount:      s.PaidCount,
			RevenueGenerated: s.TotalRevenueUZS,
			BaseSalary:       s.BaseSalaryUZS,
			CommissionRate:   s.CommissionRatePct,
			CommissionAmount: s.CommissionEarnedUZS,
			BonusAmount:      s.KpiBonusUZS,
			TotalPayout:      s.TotalPayoutUZS,
		})
	}

	return uc.excelExporter.ExportPayrollXLSX(payrollList)
}
