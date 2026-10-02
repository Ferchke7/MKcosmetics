package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type VisitorUseCase struct {
	repo       repository.VisitorRepository
	httpClient *http.Client
}

func NewVisitorUseCase(repo repository.VisitorRepository) *VisitorUseCase {
	return &VisitorUseCase{
		repo: repo,
		httpClient: &http.Client{
			Timeout: 2 * time.Second,
		},
	}
}

type TrackInput struct {
	IP          string `json:"ip"`
	CountryCode string `json:"countryCode"`
	UserAgent   string `json:"userAgent"`
	Path        string `json:"path"`
}

func (uc *VisitorUseCase) Track(ctx context.Context, input TrackInput) (*entity.VisitorStats, error) {
	countryCode := strings.ToUpper(strings.TrimSpace(input.CountryCode))
	ip := strings.TrimSpace(input.IP)

	// If no country code provided, and we have a public IP, try quick lookup
	if (countryCode == "" || countryCode == "XX" || countryCode == "T1") && ip != "" && !isPrivateIP(ip) {
		if resolved, err := uc.lookupCountryByIP(ctx, ip); err == nil && resolved != "" {
			countryCode = resolved
		}
	}

	if countryCode == "" {
		countryCode = "UZ"
	}

	if err := uc.repo.RecordVisit(ctx, countryCode, ip); err != nil {
		return nil, fmt.Errorf("failed to record visit: %w", err)
	}

	return uc.repo.GetStats(ctx)
}

func (uc *VisitorUseCase) GetStats(ctx context.Context) (*entity.VisitorStats, error) {
	return uc.repo.GetStats(ctx)
}

func (uc *VisitorUseCase) lookupCountryByIP(ctx context.Context, ip string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("http://ip-api.com/json/%s?fields=status,countryCode", ip), nil)
	if err != nil {
		return "", err
	}
	resp, err := uc.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Status      string `json:"status"`
		CountryCode string `json:"countryCode"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if result.Status == "success" && result.CountryCode != "" {
		return result.CountryCode, nil
	}
	return "", nil
}

func isPrivateIP(ip string) bool {
	return ip == "127.0.0.1" || ip == "::1" || ip == "localhost" ||
		strings.HasPrefix(ip, "192.168.") ||
		strings.HasPrefix(ip, "10.") ||
		strings.HasPrefix(ip, "172.16.") ||
		strings.HasPrefix(ip, "172.17.") ||
		strings.HasPrefix(ip, "172.18.") ||
		strings.HasPrefix(ip, "172.19.") ||
		strings.HasPrefix(ip, "172.20.") ||
		strings.HasPrefix(ip, "172.21.") ||
		strings.HasPrefix(ip, "172.22.") ||
		strings.HasPrefix(ip, "172.23.") ||
		strings.HasPrefix(ip, "172.24.") ||
		strings.HasPrefix(ip, "172.25.") ||
		strings.HasPrefix(ip, "172.26.") ||
		strings.HasPrefix(ip, "172.27.") ||
		strings.HasPrefix(ip, "172.28.") ||
		strings.HasPrefix(ip, "172.29.") ||
		strings.HasPrefix(ip, "172.30.") ||
		strings.HasPrefix(ip, "172.31.")
}
