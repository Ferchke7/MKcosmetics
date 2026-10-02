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
		SELECT id, username, password_hash, role, created_at, last_login
		FROM users
		WHERE LOWER(username) = LOWER(?)
		LIMIT 1;
	`
	var (
		u          entity.User
		createdStr string
		loginStr   sql.NullString
	)

	err := r.db.QueryRowContext(ctx, query, strings.TrimSpace(username)).Scan(
		&u.ID, &u.Username, &u.PasswordHash, &u.Role, &createdStr, &loginStr,
	)
	if err != nil {
		return nil, err
	}

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

func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
	query := `
		INSERT INTO users (username, password_hash, role, created_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP);
	`
	res, err := r.db.ExecContext(ctx, query, user.Username, user.PasswordHash, user.Role)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err == nil {
		user.ID = id
	}
	return nil
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
	h.Write([]byte(salt + ":" + password))
	hash := hex.EncodeToString(h.Sum(nil))

	return fmt.Sprintf("%s$%s", salt, hash), nil
}

// CheckPassword verifies a plain password against the stored salt$hash
func CheckPassword(password, storedHash string) bool {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 2 {
		// Fallback for raw SHA-256 if needed
		h := sha256.Sum256([]byte(password))
		return hex.EncodeToString(h[:]) == storedHash
	}

	salt := parts[0]
	expectedHash := parts[1]

	h := sha256.New()
	h.Write([]byte(salt + ":" + password))
	computedHash := hex.EncodeToString(h.Sum(nil))

	return computedHash == expectedHash
}
