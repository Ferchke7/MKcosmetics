package repository

import (
	"context"
	"mkcosmetics/server/internal/domain/entity"
)

// ChannelRepository defines storage operations for telegram channel info
type ChannelRepository interface {
	Save(ctx context.Context, info *entity.ChannelInfo) error
	Get(ctx context.Context) (*entity.ChannelInfo, error)
}
