package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"mkcosmetics/server/internal/usecase"
)

type AnalyticsHandler struct {
	analyticsUC *usecase.AnalyticsUseCase
}

func NewAnalyticsHandler(analyticsUC *usecase.AnalyticsUseCase) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsUC: analyticsUC}
}

func (h *AnalyticsHandler) GetDeepAnalytics(w http.ResponseWriter, r *http.Request) {
	daysStr := r.URL.Query().Get("days")
	days, _ := strconv.Atoi(daysStr)
	if days <= 0 {
		days = 30
	}

	data, err := h.analyticsUC.GetDeepAnalytics(r.Context(), days)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    data,
	})
}
