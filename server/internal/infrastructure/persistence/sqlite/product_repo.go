package sqlite

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type productRepository struct {
	db *DB
}

// NewProductRepository creates a new SQLite ProductRepository implementation
func NewProductRepository(db *DB) repository.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Save(ctx context.Context, post *entity.ProductPost) error {
	pricesJSON, _ := json.Marshal(post.Prices)
	photosJSON, _ := json.Marshal(post.Photos)
	tagsJSON, _ := json.Marshal(post.Tags)

	isBest := 0
	if post.IsBestseller {
		isBest = 1
	}

	query := `
		INSERT INTO posts (
			id, post_url, date, timestamp, product_title, brand, text,
			prices_json, photos_json, tags_json, discount_percent, is_bestseller, views, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			product_title=excluded.product_title,
			brand=excluded.brand,
			text=excluded.text,
			prices_json=excluded.prices_json,
			photos_json=excluded.photos_json,
			tags_json=excluded.tags_json,
			discount_percent=excluded.discount_percent,
			is_bestseller=excluded.is_bestseller,
			views=excluded.views,
			updated_at=CURRENT_TIMESTAMP;
	`

	_, err := r.db.ExecContext(
		ctx, query,
		post.ID, post.PostURL, post.Date, post.Timestamp, post.ProductTitle, post.Brand, post.Text,
		string(pricesJSON), string(photosJSON), string(tagsJSON),
		post.DiscountPercent, isBest, post.Views,
	)
	return err
}

func (r *productRepository) SaveBatch(ctx context.Context, posts []*entity.ProductPost) (int, error) {
	if len(posts) == 0 {
		return 0, nil
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, `
		INSERT INTO posts (
			id, post_url, date, timestamp, product_title, brand, text,
			prices_json, photos_json, tags_json, discount_percent, is_bestseller, views, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			product_title=excluded.product_title,
			brand=excluded.brand,
			text=excluded.text,
			prices_json=excluded.prices_json,
			photos_json=excluded.photos_json,
			tags_json=excluded.tags_json,
			discount_percent=excluded.discount_percent,
			is_bestseller=excluded.is_bestseller,
			views=excluded.views,
			updated_at=CURRENT_TIMESTAMP;
	`)
	if err != nil {
		return 0, fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	savedCount := 0
	for _, p := range posts {
		pricesJSON, _ := json.Marshal(p.Prices)
		photosJSON, _ := json.Marshal(p.Photos)
		tagsJSON, _ := json.Marshal(p.Tags)

		isBest := 0
		if p.IsBestseller {
			isBest = 1
		}

		_, err := stmt.ExecContext(
			ctx,
			p.ID, p.PostURL, p.Date, p.Timestamp, p.ProductTitle, p.Brand, p.Text,
			string(pricesJSON), string(photosJSON), string(tagsJSON),
			p.DiscountPercent, isBest, p.Views,
		)
		if err == nil {
			savedCount++
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return savedCount, nil
}

func (r *productRepository) FindAll(ctx context.Context) ([]*entity.ProductPost, error) {
	query := `
		SELECT
			id, post_url, date, timestamp, product_title, brand, text,
			prices_json, photos_json, tags_json, discount_percent, is_bestseller, views, created_at, updated_at
		FROM posts
		ORDER BY timestamp DESC;
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query posts: %w", err)
	}
	defer rows.Close()

	var posts []*entity.ProductPost
	for rows.Next() {
		var (
			p                                  entity.ProductPost
			pricesStr, photosStr, tagsStr      string
			isBestInt                          int
			createdAtStr, updatedAtStr         string
		)

		err := rows.Scan(
			&p.ID, &p.PostURL, &p.Date, &p.Timestamp, &p.ProductTitle, &p.Brand, &p.Text,
			&pricesStr, &photosStr, &tagsStr,
			&p.DiscountPercent, &isBestInt, &p.Views,
			&createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post row: %w", err)
		}

		_ = json.Unmarshal([]byte(pricesStr), &p.Prices)
		_ = json.Unmarshal([]byte(photosStr), &p.Photos)
		_ = json.Unmarshal([]byte(tagsStr), &p.Tags)
		p.IsBestseller = isBestInt == 1
		p.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		p.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)

		posts = append(posts, &p)
	}

	return posts, nil
}

func (r *productRepository) FindByID(ctx context.Context, id string) (*entity.ProductPost, error) {
	query := `
		SELECT
			id, post_url, date, timestamp, product_title, brand, text,
			prices_json, photos_json, tags_json, discount_percent, is_bestseller, views, created_at, updated_at
		FROM posts
		WHERE id = ?;
	`

	row := r.db.QueryRowContext(ctx, query, id)
	var (
		p                             entity.ProductPost
		pricesStr, photosStr, tagsStr string
		isBestInt                     int
		createdAtStr, updatedAtStr    string
	)

	err := row.Scan(
		&p.ID, &p.PostURL, &p.Date, &p.Timestamp, &p.ProductTitle, &p.Brand, &p.Text,
		&pricesStr, &photosStr, &tagsStr,
		&p.DiscountPercent, &isBestInt, &p.Views,
		&createdAtStr, &updatedAtStr,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find post by id: %w", err)
	}

	_ = json.Unmarshal([]byte(pricesStr), &p.Prices)
	_ = json.Unmarshal([]byte(photosStr), &p.Photos)
	_ = json.Unmarshal([]byte(tagsStr), &p.Tags)
	p.IsBestseller = isBestInt == 1

	return &p, nil
}

func (r *productRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM posts WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *productRepository) Count(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM posts").Scan(&count)
	return count, err
}
