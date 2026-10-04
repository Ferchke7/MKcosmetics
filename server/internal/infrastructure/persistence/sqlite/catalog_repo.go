package sqlite

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type catalogRepository struct {
	db *DB
}

func NewCatalogRepository(db *DB) repository.CatalogRepository {
	return &catalogRepository{db: db}
}

func (r *catalogRepository) UpsertProducts(ctx context.Context, products []entity.CatalogProduct) (int, int, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, 0, err
	}
	defer tx.Rollback()

	added := 0
	updated := 0

	query := `
	INSERT INTO catalog_products (
		source_id, slug, title, brand, description, excerpt,
		category_id, category_title, category_slug,
		price_krw, old_price_krw, discount_pct, stock, in_stock, archived,
		photos_json, synced_at, created_at, updated_at
	) VALUES (
		?, ?, ?, ?, ?, ?,
		?, ?, ?,
		?, ?, ?, ?, ?, ?,
		?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
	)
	ON CONFLICT(source_id) DO UPDATE SET
		slug = excluded.slug,
		title = excluded.title,
		brand = CASE WHEN catalog_products.brand_override != '' THEN catalog_products.brand ELSE excluded.brand END,
		description = excluded.description,
		excerpt = CASE WHEN catalog_products.excerpt_override != '' THEN catalog_products.excerpt ELSE excluded.excerpt END,
		category_id = excluded.category_id,
		category_title = excluded.category_title,
		category_slug = excluded.category_slug,
		price_krw = excluded.price_krw,
		old_price_krw = excluded.old_price_krw,
		discount_pct = excluded.discount_pct,
		stock = excluded.stock,
		in_stock = excluded.in_stock,
		archived = excluded.archived,
		photos_json = excluded.photos_json,
		synced_at = CURRENT_TIMESTAMP,
		updated_at = CURRENT_TIMESTAMP;
	`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return 0, 0, err
	}
	defer stmt.Close()

	checkStmt, err := tx.PrepareContext(ctx, `SELECT id FROM catalog_products WHERE source_id = ?`)
	if err != nil {
		return 0, 0, err
	}
	defer checkStmt.Close()

	for _, p := range products {
		var existingID int64
		err := checkStmt.QueryRowContext(ctx, p.SourceID).Scan(&existingID)
		isNew := (err == sql.ErrNoRows)

		photosJSON, _ := json.Marshal(p.Photos)

		inStockInt := 0
		if p.InStock {
			inStockInt = 1
		}
		archivedInt := 0
		if p.Archived {
			archivedInt = 1
		}

		_, err = stmt.ExecContext(ctx,
			p.SourceID, p.Slug, p.Title, p.Brand, p.Description, p.Excerpt,
			p.CategoryID, p.CategoryTitle, p.CategorySlug,
			p.PriceKRW, p.OldPriceKRW, p.DiscountPct, p.Stock, inStockInt, archivedInt,
			string(photosJSON),
		)
		if err != nil {
			return 0, 0, fmt.Errorf("upsert product %d failed: %w", p.SourceID, err)
		}

		if isNew {
			added++
		} else {
			updated++
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, 0, err
	}
	return added, updated, nil
}

