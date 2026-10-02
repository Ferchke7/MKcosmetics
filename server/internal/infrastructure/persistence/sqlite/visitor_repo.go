package sqlite

import (
	"context"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

var countryPresets = map[string]struct {
	NameRu string
	NameUz string
	Flag   string
}{
	"UZ": {NameRu: "Узбекистан", NameUz: "O'zbekiston", Flag: "🇺🇿"},
	"RU": {NameRu: "Россия", NameUz: "Rossiya", Flag: "🇷🇺"},
	"KZ": {NameRu: "Казахстан", NameUz: "Qozog'iston", Flag: "🇰🇿"},
	"KR": {NameRu: "Южная Корея", NameUz: "Janubiy Koreya", Flag: "🇰🇷"},
	"US": {NameRu: "США", NameUz: "AQSH", Flag: "🇺🇸"},
	"TR": {NameRu: "Турция", NameUz: "Turkiya", Flag: "🇹🇷"},
	"KG": {NameRu: "Кыргызстан", NameUz: "Qirg'iziston", Flag: "🇰🇬"},
}

type visitorRepository struct {
	db *DB
}

// NewVisitorRepository creates a new SQLite VisitorRepository implementation
func NewVisitorRepository(db *DB) repository.VisitorRepository {
	return &visitorRepository{db: db}
}

func (r *visitorRepository) RecordVisit(ctx context.Context, countryCode string, ip string) error {
	code := strings.ToUpper(strings.TrimSpace(countryCode))
	if code == "" {
		code = "UZ"
	}

	// 1. Increment country visits counter
	queryStats := `
		INSERT INTO visitor_stats (country_code, visits, updated_at)
		VALUES (?, 1, CURRENT_TIMESTAMP)
		ON CONFLICT(country_code) DO UPDATE SET
			visits = visits + 1,
			updated_at = CURRENT_TIMESTAMP;
	`
	_, err := r.db.ExecContext(ctx, queryStats, code)
	if err != nil {
		return err
	}

	// 2. Log visitor record
	if ip != "" {
		queryLog := `
			INSERT INTO visitor_logs (ip, country_code, visited_at)
			VALUES (?, ?, CURRENT_TIMESTAMP);
		`
		_, _ = r.db.ExecContext(ctx, queryLog, ip, code)
	}

	return nil
}

func (r *visitorRepository) GetStats(ctx context.Context) (*entity.VisitorStats, error) {
	query := `
		SELECT country_code, visits, updated_at
		FROM visitor_stats
		ORDER BY visits DESC;
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var (
		countries   []entity.CountryStat
		totalVisits int64
		latestTime  time.Time
	)

	for rows.Next() {
		var (
			code       string
			visits     int64
			updatedStr string
		)
		if err := rows.Scan(&code, &visits, &updatedStr); err != nil {
			return nil, err
		}

		totalVisits += visits
		if t, err := time.Parse(time.RFC3339, updatedStr); err == nil && t.After(latestTime) {
			latestTime = t
		}

		preset, exists := countryPresets[code]
		if !exists {
			preset = struct {
				NameRu string
				NameUz string
				Flag   string
			}{
				NameRu: code,
				NameUz: code,
				Flag:   "🌐",
			}
		}

		countries = append(countries, entity.CountryStat{
			Code:   code,
			NameRu: preset.NameRu,
			NameUz: preset.NameUz,
			Flag:   preset.Flag,
			Visits: visits,
		})
	}

	if latestTime.IsZero() {
		latestTime = time.Now()
	}

	return &entity.VisitorStats{
		TotalVisits: totalVisits,
		Countries:   countries,
		LastUpdated: latestTime,
	}, nil
}

func (r *visitorRepository) GetRecentLogs(ctx context.Context, limit int) ([]entity.VisitorLog, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		SELECT id, ip, country_code, visited_at
		FROM visitor_logs
		ORDER BY visited_at DESC
		LIMIT ?;
	`
	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []entity.VisitorLog
	for rows.Next() {
		var (
			l          entity.VisitorLog
			visitedStr string
		)
		if err := rows.Scan(&l.ID, &l.IP, &l.CountryCode, &visitedStr); err != nil {
			return nil, err
		}
		if t, err := time.Parse(time.RFC3339, visitedStr); err == nil {
			l.VisitedAt = t
		} else {
			l.VisitedAt = time.Now()
		}
		logs = append(logs, l)
	}

	return logs, nil
}
