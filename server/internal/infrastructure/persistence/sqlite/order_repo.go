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

type orderRepository struct {
	db *DB
}

// NewOrderRepository creates a new SQLite OrderRepository implementation
func NewOrderRepository(db *DB) repository.OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(ctx context.Context, order *entity.Order) error {
	if order.OrderNumber == "" {
		order.OrderNumber = fmt.Sprintf("MK-%d", time.Now().UnixMilli()%1000000)
	}
	if order.Status == "" {
		order.Status = "new"
	}
	if order.Currency == "" {
		order.Currency = "UZS"
	}

	itemsJSON, _ := json.Marshal(order.Items)

	query := `
		INSERT INTO orders (
			order_number, customer_name, phone, channel_source, type,
			items_json, total_amount, currency, status,
			payment_receipt_url, payment_method, tracking_number, shipping_address,
			notes, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	`

	res, err := r.db.ExecContext(
		ctx, query,
		order.OrderNumber, order.CustomerName, order.Phone, order.ChannelSource, order.Type,
		string(itemsJSON), order.TotalAmount, order.Currency, order.Status,
		order.PaymentReceiptURL, order.PaymentMethod, order.TrackingNumber, order.ShippingAddress,
		order.Notes,
	)
	if err != nil {
		return fmt.Errorf("failed to insert order: %w", err)
	}

	id, err := res.LastInsertId()
	if err == nil {
		order.ID = id
	}
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	return nil
}

func (r *orderRepository) Update(ctx context.Context, order *entity.Order) error {
	itemsJSON, _ := json.Marshal(order.Items)
	query := `
		UPDATE orders SET
			customer_name = ?,
			phone = ?,
			items_json = ?,
			total_amount = ?,
			currency = ?,
			status = ?,
			payment_receipt_url = ?,
			payment_method = ?,
			tracking_number = ?,
			shipping_address = ?,
			notes = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?;
	`
	_, err := r.db.ExecContext(
		ctx, query,
		order.CustomerName, order.Phone, string(itemsJSON), order.TotalAmount, order.Currency,
		order.Status, order.PaymentReceiptURL, order.PaymentMethod, order.TrackingNumber, order.ShippingAddress,
		order.Notes, order.ID,
	)
	return err
}

func (r *orderRepository) FindAll(ctx context.Context, status string, search string, limit int, offset int) ([]*entity.Order, int, error) {
	if limit <= 0 {
		limit = 50
	}

	var (
		whereClauses []string
		args         []interface{}
	)

	if status != "" && status != "all" {
		whereClauses = append(whereClauses, "status = ?")
		args = append(args, status)
	}

	if search != "" {
		whereClauses = append(whereClauses, "(order_number LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR tracking_number LIKE ? OR notes LIKE ?)")
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM orders %s;", whereSQL)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Fetch page
	query := fmt.Sprintf(`
		SELECT id, order_number, customer_name, phone, channel_source, type,
		       items_json, total_amount, currency, status,
		       payment_receipt_url, payment_method, tracking_number, shipping_address,
		       notes, created_at, updated_at
		FROM orders
		%s
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?;
	`, whereSQL)

	fetchArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, query, fetchArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var orders []*entity.Order
	for rows.Next() {
		var (
			o                          entity.Order
			itemsJSON                  string
			createdAtStr, updatedAtStr string
		)

		err := rows.Scan(
			&o.ID, &o.OrderNumber, &o.CustomerName, &o.Phone, &o.ChannelSource, &o.Type,
			&itemsJSON, &o.TotalAmount, &o.Currency, &o.Status,
			&o.PaymentReceiptURL, &o.PaymentMethod, &o.TrackingNumber, &o.ShippingAddress,
			&o.Notes, &createdAtStr, &updatedAtStr,
		)
		if err != nil {
			return nil, 0, err
		}

		_ = json.Unmarshal([]byte(itemsJSON), &o.Items)
		o.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		o.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)

		orders = append(orders, &o)
	}

	return orders, total, nil
}

func (r *orderRepository) FindByID(ctx context.Context, id int64) (*entity.Order, error) {
	query := `
		SELECT id, order_number, customer_name, phone, channel_source, type,
		       items_json, total_amount, currency, status,
		       payment_receipt_url, payment_method, tracking_number, shipping_address,
		       notes, created_at, updated_at
		FROM orders
		WHERE id = ?;
	`
	var (
		o                          entity.Order
		itemsJSON                  string
		createdAtStr, updatedAtStr string
	)

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&o.ID, &o.OrderNumber, &o.CustomerName, &o.Phone, &o.ChannelSource, &o.Type,
		&itemsJSON, &o.TotalAmount, &o.Currency, &o.Status,
		&o.PaymentReceiptURL, &o.PaymentMethod, &o.TrackingNumber, &o.ShippingAddress,
		&o.Notes, &createdAtStr, &updatedAtStr,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	_ = json.Unmarshal([]byte(itemsJSON), &o.Items)
	o.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	o.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)

	return &o, nil
}

func (r *orderRepository) FindByOrderNumber(ctx context.Context, orderNumber string) (*entity.Order, error) {
	query := `
		SELECT id, order_number, customer_name, phone, channel_source, type,
		       items_json, total_amount, currency, status,
		       payment_receipt_url, payment_method, tracking_number, shipping_address,
		       notes, created_at, updated_at
		FROM orders
		WHERE LOWER(order_number) = LOWER(?);
	`
	var (
		o                          entity.Order
		itemsJSON                  string
		createdAtStr, updatedAtStr string
	)

	err := r.db.QueryRowContext(ctx, query, orderNumber).Scan(
		&o.ID, &o.OrderNumber, &o.CustomerName, &o.Phone, &o.ChannelSource, &o.Type,
		&itemsJSON, &o.TotalAmount, &o.Currency, &o.Status,
		&o.PaymentReceiptURL, &o.PaymentMethod, &o.TrackingNumber, &o.ShippingAddress,
		&o.Notes, &createdAtStr, &updatedAtStr,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	_ = json.Unmarshal([]byte(itemsJSON), &o.Items)
	o.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	o.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)

	return &o, nil
}

func (r *orderRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
	query := `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, status, id)
	return err
}

func (r *orderRepository) UpdateNotes(ctx context.Context, id int64, notes string) error {
	query := `UPDATE orders SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, notes, id)
	return err
}

func (r *orderRepository) UpdatePaymentReceipt(ctx context.Context, id int64, receiptURL, paymentMethod string) error {
	query := `
		UPDATE orders SET
			payment_receipt_url = ?,
			payment_method = CASE WHEN ? != '' THEN ? ELSE payment_method END,
			status = CASE WHEN status = 'new' THEN 'paid' ELSE status END,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?;
	`
	_, err := r.db.ExecContext(ctx, query, receiptURL, paymentMethod, paymentMethod, id)
	return err
}

func (r *orderRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM orders WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *orderRepository) Count(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM orders;").Scan(&count)
	return count, err
}

func (r *orderRepository) CountByStatus(ctx context.Context) (map[string]int, error) {
	query := `
		SELECT status, COUNT(*)
		FROM orders
		GROUP BY status;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var (
			st string
			c  int
		)
		if err := rows.Scan(&st, &c); err == nil {
			counts[st] = c
		}
	}
	return counts, nil
}