func (r *catalogRepository) UpsertCategories(ctx context.Context, categories []entity.CatalogCategory) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
	INSERT INTO catalog_categories (id, parent_id, title, slug, photo_url, count)
	VALUES (?, ?, ?, ?, ?, ?)
	ON CONFLICT(id) DO UPDATE SET
		parent_id = excluded.parent_id,
		title = excluded.title,
		slug = excluded.slug,
		photo_url = excluded.photo_url,
		count = excluded.count;
	`
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, c := range categories {
		_, err := stmt.ExecContext(ctx, c.ID, c.ParentID, c.Title, c.Slug, c.Photo, c.Count)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *catalogRepository) ArchiveMissing(ctx context.Context, currentSourceIDs []int64) (int, error) {
	if len(currentSourceIDs) == 0 {
		return 0, nil
	}

	// Build placeholder list
	placeholders := make([]string, len(currentSourceIDs))
	args := make([]interface{}, len(currentSourceIDs))
	for i, id := range currentSourceIDs {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf(`
		UPDATE catalog_products
		SET archived = 1, in_stock = 0, updated_at = CURRENT_TIMESTAMP
		WHERE source_id NOT IN (%s) AND archived = 0;
	`, strings.Join(placeholders, ","))

	res, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return 0, err
	}
	affected, _ := res.RowsAffected()
	return int(affected), nil
}

func scanProduct(scanner interface {
	Scan(dest ...interface{}) error
}) (*entity.CatalogProduct, error) {
	var (
		p                               entity.CatalogProduct
		photosJSON                      string
		inStockInt, archivedInt         int
		isHitInt, isHiddenInt           int
		syncedAtStr, createdStr, updStr string
	)

	err := scanner.Scan(
		&p.ID, &p.SourceID, &p.Slug, &p.Title, &p.Brand, &p.Description, &p.Excerpt,
		&p.CategoryID, &p.CategoryTitle, &p.CategorySlug,
		&p.PriceKRW, &p.OldPriceKRW, &p.DiscountPct, &p.Stock, &inStockInt, &archivedInt,
		&photosJSON, &isHitInt, &isHiddenInt, &p.BrandOverride, &p.ExcerptOverride,
		&syncedAtStr, &createdStr, &updStr,
	)
	if err != nil {
		return nil, err
	}

	p.InStock = inStockInt == 1
	p.Archived = archivedInt == 1
	p.IsHit = isHitInt == 1
	p.IsHidden = isHiddenInt == 1

	if p.BrandOverride != "" {
		p.Brand = p.BrandOverride
	}
	if p.ExcerptOverride != "" {
		p.Excerpt = p.ExcerptOverride
	}

	_ = json.Unmarshal([]byte(photosJSON), &p.Photos)
	p.Name = p.Title
	p.CategoryName = p.CategoryTitle
	for _, ph := range p.Photos {
		if ph.Full != "" {
			p.Images = append(p.Images, ph.Full)
		} else if ph.W600 != "" {
			p.Images = append(p.Images, ph.W600)
		}
	}

	p.SyncedAt, _ = time.Parse(time.RFC3339, syncedAtStr)
	p.CreatedAt, _ = time.Parse(time.RFC3339, createdStr)
	p.UpdatedAt, _ = time.Parse(time.RFC3339, updStr)

	return &p, nil
}

const productCols = `
	id, source_id, slug, title, brand, description, excerpt,
	category_id, category_title, category_slug,
	price_krw, old_price_krw, discount_pct, stock, in_stock, archived,
	photos_json, is_hit, is_hidden, brand_override, excerpt_override,
	synced_at, created_at, updated_at
