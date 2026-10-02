package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"mkcosmetics/server/internal/usecase"
)

type FeedHandler struct {
	feedUC *usecase.FeedUseCase
	syncUC *usecase.SyncUseCase
}

func NewFeedHandler(feedUC *usecase.FeedUseCase, syncUC *usecase.SyncUseCase) *FeedHandler {
	return &FeedHandler{
		feedUC: feedUC,
		syncUC: syncUC,
	}
}

func (h *FeedHandler) GetFeed(w http.ResponseWriter, r *http.Request) {
	feed, err := h.feedUC.GetFeed(r.Context())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "failed to fetch feed: " + err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    feed,
	})
}

func (h *FeedHandler) Sync(w http.ResponseWriter, r *http.Request) {
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
		"message": "Sync completed successfully",
		"count":   count,
	})
}
