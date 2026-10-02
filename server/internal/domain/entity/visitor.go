package entity

import (
	"time"
)

// CountryStat represents visit counts for a specific country
type CountryStat struct {
	Code   string `json:"code"`
	NameRu string `json:"nameRu"`
	NameUz string `json:"nameUz"`
	Flag   string `json:"flag"`
	Visits int64  `json:"visits"`
}

// VisitorStats represents global aggregated visitor statistics
type VisitorStats struct {
	TotalVisits int64         `json:"totalVisits"`
	Countries   []CountryStat `json:"countries"`
	LastUpdated time.Time     `json:"lastUpdated"`
}

// VisitorLog represents a single recorded visit log entry
type VisitorLog struct {
	ID          int64     `json:"id"`
	IP          string    `json:"ip"`
	CountryCode string    `json:"countryCode"`
	VisitedAt   time.Time `json:"visitedAt"`
}