`

func (r *catalogRepository) List(ctx context.Context, f repository.CatalogFilter) ([]entity.CatalogProduct, int, error) {
	var whereClauses []string
	var args []interface{}

	if !f.IncludeAdmin {
		whereClauses = append(whereClauses, "is_hidden = 0", "archived = 0")
	}

	if f.CategoryID != nil && *f.CategoryID > 0 {
		whereClauses = append(whereClauses, "category_id = ?")
		args = append(args, *f.CategoryID)
	} else if f.CategorySlug != "" && f.CategorySlug != "all" {
		whereClauses = append(whereClauses, "category_slug = ?")
		args = append(args, f.CategorySlug)
	}

	if len(f.Brands) > 0 {
		var brandPlaceholders []string
		for _, b := range f.Brands {
			brandPlaceholders = append(brandPlaceholders, "?")
			args = append(args, strings.TrimSpace(b))
		}
		whereClauses = append(whereClauses, fmt.Sprintf("COALESCE(NULLIF(brand_override, ''), brand) IN (%s)", strings.Join(brandPlaceholders, ",")))
	}

	if f.MinPrice != nil && *f.MinPrice > 0 {
		whereClauses = append(whereClauses, "price_krw >= ?")
		args = append(args, *f.MinPrice)
	}
	if f.MaxPrice != nil && *f.MaxPrice > 0 {
		whereClauses = append(whereClauses, "price_krw <= ?")
		args = append(args, *f.MaxPrice)
	}

	if f.InStockOnly {
		whereClauses = append(whereClauses, "in_stock = 1")
	}
	if f.DiscountOnly {
		whereClauses = append(whereClauses, "discount_pct > 0")
	}

	if f.Query != "" {
		qPattern := "%" + strings.TrimSpace(f.Query) + "%"
		whereClauses = append(whereClauses, "(title LIKE ? OR brand LIKE ? OR brand_override LIKE ? OR description LIKE ?)")
		args = append(args, qPattern, qPattern, qPattern, qPattern)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM catalog_products %s;", whereSQL)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Order by
	orderBy := "in_stock DESC, is_hit DESC, updated_at DESC"
	switch f.Sort {
	case "price_asc":
		orderBy = "price_krw ASC"
	case "price_desc":
		orderBy = "price_krw DESC"
	case "discount":
		orderBy = "discount_pct DESC, price_krw ASC"
	case "newest":
		orderBy = "created_at DESC"
	case "name_asc":
		orderBy = "title ASC"
	case "popular":
		orderBy = "is_hit DESC, in_stock DESC, discount_pct DESC, id DESC"
	}

	pageSize := f.PageSize
	if pageSize <= 0 {
		pageSize = 24
	}
	page := f.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * pageSize

	query := fmt.Sprintf(`
		SELECT %s FROM catalog_products
		%s
		ORDER BY %s
		LIMIT ? OFFSET ?;
	`, productCols, whereSQL, orderBy)

	fetchArgs := append(args, pageSize, offset)
	rows, err := r.db.QueryContext(ctx, query, fetchArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var products []entity.CatalogProduct
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, 0, err
		}
		products = append(products, *p)
	}

	return products, total, nil
}

func (r *catalogRepository) GetBySlug(ctx context.Context, slug string) (*entity.CatalogProduct, error) {
	query := fmt.Sprintf(`SELECT %s FROM catalog_products WHERE slug = ? LIMIT 1;`, productCols)
	row := r.db.QueryRowContext(ctx, query, slug)
	p, err := scanProduct(row)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *catalogRepository) GetByID(ctx context.Context, id int64) (*entity.CatalogProduct, error) {
	query := fmt.Sprintf(`SELECT %s FROM catalog_products WHERE id = ? LIMIT 1;`, productCols)
	row := r.db.QueryRowContext(ctx, query, id)
	p, err := scanProduct(row)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *catalogRepository) GetByIDs(ctx context.Context, ids []int64) ([]entity.CatalogProduct, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	placeholders := make([]string, len(ids))
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf(`SELECT %s FROM catalog_products WHERE id IN (%s);`, productCols, strings.Join(placeholders, ","))
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []entity.CatalogProduct
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, *p)
	}
	return products, nil
}

func (r *catalogRepository) GetCategories(ctx context.Context) ([]entity.CatalogCategory, error) {
	query := `
		SELECT c.id, c.parent_id, c.title, c.slug, c.photo_url,
		       (SELECT COUNT(*) FROM catalog_products p WHERE p.category_id = c.id AND p.is_hidden = 0 AND p.archived = 0) as real_count
		FROM catalog_categories c
		WHERE c.id != 588129 -- exclude root generic container
		ORDER BY real_count DESC, c.title ASC;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cats []entity.CatalogCategory
	for rows.Next() {
		var c entity.CatalogCategory
		if err := rows.Scan(&c.ID, &c.ParentID, &c.Title, &c.Slug, &c.Photo, &c.Count); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	return cats, nil
}

