package handler

import (
	"fmt"
	"net/http"
	"time"

	"mkcosmetics/server/internal/usecase"
)

type ExportHandler struct {
	orderUC *usecase.OrderUseCase
}

func NewExportHandler(orderUC *usecase.OrderUseCase) *ExportHandler {
	return &ExportHandler{orderUC: orderUC}
}

func (h *ExportHandler) ExportCSV(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")

	csvData, err := h.orderUC.ExportOrdersCSV(r.Context(), status, search)
	if err != nil {
		http.Error(w, `{"error":"failed to export orders: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_orders_%s.csv", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(csvData)
}
