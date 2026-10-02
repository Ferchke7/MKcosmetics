package sqlite

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type userRepository struct {
	db *DB
}

// NewUserRepository creates a SQLite UserRepository implementation
func NewUserRepository(db *DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	query := `
		SELECT id, username, display_name, phone, password_hash, role, is_active, created_at, last_login
		FROM users
		WHERE LOWER(username) = LOWER(?)
		LIMIT 1;
	`
	var (
		u          entity.User
		createdStr string
		loginStr   sql.NullString
		isActive   int
	)

	err := r.db.QueryRowContext(ctx, query, strings.TrimSpace(username)).Scan(
		&u.ID, &u.Username, &u.DisplayName, &u.Phone, &u.PasswordHash, &u.Role, &isActive, &createdStr, &loginStr,
	)
	if err != nil {
		return nil, err
	}
	u.IsActive = isActive == 1

	if t, err := time.Parse(time.RFC3339, createdStr); err == nil {
		u.CreatedAt = t
	}
	if loginStr.Valid && loginStr.String != "" {
		if t, err := time.Parse(time.RFC3339, loginStr.String); err == nil {
			u.LastLogin = t
		}
	}

	return &u, nil
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*entity.User, error) {
	query := `
		SELECT id, username, display_name, phone, password_hash, role, is_active, created_at, last_login
		FROM users
		WHERE id = ?
		LIMIT 1;
	`
	var (
		u          entity.User
		createdStr string
		loginStr   sql.NullString
		isActive   int
	)

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID, &u.Username, &u.DisplayName, &u.Phone, &u.PasswordHash, &u.Role, &isActive, &createdStr, &loginStr,
	)
	if err != nil {
		return nil, err
	}
	u.IsActive = isActive == 1

	if t, err := time.Parse(time.RFC3339, createdStr); err == nil {
		u.CreatedAt = t
	}
	if loginStr.Valid && loginStr.String != "" {
		if t, err := time.Parse(time.RFC3339, loginStr.String); err == nil {
			u.LastLogin = t
		}
	}

	return &u, nil
}

func (r *userRepository) FindAll(ctx context.Context) ([]*entity.User, error) {
	query := `
		SELECT id, username, display_name, phone, password_hash, role, is_active, created_at, last_login
		FROM users
		ORDER BY id ASC;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entity.User
	for rows.Next() {
		var (
			u          entity.User
			createdStr string
			loginStr   sql.NullString
			isActive   int
		)
		err := rows.Scan(
			&u.ID, &u.Username, &u.DisplayName, &u.Phone, &u.PasswordHash, &u.Role, &isActive, &createdStr, &loginStr,
		)
		if err != nil {
			return nil, err
		}
		u.IsActive = isActive == 1
		if t, err := time.Parse(time.RFC3339, createdStr); err == nil {
			u.CreatedAt = t
		}
		if loginStr.Valid && loginStr.String != "" {
			if t, err := time.Parse(time.RFC3339, loginStr.String); err == nil {
				u.LastLogin = t
			}
		}
		users = append(users, &u)
	}
	return users, nil
}

func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
	isActive := 1
	if !user.IsActive {
		isActive = 0
	}
	query := `
		INSERT INTO users (username, display_name, phone, password_hash, role, is_active, created_at)
		VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
	`
	res, err := r.db.ExecContext(ctx, query, user.Username, user.DisplayName, user.Phone, user.PasswordHash, user.Role, isActive)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err == nil {
		user.ID = id
	}
	return nil
}

func (r *userRepository) Update(ctx context.Context, user *entity.User) error {
	isActive := 1
	if !user.IsActive {
		isActive = 0
	}
	query := `
		UPDATE users SET
			display_name = ?,
			phone = ?,
			role = ?,
			is_active = ?
		WHERE id = ?;
	`
	_, err := r.db.ExecContext(ctx, query, user.DisplayName, user.Phone, user.Role, isActive, user.ID)
	return err
}

func (r *userRepository) UpdatePassword(ctx context.Context, userID int64, newHash string) error {
	query := `UPDATE users SET password_hash = ? WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, newHash, userID)
	return err
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, userID int64) error {
	query := `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?;`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

func (r *userRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM users WHERE id = ? AND username != 'admin';`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *userRepository) Count(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users;").Scan(&count)
	return count, err
}

// HashPassword hashes a plain password with a unique salt: salt$hash
func HashPassword(password string) (string, error) {
	saltBytes := make([]byte, 16)
	if _, err := rand.Read(saltBytes); err != nil {
		return "", err
	}
	salt := hex.EncodeToString(saltBytes)

	h := sha256.New()
	h.Write([]byte(salt + password))
	hash := hex.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("%s$%s", salt, hash), nil
}

// CheckPassword verifies a plain password against salt$hash
func CheckPassword(password, storedHash string) bool {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 2 {
		return false
	}
	salt, expectedHash := parts[0], parts[1]

	h := sha256.New()
	h.Write([]byte(salt + password))
	computedHash := hex.EncodeToString(h.Sum(nil))

	return computedHash == expectedHash
}
