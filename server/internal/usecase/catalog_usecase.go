package usecase

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/bcatalog"
)

type CatalogUseCase struct {
	bcatClient  *bcatalog.Client
	catalogRepo repository.CatalogRepository
	mu          sync.Mutex
	lastSync    time.Time
}

func NewCatalogUseCase(bcatClient *bcatalog.Client, catalogRepo repository.CatalogRepository) *CatalogUseCase {
	return &CatalogUseCase{
		bcatClient:  bcatClient,
		catalogRepo: catalogRepo,
	}
}

func (uc *CatalogUseCase) IngestRawProducts(ctx context.Context, rawProducts []bcatalog.RawProduct) (*entity.CatalogSyncResult, error) {
	start := time.Now()
	res := entity.CatalogSyncResult{
		At:    start,
		Total: len(rawProducts),
	}

	if len(rawProducts) == 0 {
		return &res, nil
	}

	// Collect unique categories & map products
	catMap := make(map[int64]entity.CatalogCategory)
	products := make([]entity.CatalogProduct, 0, len(rawProducts))
	seenSourceIDs := make([]int64, 0, len(rawProducts))

	for _, raw := range rawProducts {
		seenSourceIDs = append(seenSourceIDs, raw.ID)
		p := bcatalog.MapRawProductToEntity(raw)
		products = append(products, p)

		if raw.Category != nil {
			c := bcatalog.MapRawCategoryToEntity(*raw.Category)
			catMap[c.ID] = c
		}
	}

	var categories []entity.CatalogCategory
	for _, c := range catMap {
		categories = append(categories, c)
	}

	// 1. Upsert categories
	if err := uc.catalogRepo.UpsertCategories(ctx, categories); err != nil {
		log.Printf("[CatalogSync] Warning: failed to upsert categories: %v", err)
	}

	// 2. Upsert products
	added, updated, err := uc.catalogRepo.UpsertProducts(ctx, products)
	if err != nil {
		res.Error = err.Error()
		res.DurationMs = time.Since(start).Milliseconds()
		_ = uc.catalogRepo.LogSync(ctx, res)
		return &res, fmt.Errorf("ошибка сохранения товаров в БД: %w", err)
	}
	res.Added = added
	res.Updated = updated

	// 3. Archive missing
	archived, err := uc.catalogRepo.ArchiveMissing(ctx, seenSourceIDs)
	if err != nil {
		log.Printf("[CatalogSync] Warning: failed to archive missing products: %v", err)
	}
	res.Archived = archived

	res.DurationMs = time.Since(start).Milliseconds()
	uc.lastSync = time.Now()

	_ = uc.catalogRepo.LogSync(ctx, res)
	log.Printf("[CatalogSync] Успешно обработано: %d товаров (добавлено: %d, обновлено: %d, в архиве: %d) за %d мс",
		res.Total, res.Added, res.Updated, res.Archived, res.DurationMs)

	return &res, nil
}

func (uc *CatalogUseCase) Sync(ctx context.Context) (*entity.CatalogSyncResult, error) {
	if !uc.mu.TryLock() {
		return nil, fmt.Errorf("синхронизация каталога уже выполняется")
	}
	defer uc.mu.Unlock()

	start := time.Now()
	res := entity.CatalogSyncResult{
		At: start,
	}

	rawProducts, err := uc.bcatClient.FetchAllProducts(ctx)
	if err != nil {
		log.Printf("[CatalogSync] ⚠️ Ошибка запроса к b-catalog: %v", err)

		// Check if DB is empty; if so, populate from embedded snapshot so site is never blank!
		total, _, _, _, _, statsErr := uc.catalogRepo.GetCatalogStats(ctx)
		if statsErr == nil && total == 0 {
			log.Printf("[CatalogSync] 📦 База пуста, загружаем встроенный снимок товаров...")
			seed := bcatalog.GetEmbeddedSeedProducts()
			if len(seed) > 0 {
				seedRes, ingestErr := uc.IngestRawProducts(ctx, seed)
				if ingestErr == nil {
					log.Printf("[CatalogSync] ✅ Встроенный снимок загружен: %d товаров", seedRes.Total)
					return seedRes, nil
				}
			}
		}

		res.Error = err.Error()
		res.DurationMs = time.Since(start).Milliseconds()
		_ = uc.catalogRepo.LogSync(ctx, res)
		return &res, fmt.Errorf("ошибка получения товаров из Бизнес.Каталог: %w", err)
	}

	return uc.IngestRawProducts(ctx, rawProducts)
}

