package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/usecase"
)

type AdminHandler struct {
	adminUC *usecase.AdminUseCase
	syncUC  *usecase.SyncUseCase
}

func NewAdminHandler(adminUC *usecase.AdminUseCase, syncUC *usecase.SyncUseCase) *AdminHandler {
	return &AdminHandler{
		adminUC: adminUC,
		syncUC:  syncUC,
	}
}

func (h *AdminHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	stats, err := h.adminUC.GetDashboardStats(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to get dashboard stats: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stats)
}

func (h *AdminHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var post entity.ProductPost
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(w, `{"error":"invalid product payload: `+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	if err := h.adminUC.CreateProduct(r.Context(), &post); err != nil {
		http.Error(w, `{"error":"failed to create product: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"product": post,
	})
}

func (h *AdminHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error":"missing product id"}`, http.StatusBadRequest)
		return
	}

	var post entity.ProductPost
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(w, `{"error":"invalid product payload: `+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	post.ID = id
	if err := h.adminUC.UpdateProduct(r.Context(), &post); err != nil {
		http.Error(w, `{"error":"failed to update product: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"product": post,
	})
}

func (h *AdminHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error":"missing product id"}`, http.StatusBadRequest)
		return
	}

	if err := h.adminUC.DeleteProduct(r.Context(), id); err != nil {
		http.Error(w, `{"error":"failed to delete product: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Product deleted successfully",
		"id":      id,
	})
}

func (h *AdminHandler) GetVisitorLogs(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 100
	}

	logs, err := h.adminUC.GetVisitorLogs(r.Context(), limit)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch logs: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"logs":    logs,
		"total":   len(logs),
	})
}

func (h *AdminHandler) TriggerSync(w http.ResponseWriter, r *http.Request) {
	deepStr := r.URL.Query().Get("deep")
	deep, _ := strconv.ParseBool(deepStr)

	count, err := h.syncUC.Sync(r.Context(), deep)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Синхронизация успешно завершена! В каталоге обработано %d товаров.", count),
		"count":   count,
	})
}

func (h *AdminHandler) ImportDummyProducts(w http.ResponseWriter, r *http.Request) {
	count, err := h.syncUC.Sync(r.Context(), true)
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
		"message": fmt.Sprintf("Успешно импортировано %d товаров из Telegram канала @mkcosmetkor для теста!", count),
		"count":   count,
	})
}
