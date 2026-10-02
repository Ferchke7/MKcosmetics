package handler

import (
	"fmt"
	"net/http"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/usecase"
)

type ExportHandler struct {
	orderUC    *usecase.OrderUseCase
	adminUC    *usecase.AdminUseCase
	staffUC    *usecase.StaffUseCase
	salesUC    *usecase.SalesUseCase
	customerUC *usecase.CustomerUseCase
}

func NewExportHandler(
	orderUC *usecase.OrderUseCase,
	adminUC *usecase.AdminUseCase,
	staffUC *usecase.StaffUseCase,
	salesUC *usecase.SalesUseCase,
	customerUC *usecase.CustomerUseCase,
) *ExportHandler {
	return &ExportHandler{
		orderUC:    orderUC,
		adminUC:    adminUC,
		staffUC:    staffUC,
		salesUC:    salesUC,
		customerUC: customerUC,
	}
}

func (h *ExportHandler) ExportCSV(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")

	csvData, err := h.orderUC.ExportOrdersCSV(r.Context(), status, search)
	if err != nil {
		http.Error(w, `{"error":"failed to export orders CSV: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_orders_%s.csv", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(csvData)
}

func (h *ExportHandler) ExportOrdersXLSX(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")

	xlsxData, err := h.orderUC.ExportOrdersXLSX(r.Context(), status, search)
	if err != nil {
		http.Error(w, `{"error":"failed to export orders XLSX: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_orders_%s.xlsx", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(xlsxData)
}

func (h *ExportHandler) ExportProductsXLSX(w http.ResponseWriter, r *http.Request) {
	xlsxData, err := h.adminUC.ExportProductsXLSX(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to export products XLSX: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_catalog_%s.xlsx", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(xlsxData)
}

func (h *ExportHandler) ExportPayrollXLSX(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	xlsxData, err := h.staffUC.ExportPayrollXLSX(r.Context(), month)
	if err != nil {
		http.Error(w, `{"error":"failed to export payroll XLSX: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_payroll_%s.xlsx", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(xlsxData)
}

func (h *ExportHandler) ExportSalesLedgerXLSX(w http.ResponseWriter, r *http.Request) {
	xlsxData, err := h.salesUC.ExportSalesLedgerXLSX(r.Context(), 30)
	if err != nil {
		http.Error(w, `{"error":"failed to export sales ledger XLSX: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_sales_ledger_%s.xlsx", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(xlsxData)
}

func (h *ExportHandler) ExportCustomersXLSX(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	segment := r.URL.Query().Get("segment")

	filter := entity.CustomerFilter{
		Search:  search,
		Segment: segment,
	}

	xlsxData, err := h.customerUC.ExportCustomersXLSX(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error":"failed to export customers XLSX: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_customers_%s.xlsx", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(xlsxData)
}
