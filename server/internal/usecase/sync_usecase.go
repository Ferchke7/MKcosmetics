package usecase

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/scraper"
)

type SyncUseCase struct {
	scraper     *scraper.TelegramScraper
	productRepo repository.ProductRepository
	channelRepo repository.ChannelRepository
	mu          sync.Mutex
	lastSync    time.Time
}

func NewSyncUseCase(
	scraper *scraper.TelegramScraper,
	productRepo repository.ProductRepository,
	channelRepo repository.ChannelRepository,
) *SyncUseCase {
	return &SyncUseCase{
		scraper:     scraper,
		productRepo: productRepo,
		channelRepo: channelRepo,
	}
}

// Sync performs scraping and saves the result to SQLite in an idempotent transaction
func (uc *SyncUseCase) Sync(ctx context.Context, deep bool) (int, error) {
	// Prevent concurrent duplicate sync operations
	if !uc.mu.TryLock() {
		return 0, fmt.Errorf("sync is already running")
	}
	defer uc.mu.Unlock()

	var (
		ch    *entity.ChannelInfo
		posts []*entity.ProductPost
		err   error
	)

	if deep {
		ch, posts, err = uc.scraper.ScrapeDeep(ctx, 40)
	} else {
		var earliest int
		ch, posts, earliest, err = uc.scraper.ScrapePage(ctx, 0)
		_ = earliest
	}

	if err != nil {
		return 0, fmt.Errorf("scraping failed: %w", err)
	}

	if ch != nil {
		if err := uc.channelRepo.Save(ctx, ch); err != nil {
			log.Printf("⚠️ Failed to save channel info: %v", err)
		}
	}

	if len(posts) > 0 {
		if _, err := uc.productRepo.SaveBatch(ctx, posts); err != nil {
			return 0, fmt.Errorf("failed to save posts batch: %w", err)
		}
	}

	uc.lastSync = time.Now()
	log.Printf("✅ Sync finished successfully. Saved %d posts to SQLite", len(posts))
	return len(posts), nil
}

// StartBackgroundWorker runs deep sync on empty DB and regular sync intervals
func (uc *SyncUseCase) StartBackgroundWorker(ctx context.Context, interval time.Duration) {
	go func() {
		// Wait 2 seconds for app bootstrap
		time.Sleep(2 * time.Second)

		count, err := uc.productRepo.Count(ctx)
		if err != nil {
			log.Printf("⚠️ Failed to count products in DB: %v", err)
		}

		if count < 20 {
			log.Printf("📥 Low post count (%d) in DB. Triggering initial Deep Scrape...", count)
			if _, err := uc.Sync(ctx, true); err != nil {
				log.Printf("⚠️ Initial deep sync error: %v", err)
			}
		} else {
			log.Printf("🔄 DB already contains %d posts. Running initial incremental sync...", count)
			if _, err := uc.Sync(ctx, false); err != nil {
				log.Printf("⚠️ Initial sync error: %v", err)
			}
		}

		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				log.Println("🛑 Telegram sync worker stopped")
				return
			case <-ticker.C:
				log.Println("⏰ Periodic Telegram incremental sync...")
				if _, err := uc.Sync(ctx, false); err != nil {
					log.Printf("⚠️ Periodic sync error: %v", err)
				}
			}
		}
	}()
}
