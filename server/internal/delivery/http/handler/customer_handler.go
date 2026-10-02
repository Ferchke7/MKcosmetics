package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/usecase"
)

type CustomerHandler struct {
	customerUC *usecase.CustomerUseCase
}

func NewCustomerHandler(customerUC *usecase.CustomerUseCase) *CustomerHandler {
	return &CustomerHandler{customerUC: customerUC}
}

func (h *CustomerHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	search := r.URL.Query().Get("search")
	segment := r.URL.Query().Get("segment")
	city := r.URL.Query().Get("city")

	filter := entity.CustomerFilter{
		Search:  search,
		Segment: segment,
		City:    city,
		Limit:   limit,
		Offset:  offset,
	}

	customers, total, err := h.customerUC.GetAll(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	stats, _ := h.customerUC.GetCRMStats(r.Context())

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"customers": customers,
		"total":     total,
		"stats":     stats,
	})
}

func (h *CustomerHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}

	customer, err := h.customerUC.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}
	if customer == nil {
		http.Error(w, `{"error":"customer not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(customer)
}

func (h *CustomerHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}

	var c entity.Customer
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, `{"error":"invalid payload"}`, http.StatusBadRequest)
		return
	}
	c.ID = id

	if err := h.customerUC.Update(r.Context(), c); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func (h *CustomerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid id"}`, http.StatusBadRequest)
		return
	}

	if err := h.customerUC.Delete(r.Context(), id); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func (h *CustomerHandler) ExportXLSX(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	segment := r.URL.Query().Get("segment")

	filter := entity.CustomerFilter{
		Search:  search,
		Segment: segment,
	}

	xlsxData, err := h.customerUC.ExportCustomersXLSX(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	filename := fmt.Sprintf("mk_cosmetics_crm_customers_%s.xlsx", time.Now().Format("20060102_150405"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(xlsxData)
}
