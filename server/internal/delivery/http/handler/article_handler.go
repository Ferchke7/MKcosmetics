package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/usecase"
)

type ArticleHandler struct {
	articleUC *usecase.ArticleUseCase
}

func NewArticleHandler(articleUC *usecase.ArticleUseCase) *ArticleHandler {
	return &ArticleHandler{articleUC: articleUC}
}

func (h *ArticleHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	search := r.URL.Query().Get("search")
	tag := r.URL.Query().Get("tag")

	filter := entity.ArticleFilter{
		Search: search,
		Tag:    tag,
		Limit:  limit,
		Offset: offset,
	}

	articles, total, err := h.articleUC.GetAll(r.Context(), filter)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"articles": articles,
		"total":    total,
	})
}

func (h *ArticleHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	article, err := h.articleUC.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}
	if article == nil {
		http.Error(w, `{"error":"article not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(article)
}

func (h *ArticleHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	article, err := h.articleUC.GetBySlug(r.Context(), slug)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}
	if article == nil {
		http.Error(w, `{"error":"article not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(article)
}

func (h *ArticleHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	var a entity.Article
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, `{"error":"invalid payload"}`, http.StatusBadRequest)
		return
	}

	if err := h.articleUC.Upsert(r.Context(), a); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func (h *ArticleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.articleUC.Delete(r.Context(), id); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func (h *ArticleHandler) SyncFromTelegram(w http.ResponseWriter, r *http.Request) {
	count, err := h.articleUC.SyncFromTelegramPosts(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to sync articles: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"synced":  count,
	})
}
