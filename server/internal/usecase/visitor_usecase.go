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

type geoLookupResult struct {
	CountryCode string `json:"countryCode"`
	CountryName string `json:"country"`
	City        string `json:"city"`
}

func (uc *VisitorUseCase) Track(ctx context.Context, input TrackInput) (*entity.VisitorStats, error) {
	countryCode := strings.ToUpper(strings.TrimSpace(input.CountryCode))
	ip := strings.TrimSpace(input.IP)
	countryName := ""
	city := ""
	flag := ""

	// If no country code provided, or to get city & accurate geo, lookup IP
	if ip != "" && !isPrivateIP(ip) {
		if geo, err := uc.lookupGeoByIP(ctx, ip); err == nil && geo != nil {
			if countryCode == "" || countryCode == "XX" || countryCode == "T1" {
				countryCode = geo.CountryCode
			}
			if geo.CountryName != "" {
				countryName = geo.CountryName
			}
			if geo.City != "" {
				city = geo.City
			}
		}
	}

	if countryCode == "" {
		countryCode = "UZ"
	}
	if countryName == "" {
		countryName = getCountryNameRu(countryCode)
	}
	flag = getCountryFlag(countryCode)

	params := repository.RecordVisitParams{
		IP:          ip,
		CountryCode: countryCode,
		CountryName: countryName,
		City:        city,
		Flag:        flag,
		UserAgent:   input.UserAgent,
		Path:        input.Path,
	}

	if err := uc.repo.RecordVisit(ctx, params); err != nil {
		return nil, fmt.Errorf("failed to record visit: %w", err)
	}

	return uc.repo.GetStats(ctx)
}

func (uc *VisitorUseCase) GetStats(ctx context.Context) (*entity.VisitorStats, error) {
	return uc.repo.GetStats(ctx)
}

func (uc *VisitorUseCase) lookupGeoByIP(ctx context.Context, ip string) (*geoLookupResult, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("http://ip-api.com/json/%s?fields=status,country,countryCode,city", ip), nil)
	if err != nil {
		return nil, err
	}
	resp, err := uc.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Status      string `json:"status"`
		CountryCode string `json:"countryCode"`
		Country     string `json:"country"`
		City        string `json:"city"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if result.Status == "success" && result.CountryCode != "" {
		return &geoLookupResult{
			CountryCode: result.CountryCode,
			CountryName: result.Country,
			City:        result.City,
		}, nil
	}
	return nil, nil
}

func getCountryNameRu(code string) string {
	presets := map[string]string{
		"UZ": "Узбекистан",
		"RU": "Россия",
		"KZ": "Казахстан",
		"KR": "Южная Корея",
		"US": "США",
		"TR": "Турция",
		"KG": "Кыргызстан",
		"TJ": "Таджикистан",
		"AE": "ОАЭ",
		"DE": "Германия",
	}
	if name, ok := presets[code]; ok {
		return name
	}
	return code
}

func getCountryFlag(code string) string {
	presets := map[string]string{
		"UZ": "🇺🇿",
		"RU": "🇷🇺",
		"KZ": "🇰🇿",
		"KR": "🇰🇷",
		"US": "🇺🇸",
		"TR": "🇹🇷",
		"KG": "🇰🇬",
		"TJ": "🇹🇯",
		"AE": "🇦🇪",
		"DE": "🇩🇪",
	}
	if flag, ok := presets[code]; ok {
		return flag
	}
	return "🌐"
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
