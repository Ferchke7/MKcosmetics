package sqlite

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type SQLiteArticleRepository struct {
	db *DB
}

func NewSQLiteArticleRepository(db *DB) repository.ArticleRepository {
	return &SQLiteArticleRepository{db: db}
}

func (r *SQLiteArticleRepository) GetAll(ctx context.Context, filter entity.ArticleFilter) ([]entity.Article, int, error) {
	var whereClauses []string
	var args []interface{}

	if filter.Search != "" {
		s := "%" + strings.ToLower(filter.Search) + "%"
		whereClauses = append(whereClauses, "(LOWER(title) LIKE ? OR LOWER(subtitle) LIKE ? OR LOWER(content_markdown) LIKE ?)")
		args = append(args, s, s, s)
	}

	if filter.Tag != "" {
		t := "%" + strings.ToLower(filter.Tag) + "%"
		whereClauses = append(whereClauses, "LOWER(tags_json) LIKE ?")
		args = append(args, t)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	countQuery := "SELECT COUNT(*) FROM articles " + whereSQL
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count articles: %w", err)
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 20
	}
	offset := filter.Offset
	if offset < 0 {
		offset = 0
	}

	query := fmt.Sprintf(`
		SELECT id, slug, title, subtitle, content_markdown, cover_image, author,
		       reading_time_minutes, tags_json, related_product_ids_json, source_telegram_url,
		       views, published_at, created_at, updated_at
		FROM articles
		%s
		ORDER BY published_at DESC
		LIMIT ? OFFSET ?
	`, whereSQL)

	queryArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query articles: %w", err)
	}
	defer rows.Close()

	var articles []entity.Article
	for rows.Next() {
		var a entity.Article
		var tagsJSON, productsJSON string

		err := rows.Scan(
			&a.ID, &a.Slug, &a.Title, &a.Subtitle, &a.ContentMarkdown, &a.CoverImage, &a.Author,
			&a.ReadingTimeMinutes, &tagsJSON, &productsJSON, &a.SourceTelegramURL,
			&a.Views, &a.PublishedAt, &a.CreatedAt, &a.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan article: %w", err)
		}

		_ = json.Unmarshal([]byte(tagsJSON), &a.Tags)
		_ = json.Unmarshal([]byte(productsJSON), &a.RelatedProductIDs)
		if a.Tags == nil {
			a.Tags = []string{}
		}
		if a.RelatedProductIDs == nil {
			a.RelatedProductIDs = []string{}
		}

		articles = append(articles, a)
	}

	return articles, total, nil
}

func (r *SQLiteArticleRepository) GetByID(ctx context.Context, id string) (*entity.Article, error) {
	query := `
		SELECT id, slug, title, subtitle, content_markdown, cover_image, author,
		       reading_time_minutes, tags_json, related_product_ids_json, source_telegram_url,
		       views, published_at, created_at, updated_at
		FROM articles
		WHERE id = ?
	`
	var a entity.Article
	var tagsJSON, productsJSON string

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&a.ID, &a.Slug, &a.Title, &a.Subtitle, &a.ContentMarkdown, &a.CoverImage, &a.Author,
		&a.ReadingTimeMinutes, &tagsJSON, &productsJSON, &a.SourceTelegramURL,
		&a.Views, &a.PublishedAt, &a.CreatedAt, &a.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get article by id: %w", err)
	}

	_ = json.Unmarshal([]byte(tagsJSON), &a.Tags)
	_ = json.Unmarshal([]byte(productsJSON), &a.RelatedProductIDs)
	if a.Tags == nil {
		a.Tags = []string{}
	}
	if a.RelatedProductIDs == nil {
		a.RelatedProductIDs = []string{}
	}

	return &a, nil
}

func (r *SQLiteArticleRepository) GetBySlug(ctx context.Context, slug string) (*entity.Article, error) {
	query := `
		SELECT id, slug, title, subtitle, content_markdown, cover_image, author,
		       reading_time_minutes, tags_json, related_product_ids_json, source_telegram_url,
		       views, published_at, created_at, updated_at
		FROM articles
		WHERE slug = ?
	`
	var a entity.Article
	var tagsJSON, productsJSON string

	err := r.db.QueryRowContext(ctx, query, slug).Scan(
		&a.ID, &a.Slug, &a.Title, &a.Subtitle, &a.ContentMarkdown, &a.CoverImage, &a.Author,
		&a.ReadingTimeMinutes, &tagsJSON, &productsJSON, &a.SourceTelegramURL,
		&a.Views, &a.PublishedAt, &a.CreatedAt, &a.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get article by slug: %w", err)
	}

	_ = json.Unmarshal([]byte(tagsJSON), &a.Tags)
	_ = json.Unmarshal([]byte(productsJSON), &a.RelatedProductIDs)
	if a.Tags == nil {
		a.Tags = []string{}
	}
	if a.RelatedProductIDs == nil {
		a.RelatedProductIDs = []string{}
	}

	return &a, nil
}

func (r *SQLiteArticleRepository) Upsert(ctx context.Context, a entity.Article) error {
	tagsJSON, _ := json.Marshal(a.Tags)
	productsJSON, _ := json.Marshal(a.RelatedProductIDs)

	query := `
		INSERT INTO articles (
			id, slug, title, subtitle, content_markdown, cover_image, author,
			reading_time_minutes, tags_json, related_product_ids_json, source_telegram_url,
			views, published_at, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			slug = excluded.slug,
			title = excluded.title,
			subtitle = excluded.subtitle,
			content_markdown = excluded.content_markdown,
			cover_image = excluded.cover_image,
			author = excluded.author,
			reading_time_minutes = excluded.reading_time_minutes,
			tags_json = excluded.tags_json,
			related_product_ids_json = excluded.related_product_ids_json,
			source_telegram_url = excluded.source_telegram_url,
			updated_at = CURRENT_TIMESTAMP
	`

	_, err := r.db.ExecContext(ctx, query,
		a.ID, a.Slug, a.Title, a.Subtitle, a.ContentMarkdown, a.CoverImage, a.Author,
		a.ReadingTimeMinutes, string(tagsJSON), string(productsJSON), a.SourceTelegramURL,
		a.Views, a.PublishedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to upsert article: %w", err)
	}
	return nil
}

func (r *SQLiteArticleRepository) IncrementViews(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE articles SET views = views + 1 WHERE id = ?", id)
	return err
}

func (r *SQLiteArticleRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM articles WHERE id = ?", id)
	return err
}
