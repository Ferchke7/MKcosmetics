package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type SQLiteCustomerRepository struct {
	db *DB
}

func NewSQLiteCustomerRepository(db *DB) repository.CustomerRepository {
	return &SQLiteCustomerRepository{db: db}
}

func (r *SQLiteCustomerRepository) GetAll(ctx context.Context, filter entity.CustomerFilter) ([]entity.Customer, int, error) {
	var whereClauses []string
	var args []interface{}

	if filter.Search != "" {
		s := "%" + strings.ToLower(filter.Search) + "%"
		whereClauses = append(whereClauses, "(LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(telegram_username) LIKE ? OR LOWER(city) LIKE ?)")
		args = append(args, s, s, s, s)
	}

	if filter.Segment != "" && filter.Segment != "all" {
		whereClauses = append(whereClauses, "segment = ?")
		args = append(args, filter.Segment)
	}

	if filter.City != "" {
		whereClauses = append(whereClauses, "LOWER(city) = ?")
		args = append(args, strings.ToLower(filter.City))
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	// Count query
	countQuery := "SELECT COUNT(*) FROM customers " + whereSQL
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count customers: %w", err)
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}
	offset := filter.Offset
	if offset < 0 {
		offset = 0
	}

	query := fmt.Sprintf(`
		SELECT id, name, phone, email, telegram_username, city, delivery_address,
		       total_orders, total_spent, average_order_value, last_order_at, segment, notes, created_at, updated_at
		FROM customers
		%s
		ORDER BY total_spent DESC, total_orders DESC
		LIMIT ? OFFSET ?
	`, whereSQL)

	queryArgs := append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query customers: %w", err)
	}
	defer rows.Close()

	var customers []entity.Customer
	for rows.Next() {
		var c entity.Customer
		var lastOrder sql.NullTime

		err := rows.Scan(
			&c.ID, &c.Name, &c.Phone, &c.Email, &c.TelegramUsername, &c.City, &c.DeliveryAddress,
			&c.TotalOrders, &c.TotalSpent, &c.AverageOrderValue, &lastOrder, &c.Segment, &c.Notes,
			&c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan customer: %w", err)
		}
		if lastOrder.Valid {
			c.LastOrderAt = &lastOrder.Time
		}
		customers = append(customers, c)
	}

	return customers, total, nil
}

func (r *SQLiteCustomerRepository) GetByID(ctx context.Context, id int64) (*entity.Customer, error) {
	query := `
		SELECT id, name, phone, email, telegram_username, city, delivery_address,
		       total_orders, total_spent, average_order_value, last_order_at, segment, notes, created_at, updated_at
		FROM customers
		WHERE id = ?
	`
	var c entity.Customer
	var lastOrder sql.NullTime

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.Phone, &c.Email, &c.TelegramUsername, &c.City, &c.DeliveryAddress,
		&c.TotalOrders, &c.TotalSpent, &c.AverageOrderValue, &lastOrder, &c.Segment, &c.Notes,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get customer by id: %w", err)
	}
	if lastOrder.Valid {
		c.LastOrderAt = &lastOrder.Time
	}
	return &c, nil
}

func (r *SQLiteCustomerRepository) GetByPhone(ctx context.Context, phone string) (*entity.Customer, error) {
	query := `
		SELECT id, name, phone, email, telegram_username, city, delivery_address,
		       total_orders, total_spent, average_order_value, last_order_at, segment, notes, created_at, updated_at
		FROM customers
		WHERE phone = ?
	`
	var c entity.Customer
	var lastOrder sql.NullTime

	err := r.db.QueryRowContext(ctx, query, phone).Scan(
		&c.ID, &c.Name, &c.Phone, &c.Email, &c.TelegramUsername, &c.City, &c.DeliveryAddress,
		&c.TotalOrders, &c.TotalSpent, &c.AverageOrderValue, &lastOrder, &c.Segment, &c.Notes,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get customer by phone: %w", err)
	}
	if lastOrder.Valid {
		c.LastOrderAt = &lastOrder.Time
	}
	return &c, nil
}

