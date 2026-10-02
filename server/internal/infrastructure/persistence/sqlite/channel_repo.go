package sqlite

import (
	"context"
	"database/sql"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type channelRepository struct {
	db *DB
}

// NewChannelRepository creates a new SQLite ChannelRepository implementation
func NewChannelRepository(db *DB) repository.ChannelRepository {
	return &channelRepository{db: db}
}

func (r *channelRepository) Save(ctx context.Context, info *entity.ChannelInfo) error {
	query := `
		INSERT INTO channel_info (id, title, username, avatar_url, subscribers_count, description, updated_at)
		VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET
			title=excluded.title,
			username=excluded.username,
			avatar_url=excluded.avatar_url,
			subscribers_count=excluded.subscribers_count,
			description=excluded.description,
			updated_at=CURRENT_TIMESTAMP;
	`

	_, err := r.db.ExecContext(
		ctx, query,
		info.Title, info.Username, info.AvatarURL, info.SubscribersCount, info.Description,
	)
	return err
}

func (r *channelRepository) Get(ctx context.Context) (*entity.ChannelInfo, error) {
	query := `
		SELECT title, username, avatar_url, subscribers_count, description, updated_at
		FROM channel_info
		WHERE id = 1;
	`

	row := r.db.QueryRowContext(ctx, query)
	var (
		ch           entity.ChannelInfo
		updatedAtStr string
	)

	err := row.Scan(
		&ch.Title, &ch.Username, &ch.AvatarURL, &ch.SubscribersCount, &ch.Description, &updatedAtStr,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return &entity.ChannelInfo{
				Title:       "MK KOREA COSMETIC",
				Username:    "mkcosmetkor",
				Description: "Оригинальная косметика из Южной Кореи",
				UpdatedAt:   time.Now(),
			}, nil
		}
		return nil, err
	}

	ch.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAtStr)
	return &ch, nil
}
