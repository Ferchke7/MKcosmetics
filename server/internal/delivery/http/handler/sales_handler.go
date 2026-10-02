package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"mkcosmetics/server/internal/usecase"
)

type SalesHandler struct {
	salesUseCase *usecase.SalesUseCase
}

func NewSalesHandler(salesUseCase *usecase.SalesUseCase) *SalesHandler {
	return &SalesHandler{salesUseCase: salesUseCase}
}

// GetUnitEconomics handles GET /api/admin/sales/unit-economics?days=30
func (h *SalesHandler) GetUnitEconomics(w http.ResponseWriter, r *http.Request) {
	daysStr := r.URL.Query().Get("days")
	days := 30
	if daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
			days = d
		}
	}

	resp, err := h.salesUseCase.GetUnitEconomics(r.Context(), days)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// ExportLedgerCSV handles GET /api/admin/sales/export-ledger?days=30
func (h *SalesHandler) ExportLedgerCSV(w http.ResponseWriter, r *http.Request) {
	daysStr := r.URL.Query().Get("days")
	days := 30
	if daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil && d > 0 {
			days = d
		}
	}

	data, err := h.salesUseCase.ExportUnitSalesLedgerCSV(r.Context(), days)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	filename := fmt.Sprintf("mk_unit_sales_ledger_%s.csv", time.Now().Format("2006-01-02"))
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(data)
}
