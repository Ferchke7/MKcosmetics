package entity

import (
	"time"
)

// ChannelInfo represents metadata about the Telegram channel
type ChannelInfo struct {
	Title            string    `json:"title"`
	Username         string    `json:"username"`
	AvatarURL        string    `json:"avatarUrl"`
	SubscribersCount string    `json:"subscribersCount"`
	Description      string    `json:"description"`
	UpdatedAt        time.Time `json:"updatedAt"`
}
