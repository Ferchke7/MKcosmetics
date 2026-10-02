package usecase

import (
	"context"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type FeedResponse struct {
	Posts       []*entity.ProductPost `json:"posts"`
	ChannelInfo entity.ChannelInfo    `json:"channelInfo"`
	Total       int                   `json:"total"`
	LastSync    string                `json:"lastSync"`
}

type FeedUseCase struct {
	productRepo repository.ProductRepository
	channelRepo repository.ChannelRepository
}

func NewFeedUseCase(productRepo repository.ProductRepository, channelRepo repository.ChannelRepository) *FeedUseCase {
	return &FeedUseCase{
		productRepo: productRepo,
		channelRepo: channelRepo,
	}
}

func (uc *FeedUseCase) GetFeed(ctx context.Context) (*FeedResponse, error) {
	posts, err := uc.productRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	channelInfo, err := uc.channelRepo.Get(ctx)
	if err != nil || channelInfo == nil {
		channelInfo = &entity.ChannelInfo{
			Title:            "MK cosmetics",
			Username:         "MK_korea_optom",
			SubscribersCount: "1.2k",
			Description:      "Korean Cosmetics Wholesale & Retail",
			UpdatedAt:        time.Now(),
		}
	}

	lastSync := ""
	if !channelInfo.UpdatedAt.IsZero() {
		lastSync = channelInfo.UpdatedAt.Format(time.RFC3339)
	} else {
		lastSync = time.Now().Format(time.RFC3339)
	}

	return &FeedResponse{
		Posts:       posts,
		ChannelInfo: *channelInfo,
		Total:       len(posts),
		LastSync:    lastSync,
	}, nil
}
