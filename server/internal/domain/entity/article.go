package entity

import "time"

// Article represents a Telegram beauty guide, skincare routine, or editorial review
type Article struct {
	ID                 string    `json:"id"`
	Slug               string    `json:"slug"`
	Title              string    `json:"title"`
	Subtitle           string    `json:"subtitle"`
	ContentMarkdown    string    `json:"contentMarkdown"`
	CoverImage         string    `json:"coverImage"`
	Author             string    `json:"author"`
	ReadingTimeMinutes int       `json:"readingTimeMinutes"`
	Tags               []string  `json:"tags"`
	RelatedProductIDs  []string  `json:"relatedProductIDs"`
	SourceTelegramURL  string    `json:"sourceTelegramUrl"`
	Views              int       `json:"views"`
	PublishedAt        time.Time `json:"publishedAt"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type ArticleFilter struct {
	Search string `json:"search"`
	Tag    string `json:"tag"`
	Limit  int    `json:"limit"`
	Offset int    `json:"offset"`
}