func (r *SQLiteCustomerRepository) UpsertFromOrder(ctx context.Context, c entity.Customer) (*entity.Customer, error) {
	now := time.Now()
	// Check if customer exists by phone
	existing, err := r.GetByPhone(ctx, c.Phone)
	if err != nil {
		return nil, err
	}

	if existing == nil {
		// New customer
		segment := "new"
		if c.TotalSpent >= 3000000 {
			segment = "vip"
		}
		aov := c.TotalSpent
		if c.TotalOrders > 0 {
			aov = c.TotalSpent / float64(c.TotalOrders)
		}

		res, err := r.db.ExecContext(ctx, `
			INSERT INTO customers (
				name, phone, email, telegram_username, city, delivery_address,
				total_orders, total_spent, average_order_value, last_order_at, segment, notes, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, c.Name, c.Phone, c.Email, c.TelegramUsername, c.City, c.DeliveryAddress,
			c.TotalOrders, c.TotalSpent, aov, now, segment, c.Notes, now, now)
		if err != nil {
			return nil, fmt.Errorf("failed to insert customer: %w", err)
		}

		id, _ := res.LastInsertId()
		c.ID = id
		c.Segment = segment
		c.AverageOrderValue = aov
		c.LastOrderAt = &now
		c.CreatedAt = now
		c.UpdatedAt = now
		return &c, nil
	}

	// Update existing customer totals
	newTotalOrders := existing.TotalOrders + c.TotalOrders
	newTotalSpent := existing.TotalSpent + c.TotalSpent
	newAOV := 0.0
	if newTotalOrders > 0 {
		newAOV = newTotalSpent / float64(newTotalOrders)
	}

	segment := existing.Segment
	if newTotalSpent >= 5000000 || newTotalOrders >= 5 {
		segment = "vip"
	} else if newTotalOrders >= 2 {
		segment = "regular"
	}

	cityName := existing.City
	if c.City != "" {
		cityName = c.City
	}
	address := existing.DeliveryAddress
	if c.DeliveryAddress != "" {
		address = c.DeliveryAddress
	}
	name := existing.Name
	if c.Name != "" {
		name = c.Name
	}

	_, err = r.db.ExecContext(ctx, `
		UPDATE customers
		SET name = ?, city = ?, delivery_address = ?, total_orders = ?, total_spent = ?,
		    average_order_value = ?, last_order_at = ?, segment = ?, updated_at = ?
		WHERE id = ?
	`, name, cityName, address, newTotalOrders, newTotalSpent, newAOV, now, segment, now, existing.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to update customer from order: %w", err)
	}

	existing.Name = name
	existing.City = cityName
	existing.DeliveryAddress = address
	existing.TotalOrders = newTotalOrders
	existing.TotalSpent = newTotalSpent
	existing.AverageOrderValue = newAOV
	existing.LastOrderAt = &now
	existing.Segment = segment
	existing.UpdatedAt = now
	return existing, nil
}

func (r *SQLiteCustomerRepository) Update(ctx context.Context, c entity.Customer) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE customers
		SET name = ?, email = ?, telegram_username = ?, city = ?, delivery_address = ?,
		    segment = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, c.Name, c.Email, c.TelegramUsername, c.City, c.DeliveryAddress, c.Segment, c.Notes, c.ID)
	if err != nil {
		return fmt.Errorf("failed to update customer: %w", err)
	}
	return nil
}

func (r *SQLiteCustomerRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM customers WHERE id = ?", id)
	return err
}

func (r *SQLiteCustomerRepository) GetStats(ctx context.Context) (totalCustomers int, vipCount int, totalSpent float64, avgLTV float64, err error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*),
		       COALESCE(SUM(CASE WHEN segment = 'vip' THEN 1 ELSE 0 END), 0),
		       COALESCE(SUM(total_spent), 0),
		       COALESCE(AVG(total_spent), 0)
		FROM customers
	`)
	err = row.Scan(&totalCustomers, &vipCount, &totalSpent, &avgLTV)
	return
}
