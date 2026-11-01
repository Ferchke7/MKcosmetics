package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"mkcosmetics/server/internal/domain/repository"
)

type HealthHandler struct {
	startTime   time.Time
	productRepo repository.ProductRepository
}

func NewHealthHandler(productRepo repository.ProductRepository) *HealthHandler {
	return &HealthHandler{
		startTime:   time.Now(),
		productRepo: productRepo,
	}
}

func (h *HealthHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	count, _ := h.productRepo.Count(ctx)

	resp := map[string]interface{}{
		"status":     "healthy",
		"engine":     "Go (Golang) + SQLite WAL",
		"arch":       "Clean Architecture + DDD",
		"uptime":     time.Since(h.startTime).String(),
		"totalPosts": count,
		"timestamp":  time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