func (uc *CatalogUseCase) StartBackgroundWorker(ctx context.Context, interval time.Duration) {
	go func() {
		// Immediately check if DB has products; if 0, load embedded seed right away (15ms)
		total, _, _, _, _, err := uc.catalogRepo.GetCatalogStats(ctx)
		if err == nil && total == 0 {
			log.Printf("[CatalogSync] 📦 Инициализация: каталог пуст. Загрузка встроенного снимка 207 товаров...")
			seed := bcatalog.GetEmbeddedSeedProducts()
			if len(seed) > 0 {
				if seedRes, ingestErr := uc.IngestRawProducts(ctx, seed); ingestErr != nil {
					log.Printf("[CatalogSync] ❌ Ошибка загрузки встроенного снимка: %v", ingestErr)
				} else {
					log.Printf("[CatalogSync] ✅ Встроенный каталог загружен мгновенно: %d товаров!", seedRes.Total)
				}
			}
		}

		// Also trigger background live sync attempt
		time.Sleep(2 * time.Second)
		log.Printf("[CatalogSync] Запуск фоновой онлайн-синхронизации с b-catalog.ru...")
		if _, syncErr := uc.Sync(ctx); syncErr != nil {
			log.Printf("[CatalogSync] ℹ️ Онлайн-синхронизация вернула: %v (каталог работает из БД)", syncErr)
		}

		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				log.Printf("[CatalogSync] Плановый запуск фоновой синхронизации каталога...")
				_, _ = uc.Sync(ctx)
			}
		}
	}()
}

type HomeResponse struct {
	Hits          []entity.CatalogProduct `json:"hits"`
	Sets          []entity.CatalogProduct `json:"sets"`
	NewArrivals   []entity.CatalogProduct `json:"newArrivals"`
	Categories    []entity.CatalogCategory `json:"categories"`
	BrandSpotlights []BrandSpotlightItem  `json:"brandSpotlights"`
}

type BrandSpotlightItem struct {
	Brand    string                  `json:"brand"`
	Slug     string                  `json:"slug"`
	Count    int                     `json:"count"`
	Products []entity.CatalogProduct `json:"products"`
}

func (uc *CatalogUseCase) GetHome(ctx context.Context) (*HomeResponse, error) {
	hits, _ := uc.catalogRepo.GetHits(ctx, 8)
	sets, _ := uc.catalogRepo.GetSets(ctx, 8)
	categories, _ := uc.catalogRepo.GetCategories(ctx)

	newProducts, _, _ := uc.catalogRepo.List(ctx, repository.CatalogFilter{
		Sort:     "newest",
		Page:     1,
		PageSize: 8,
	})

	brands, _ := uc.catalogRepo.GetBrands(ctx)
	var spotlights []BrandSpotlightItem

	// Take up to top 2 brands with most products
	for i, b := range brands {
		if i >= 2 {
			break
		}
		prods, _, _ := uc.catalogRepo.List(ctx, repository.CatalogFilter{
			Brands:   []string{b.Name},
			Page:     1,
			PageSize: 4,
		})
		spotlights = append(spotlights, BrandSpotlightItem{
			Brand:    b.Name,
			Slug:     b.Slug,
			Count:    b.Count,
			Products: prods,
		})
	}

	return &HomeResponse{
		Hits:            hits,
		Sets:            sets,
		NewArrivals:     newProducts,
		Categories:      categories,
		BrandSpotlights: spotlights,
	}, nil
}

func (uc *CatalogUseCase) List(ctx context.Context, f repository.CatalogFilter) ([]entity.CatalogProduct, int, error) {
	return uc.catalogRepo.List(ctx, f)
}

func (uc *CatalogUseCase) GetBySlug(ctx context.Context, slug string) (*entity.CatalogProduct, []entity.CatalogProduct, error) {
	p, err := uc.catalogRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, nil, err
	}
	related, _ := uc.catalogRepo.GetRelated(ctx, p.CategoryID, p.ID, 4)
	return p, related, nil
}

func (uc *CatalogUseCase) GetCategories(ctx context.Context) ([]entity.CatalogCategory, error) {
	return uc.catalogRepo.GetCategories(ctx)
}

func (uc *CatalogUseCase) GetBrands(ctx context.Context) ([]entity.CatalogBrand, error) {
	return uc.catalogRepo.GetBrands(ctx)
}

func (uc *CatalogUseCase) GetDeliveryOptions(ctx context.Context) ([]bcatalog.RawDelivery, error) {
	shop, err := uc.bcatClient.FetchShop(ctx)
	if err != nil {
		// Fallback defaults
		return []bcatalog.RawDelivery{
			{ID: 1, Title: "Самовывоз из шоурума (Сеул)", Cost: 0, Enabled: true, AllowFree: true},
			{ID: 2, Title: "Курьерская доставка по Корее", Cost: 5000, Enabled: true, AllowFree: false},
		}, nil
	}
	return shop.Settings.Deliveries, nil
}

func (uc *CatalogUseCase) GetAdminCatalogStats(ctx context.Context) (map[string]interface{}, error) {
	total, inStock, hits, hidden, archived, err := uc.catalogRepo.GetCatalogStats(ctx)
	if err != nil {
		return nil, err
	}
	logs, _ := uc.catalogRepo.GetLatestSyncLogs(ctx, 10)

	return map[string]interface{}{
		"total":       total,
		"inStock":     inStock,
		"hits":        hits,
		"hidden":      hidden,
		"archived":    archived,
		"lastSync":    uc.lastSync,
		"syncLogs":    logs,
	}, nil
}

func (uc *CatalogUseCase) UpdateOverrides(ctx context.Context, id int64, isHit *bool, isHidden *bool, brandOverride *string, excerptOverride *string) error {
	return uc.catalogRepo.UpdateOverrides(ctx, id, isHit, isHidden, brandOverride, excerptOverride)
}
