package handler

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"

	"mkcosmetics/server/internal/usecase"
)

type VisitorHandler struct {
	visitorUC *usecase.VisitorUseCase
}

func NewVisitorHandler(visitorUC *usecase.VisitorUseCase) *VisitorHandler {
	return &VisitorHandler{
		visitorUC: visitorUC,
	}
}

type trackRequestBody struct {
	CountryCode string `json:"countryCode"`
	Path        string `json:"path"`
}

func (h *VisitorHandler) Track(w http.ResponseWriter, r *http.Request) {
	var body trackRequestBody
	if r.Body != nil && r.ContentLength > 0 {
		_ = json.NewDecoder(r.Body).Decode(&body)
	}

	ip := extractClientIP(r)
	countryCode := body.CountryCode
	if countryCode == "" {
		countryCode = r.Header.Get("CF-IPCountry")
	}
	if countryCode == "" {
		countryCode = r.Header.Get("X-Country-Code")
	}

	stats, err := h.visitorUC.Track(r.Context(), usecase.TrackInput{
		IP:          ip,
		CountryCode: countryCode,
		UserAgent:   r.UserAgent(),
		Path:        body.Path,
	})
	if err != nil {
		http.Error(w, `{"error":"failed to track visitor: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"clientIp":    ip,
		"totalVisits": stats.TotalVisits,
		"countries":   stats.Countries,
		"lastUpdated": stats.LastUpdated,
	})
}

func (h *VisitorHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.visitorUC.GetStats(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to get stats: `+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	ip := extractClientIP(r)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"clientIp":    ip,
		"totalVisits": stats.TotalVisits,
		"countries":   stats.Countries,
		"lastUpdated": stats.LastUpdated,
	})
}

func extractClientIP(r *http.Request) string {
	// 1. Cloudflare header
	if cfIP := r.Header.Get("CF-Connecting-IP"); cfIP != "" {
		return cfIP
	}

	// 2. X-Forwarded-For
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			ip := strings.TrimSpace(parts[0])
			if ip != "" {
				return ip
			}
		}
	}

	// 3. X-Real-IP
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// 4. RemoteAddr
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}
