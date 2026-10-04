package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/bcatalog"
	"mkcosmetics/server/internal/usecase"
)

type CatalogHandler struct {
	catalogUC *usecase.CatalogUseCase
}

func NewCatalogHandler(catalogUC *usecase.CatalogUseCase) *CatalogHandler {
	return &CatalogHandler{catalogUC: catalogUC}
}

func (h *CatalogHandler) GetHome(w http.ResponseWriter, r *http.Request) {
	resp, err := h.catalogUC.GetHome(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch home data"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func (h *CatalogHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	var catID *int64
	if cidStr := q.Get("categoryId"); cidStr != "" {
		if cid, err := strconv.ParseInt(cidStr, 10, 64); err == nil && cid > 0 {
			catID = &cid
		}
	}

	var brands []string
	if bStr := q.Get("brand"); bStr != "" {
		for _, b := range strings.Split(bStr, ",") {
			if trimmed := strings.TrimSpace(b); trimmed != "" {
				brands = append(brands, trimmed)
			}
		}
	}

	var minP, maxP *int64
	if minStr := q.Get("minPrice"); minStr != "" {
		if v, err := strconv.ParseInt(minStr, 10, 64); err == nil {
			minP = &v
		}
	}
	if maxStr := q.Get("maxPrice"); maxStr != "" {
		if v, err := strconv.ParseInt(maxStr, 10, 64); err == nil {
			maxP = &v
		}
	}

	inStockOnly := q.Get("inStock") == "true" || q.Get("inStock") == "1"
	discountOnly := q.Get("discount") == "true" || q.Get("discount") == "1"

	page, _ := strconv.Atoi(q.Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(q.Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 24
	}

	filter := repository.CatalogFilter{
		CategoryID:   catID,
		CategorySlug: q.Get("categorySlug"),
		Brands:       brands,
		MinPrice:     minP,
		MaxPrice:     maxP,
		InStockOnly:  inStockOnly,
		DiscountOnly: discountOnly,
		Query:        q.Get("q"),
		Sort:         q.Get("sort"),
		Page:         page,
		PageSize:     pageSize,
		IncludeAdmin: false,
	}

	products, total, err := h.catalogUC.List(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch products: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"products": products,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *CatalogHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	product, related, err := h.catalogUC.GetBySlug(r.Context(), slug)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Товар не найден",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"product": product,
		"related": related,
	})
}

func (h *CatalogHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	cats, err := h.catalogUC.GetCategories(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch categories"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"categories": cats,
	})
}

func (h *CatalogHandler) GetBrands(w http.ResponseWriter, r *http.Request) {
	brands, err := h.catalogUC.GetBrands(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch brands"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"brands": brands,
	})
}

func (h *CatalogHandler) GetDeliveryOptions(w http.ResponseWriter, r *http.Request) {
	deliveries, err := h.catalogUC.GetDeliveryOptions(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch delivery options"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"deliveries": deliveries,
	})
}

func (h *CatalogHandler) AdminSync(w http.ResponseWriter, r *http.Request) {
	wait := r.URL.Query().Get("wait") == "true"
	if !wait {
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
			defer cancel()
			if res, err := h.catalogUC.Sync(ctx); err != nil {
				log.Printf("[CatalogSync] ❌ Background sync error: %v", err)
			} else {
				log.Printf("[CatalogSync] ✅ Background sync complete: %d products", res.Total)
			}
		}()

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"async":   true,
			"message": "Синхронизация с b-catalog запущена в фоновом режиме. Товары загружаются...",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	res, err := h.catalogUC.Sync(ctx)
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
		"result":  res,
	})
}

func (h *CatalogHandler) AdminGetStatus(w http.ResponseWriter, r *http.Request) {
	stats, err := h.catalogUC.GetAdminCatalogStats(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to get catalog stats"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stats)
}

func (h *CatalogHandler) AdminGetProducts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.Atoi(q.Get("page"))
	if page <= 0 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(q.Get("pageSize"))
	if pageSize <= 0 {
		pageSize = 50
	}

	filter := repository.CatalogFilter{
		Query:        q.Get("q"),
		CategorySlug: q.Get("categorySlug"),
		Page:         page,
		PageSize:     pageSize,
		IncludeAdmin: true,
	}

	products, total, err := h.catalogUC.List(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error":"failed to get admin products"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"products": products,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

type updateOverridesInput struct {
	IsHit           *bool   `json:"isHit"`
	IsHidden        *bool   `json:"isHidden"`
	BrandOverride   *string `json:"brandOverride"`
	ExcerptOverride *string `json:"excerptOverride"`
}

func (h *CatalogHandler) AdminUpdateOverrides(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid product id"}`, http.StatusBadRequest)
		return
	}

	var input updateOverridesInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.catalogUC.UpdateOverrides(r.Context(), id, input.IsHit, input.IsHidden, input.BrandOverride, input.ExcerptOverride); err != nil {
		http.Error(w, `{"error":"failed to update overrides: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}

type importCatalogPayload struct {
	Products []bcatalog.RawProduct `json:"products"`
}

func (h *CatalogHandler) AdminImport(w http.ResponseWriter, r *http.Request) {
	// 50MB max body limit for whole catalog payload
	r.Body = http.MaxBytesReader(w, r.Body, 50<<20)

	var payload importCatalogPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error":"invalid json body: `+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	if len(payload.Products) == 0 {
		http.Error(w, `{"error":"no products provided"}`, http.StatusBadRequest)
		return
	}

	res, err := h.catalogUC.IngestRawProducts(r.Context(), payload.Products)
	if err != nil {
		http.Error(w, `{"error":"failed to import products: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"result":  res,
	})
}