func (r *catalogRepository) GetBrands(ctx context.Context) ([]entity.CatalogBrand, error) {
	query := `
		SELECT COALESCE(NULLIF(brand_override, ''), brand) as effective_brand, COUNT(*) as cnt
		FROM catalog_products
		WHERE is_hidden = 0 AND archived = 0 AND COALESCE(NULLIF(brand_override, ''), brand) != ''
		GROUP BY effective_brand
		ORDER BY cnt DESC, effective_brand ASC;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var brands []entity.CatalogBrand
	for rows.Next() {
		var b entity.CatalogBrand
		if err := rows.Scan(&b.Name, &b.Count); err != nil {
			return nil, err
		}
		b.Slug = strings.ToLower(strings.ReplaceAll(b.Name, " ", "-"))
		brands = append(brands, b)
	}
	return brands, nil
}

func (r *catalogRepository) GetHits(ctx context.Context, limit int) ([]entity.CatalogProduct, error) {
	if limit <= 0 {
		limit = 10
	}
	query := fmt.Sprintf(`
		SELECT %s FROM catalog_products
		WHERE is_hidden = 0 AND archived = 0 AND in_stock = 1
		ORDER BY is_hit DESC, discount_pct DESC, id DESC
		LIMIT ?;
	`, productCols)

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []entity.CatalogProduct
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, *p)
	}
	return products, nil
}

func (r *catalogRepository) GetSets(ctx context.Context, limit int) ([]entity.CatalogProduct, error) {
	if limit <= 0 {
		limit = 10
	}
	query := fmt.Sprintf(`
		SELECT %s FROM catalog_products
		WHERE is_hidden = 0 AND archived = 0 AND in_stock = 1
		  AND (category_slug LIKE '%%nabor%%' OR category_title LIKE '%%Набор%%' OR title LIKE '%%Set%%' OR title LIKE '%%Набор%%')
		ORDER BY discount_pct DESC, updated_at DESC
		LIMIT ?;
	`, productCols)

	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []entity.CatalogProduct
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, *p)
	}
	return products, nil
}

func (r *catalogRepository) GetRelated(ctx context.Context, categoryID int64, currentID int64, limit int) ([]entity.CatalogProduct, error) {
	if limit <= 0 {
		limit = 4
	}
	query := fmt.Sprintf(`
		SELECT %s FROM catalog_products
		WHERE is_hidden = 0 AND archived = 0 AND in_stock = 1
		  AND category_id = ? AND id != ?
		ORDER BY updated_at DESC
		LIMIT ?;
	`, productCols)

	rows, err := r.db.QueryContext(ctx, query, categoryID, currentID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []entity.CatalogProduct
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, *p)
	}
	return products, nil
}

func (r *catalogRepository) UpdateOverrides(ctx context.Context, id int64, isHit *bool, isHidden *bool, brandOverride *string, excerptOverride *string) error {
	var sets []string
	var args []interface{}

	if isHit != nil {
		val := 0
		if *isHit {
			val = 1
		}
		sets = append(sets, "is_hit = ?")
		args = append(args, val)
	}
	if isHidden != nil {
		val := 0
		if *isHidden {
			val = 1
		}
		sets = append(sets, "is_hidden = ?")
		args = append(args, val)
	}
	if brandOverride != nil {
		sets = append(sets, "brand_override = ?")
		args = append(args, *brandOverride)
	}
	if excerptOverride != nil {
		sets = append(sets, "excerpt_override = ?")
		args = append(args, *excerptOverride)
	}

	if len(sets) == 0 {
		return nil
	}

	sets = append(sets, "updated_at = CURRENT_TIMESTAMP")
	args = append(args, id)

	query := fmt.Sprintf("UPDATE catalog_products SET %s WHERE id = ?;", strings.Join(sets, ", "))
	_, err := r.db.ExecContext(ctx, query, args...)
	return err
}

func (r *catalogRepository) LogSync(ctx context.Context, res entity.CatalogSyncResult) error {
	query := `
		INSERT INTO catalog_sync_log (added, updated, archived, total, duration_ms, error_message, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?);
	`
	_, err := r.db.ExecContext(ctx, query, res.Added, res.Updated, res.Archived, res.Total, res.DurationMs, res.Error, res.At)
	return err
}

func (r *catalogRepository) GetLatestSyncLogs(ctx context.Context, limit int) ([]entity.CatalogSyncResult, error) {
	if limit <= 0 {
		limit = 20
	}
	query := `
		SELECT added, updated, archived, total, duration_ms, error_message, created_at
		FROM catalog_sync_log
		ORDER BY created_at DESC
		LIMIT ?;
	`
	rows, err := r.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []entity.CatalogSyncResult
	for rows.Next() {
		var l entity.CatalogSyncResult
		var atStr string
		if err := rows.Scan(&l.Added, &l.Updated, &l.Archived, &l.Total, &l.DurationMs, &l.Error, &atStr); err != nil {
			return nil, err
		}
		l.At, _ = time.Parse(time.RFC3339, atStr)
		logs = append(logs, l)
	}
	return logs, nil
}

func (r *catalogRepository) GetCatalogStats(ctx context.Context) (int, int, int, int, int, error) {
	query := `
		SELECT
			COUNT(*) as total,
			SUM(CASE WHEN in_stock = 1 AND is_hidden = 0 AND archived = 0 THEN 1 ELSE 0 END) as in_stock_cnt,
			SUM(CASE WHEN is_hit = 1 THEN 1 ELSE 0 END) as hit_cnt,
			SUM(CASE WHEN is_hidden = 1 THEN 1 ELSE 0 END) as hidden_cnt,
			SUM(CASE WHEN archived = 1 THEN 1 ELSE 0 END) as archived_cnt
		FROM catalog_products;
	`
	var (
		total, inStock, hits, hidden, archived sql.NullInt64
	)
	err := r.db.QueryRowContext(ctx, query).Scan(&total, &inStock, &hits, &hidden, &archived)
	if err != nil {
		return 0, 0, 0, 0, 0, err
	}
	return int(total.Int64), int(inStock.Int64), int(hits.Int64), int(hidden.Int64), int(archived.Int64), nil
}
