package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// UserRepository defines database operations for users
type UserRepository interface {
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	Create(ctx context.Context, user *entity.User) error
	UpdatePassword(ctx context.Context, userID int64, newHash string) error
	UpdateLastLogin(ctx context.Context, userID int64) error
	Count(ctx context.Context) (int, error)
}
