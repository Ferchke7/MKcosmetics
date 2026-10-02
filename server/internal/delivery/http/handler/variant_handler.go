package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/usecase"
)

type VariantHandler struct {
	variantUC *usecase.VariantUseCase
}

func NewVariantHandler(variantUC *usecase.VariantUseCase) *VariantHandler {
	return &VariantHandler{variantUC: variantUC}
}

func (h *VariantHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	productID := r.URL.Query().Get("productId")
	var (
		variants []*entity.ProductVariant
		err      error
	)
	if productID != "" {
		variants, err = h.variantUC.GetVariantsByProduct(r.Context(), productID)
	} else {
		variants, err = h.variantUC.GetAllVariants(r.Context())
	}

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "variants": variants})
}

func (h *VariantHandler) Create(w http.ResponseWriter, r *http.Request) {
	var variant entity.ProductVariant
	if err := json.NewDecoder(r.Body).Decode(&variant); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	if err := h.variantUC.CreateVariant(r.Context(), &variant); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "variant": variant})
}

func (h *VariantHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid variant id"}`, http.StatusBadRequest)
		return
	}

	var variant entity.ProductVariant
	if err := json.NewDecoder(r.Body).Decode(&variant); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}
	variant.ID = id

	if err := h.variantUC.UpdateVariant(r.Context(), &variant); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "variant": variant})
}

func (h *VariantHandler) UpdateStock(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid variant id"}`, http.StatusBadRequest)
		return
	}

	var body struct {
		StockQuantity int    `json:"stockQuantity"`
		StockStatus   string `json:"stockStatus"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	if err := h.variantUC.UpdateStock(r.Context(), id, body.StockQuantity, body.StockStatus); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func (h *VariantHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid variant id"}`, http.StatusBadRequest)
		return
	}

	if err := h.variantUC.DeleteVariant(r.Context(), id); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}
