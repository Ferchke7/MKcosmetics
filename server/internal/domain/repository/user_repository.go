package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// UserRepository defines database operations for users and staff members
type UserRepository interface {
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	FindByID(ctx context.Context, id int64) (*entity.User, error)
	FindAll(ctx context.Context) ([]*entity.User, error)
	Create(ctx context.Context, user *entity.User) error
	Update(ctx context.Context, user *entity.User) error
	UpdatePassword(ctx context.Context, userID int64, newHash string) error
	UpdateLastLogin(ctx context.Context, userID int64) error
	Delete(ctx context.Context, id int64) error
	Count(ctx context.Context) (int, error)
}
