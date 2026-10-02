package sqlite

import (
	"context"
	"database/sql"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type variantRepository struct {
	db *DB
}

// NewVariantRepository creates a new SQLite VariantRepository
func NewVariantRepository(db *DB) repository.VariantRepository {
	return &variantRepository{db: db}
}

func (r *variantRepository) Create(ctx context.Context, variant *entity.ProductVariant) error {
	if variant.StockStatus == "" {
		if variant.StockQuantity > 0 {
			variant.StockStatus = "in_stock"
		} else {
			variant.StockStatus = "out_of_stock"
		}
	}

	query := `
		INSERT INTO product_variants (
			product_id, variant_type, name, sku, cost_price, retail_price,
			stock_quantity, stock_status, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	`
	res, err := r.db.ExecContext(
		ctx, query,
		variant.ProductID, variant.VariantType, variant.Name, variant.SKU,
		variant.CostPrice, variant.RetailPrice, variant.StockQuantity, variant.StockStatus,
	)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err == nil {
		variant.ID = id
	}
	variant.CreatedAt = time.Now()
	variant.UpdatedAt = time.Now()
	return nil
}

func (r *variantRepository) Update(ctx context.Context, variant *entity.ProductVariant) error {
	query := `
		UPDATE product_variants SET
			variant_type = ?,
			name = ?,
			sku = ?,
			cost_price = ?,
			retail_price = ?,
			stock_quantity = ?,
			stock_status = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?;
	`
	_, err := r.db.ExecContext(
		ctx, query,
		variant.VariantType, variant.Name, variant.SKU, variant.CostPrice, variant.RetailPrice,
		variant.StockQuantity, variant.StockStatus, variant.ID,
	)
	return err
}

func (r *variantRepository) FindByProductID(ctx context.Context, productID string) ([]*entity.ProductVariant, error) {
	query := `
		SELECT id, product_id, variant_type, name, sku, cost_price, retail_price,
		       stock_quantity, stock_status, created_at, updated_at
		FROM product_variants
		WHERE product_id = ?
		ORDER BY id ASC;
	`
	rows, err := r.db.QueryContext(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []*entity.ProductVariant
	for rows.Next() {
		var (
			v                          entity.ProductVariant
			createdAtStr, updatedAtStr string
		)
		err := rows.Scan(
			&v.ID, &v.ProductID, &v.VariantType, &v.Name, &v.SKU,
			&v.CostPrice, &v.RetailPrice, &v.StockQuantity, &v.StockStatus,
			&createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, err
		}
		v.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		v.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
		variants = append(variants, &v)
	}
	return variants, nil
}

func (r *variantRepository) FindByID(ctx context.Context, id int64) (*entity.ProductVariant, error) {
	query := `
		SELECT id, product_id, variant_type, name, sku, cost_price, retail_price,
		       stock_quantity, stock_status, created_at, updated_at
		FROM product_variants
		WHERE id = ?;
	`
	var (
		v                          entity.ProductVariant
		createdAtStr, updatedAtStr string
	)
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&v.ID, &v.ProductID, &v.VariantType, &v.Name, &v.SKU,
		&v.CostPrice, &v.RetailPrice, &v.StockQuantity, &v.StockStatus,
		&createdAtStr, &updatedAtStr,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	v.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	v.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
	return &v, nil
}

func (r *variantRepository) FindAll(ctx context.Context) ([]*entity.ProductVariant, error) {
	query := `
		SELECT id, product_id, variant_type, name, sku, cost_price, retail_price,
		       stock_quantity, stock_status, created_at, updated_at
		FROM product_variants
		ORDER BY id DESC;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []*entity.ProductVariant
	for rows.Next() {
		var (
			v                          entity.ProductVariant
			createdAtStr, updatedAtStr string
		)
		err := rows.Scan(
			&v.ID, &v.ProductID, &v.VariantType, &v.Name, &v.SKU,
			&v.CostPrice, &v.RetailPrice, &v.StockQuantity, &v.StockStatus,
			&createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, err
		}
		v.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		v.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
		variants = append(variants, &v)
	}
	return variants, nil
}

func (r *variantRepository) UpdateStock(ctx context.Context, id int64, stockQuantity int, stockStatus string) error {
	query := `UPDATE product_variants SET stock_quantity = ?, stock_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, stockQuantity, stockStatus, id)
	return err
}

func (r *variantRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM product_variants WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
