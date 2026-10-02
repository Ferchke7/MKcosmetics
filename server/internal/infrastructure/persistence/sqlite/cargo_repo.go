package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type cargoRepository struct {
	db *DB
}

// NewCargoRepository creates a new SQLite CargoRepository
func NewCargoRepository(db *DB) repository.CargoRepository {
	return &cargoRepository{db: db}
}

func (r *cargoRepository) Create(ctx context.Context, batch *entity.CargoBatch) error {
	if batch.BatchCode == "" {
		batch.BatchCode = fmt.Sprintf("MK-CARGO-%d", time.Now().Unix()%100000)
	}
	if batch.Status == "" {
		batch.Status = "draft"
	}

	query := `
		INSERT INTO cargo_batches (
			batch_code, title, origin, destination, awb_number, carrier,
			weight_kg, rate_per_kg, departure_date, arrival_date, status, notes,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
	`

	res, err := r.db.ExecContext(
		ctx, query,
		batch.BatchCode, batch.Title, batch.Origin, batch.Destination, batch.AWBNumber, batch.Carrier,
		batch.WeightKg, batch.RatePerKg, batch.DepartureDate, batch.ArrivalDate, batch.Status, batch.Notes,
	)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err == nil {
		batch.ID = id
	}
	batch.CreatedAt = time.Now()
	batch.UpdatedAt = time.Now()
	return nil
}

func (r *cargoRepository) Update(ctx context.Context, batch *entity.CargoBatch) error {
	query := `
		UPDATE cargo_batches SET
			title = ?,
			origin = ?,
			destination = ?,
			awb_number = ?,
			carrier = ?,
			weight_kg = ?,
			rate_per_kg = ?,
			departure_date = ?,
			arrival_date = ?,
			status = ?,
			notes = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?;
	`
	_, err := r.db.ExecContext(
		ctx, query,
		batch.Title, batch.Origin, batch.Destination, batch.AWBNumber, batch.Carrier,
		batch.WeightKg, batch.RatePerKg, batch.DepartureDate, batch.ArrivalDate, batch.Status, batch.Notes,
		batch.ID,
	)
	return err
}

func (r *cargoRepository) FindAll(ctx context.Context) ([]*entity.CargoBatch, error) {
	query := `
		SELECT b.id, b.batch_code, b.title, b.origin, b.destination, b.awb_number, b.carrier,
		       b.weight_kg, b.rate_per_kg, b.departure_date, b.arrival_date, b.status, b.notes,
		       b.created_at, b.updated_at,
		       (SELECT COUNT(*) FROM orders o WHERE o.cargo_batch_id = b.id) as order_count
		FROM cargo_batches b
		ORDER BY b.created_at DESC;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var batches []*entity.CargoBatch
	for rows.Next() {
		var (
			b                          entity.CargoBatch
			createdAtStr, updatedAtStr string
		)
		err := rows.Scan(
			&b.ID, &b.BatchCode, &b.Title, &b.Origin, &b.Destination, &b.AWBNumber, &b.Carrier,
			&b.WeightKg, &b.RatePerKg, &b.DepartureDate, &b.ArrivalDate, &b.Status, &b.Notes,
			&createdAtStr, &updatedAtStr, &b.OrderCount,
		)
		if err != nil {
			return nil, err
		}
		b.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		b.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
		batches = append(batches, &b)
	}
	return batches, nil
}

func (r *cargoRepository) FindByID(ctx context.Context, id int64) (*entity.CargoBatch, error) {
	query := `
		SELECT b.id, b.batch_code, b.title, b.origin, b.destination, b.awb_number, b.carrier,
		       b.weight_kg, b.rate_per_kg, b.departure_date, b.arrival_date, b.status, b.notes,
		       b.created_at, b.updated_at,
		       (SELECT COUNT(*) FROM orders o WHERE o.cargo_batch_id = b.id) as order_count
		FROM cargo_batches b
		WHERE b.id = ?;
	`
	var (
		b                          entity.CargoBatch
		createdAtStr, updatedAtStr string
	)
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&b.ID, &b.BatchCode, &b.Title, &b.Origin, &b.Destination, &b.AWBNumber, &b.Carrier,
		&b.WeightKg, &b.RatePerKg, &b.DepartureDate, &b.ArrivalDate, &b.Status, &b.Notes,
		&createdAtStr, &updatedAtStr, &b.OrderCount,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	b.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	b.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
	return &b, nil
}

func (r *cargoRepository) FindByBatchCode(ctx context.Context, code string) (*entity.CargoBatch, error) {
	query := `
		SELECT b.id, b.batch_code, b.title, b.origin, b.destination, b.awb_number, b.carrier,
		       b.weight_kg, b.rate_per_kg, b.departure_date, b.arrival_date, b.status, b.notes,
		       b.created_at, b.updated_at,
		       (SELECT COUNT(*) FROM orders o WHERE o.cargo_batch_id = b.id) as order_count
		FROM cargo_batches b
		WHERE LOWER(b.batch_code) = LOWER(?);
	`
	var (
		b                          entity.CargoBatch
		createdAtStr, updatedAtStr string
	)
	err := r.db.QueryRowContext(ctx, query, code).Scan(
		&b.ID, &b.BatchCode, &b.Title, &b.Origin, &b.Destination, &b.AWBNumber, &b.Carrier,
		&b.WeightKg, &b.RatePerKg, &b.DepartureDate, &b.ArrivalDate, &b.Status, &b.Notes,
		&createdAtStr, &updatedAtStr, &b.OrderCount,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	b.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
	b.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
	return &b, nil
}

func (r *cargoRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
	query := `UPDATE cargo_batches SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, status, id)
	return err
}

func (r *cargoRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM cargo_batches WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *cargoRepository) Count(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM cargo_batches;").Scan(&count)
	return count, err
}
