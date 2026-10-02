package usecase

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
)

type ArticleUseCase struct {
	repo        repository.ArticleRepository
	productRepo repository.ProductRepository
}

func NewArticleUseCase(repo repository.ArticleRepository, productRepo repository.ProductRepository) *ArticleUseCase {
	return &ArticleUseCase{
		repo:        repo,
		productRepo: productRepo,
	}
}

func (u *ArticleUseCase) GetAll(ctx context.Context, filter entity.ArticleFilter) ([]entity.Article, int, error) {
	return u.repo.GetAll(ctx, filter)
}

func (u *ArticleUseCase) GetByID(ctx context.Context, id string) (*entity.Article, error) {
	article, err := u.repo.GetByID(ctx, id)
	if err != nil || article == nil {
		return nil, err
	}
	_ = u.repo.IncrementViews(ctx, id)
	return article, nil
}

func (u *ArticleUseCase) GetBySlug(ctx context.Context, slug string) (*entity.Article, error) {
	article, err := u.repo.GetBySlug(ctx, slug)
	if err != nil || article == nil {
		return nil, err
	}
	_ = u.repo.IncrementViews(ctx, article.ID)
	return article, nil
}

func (u *ArticleUseCase) Upsert(ctx context.Context, article entity.Article) error {
	if article.ID == "" {
		article.ID = fmt.Sprintf("art_%d", time.Now().UnixNano())
	}
	if article.Slug == "" {
		article.Slug = generateSlug(article.Title)
	}
	if article.ReadingTimeMinutes <= 0 {
		wordCount := len(strings.Fields(article.ContentMarkdown))
		article.ReadingTimeMinutes = wordCount/180 + 1
	}
	if article.PublishedAt.IsZero() {
		article.PublishedAt = time.Now()
	}
	return u.repo.Upsert(ctx, article)
}

func (u *ArticleUseCase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

// ConvertTelegramPostsToArticles parses Telegram beauty guide posts into rich magazine articles
func (u *ArticleUseCase) SyncFromTelegramPosts(ctx context.Context) (int, error) {
	products, err := u.productRepo.FindAll(ctx)
	if err != nil {
		return 0, err
	}

	createdCount := 0
	for _, p := range products {
		// If text contains long skincare instructions or guide keywords
		textLower := strings.ToLower(p.Text)
		isGuide := strings.Contains(textLower, "применение") ||
			strings.Contains(textLower, "состав") ||
			strings.Contains(textLower, "эффект") ||
			strings.Contains(textLower, "уход") ||
			strings.Contains(textLower, "способ применения") ||
			len(p.Text) > 250

		if isGuide {
			articleID := "tg_art_" + strings.TrimPrefix(p.ID, "mkcosmetkor_")
			cover := ""
			if len(p.Photos) > 0 {
				cover = p.Photos[0]
			}

			// Format title
			title := p.ProductTitle
			if p.Brand != "" && !strings.Contains(title, p.Brand) {
				title = p.Brand + " — " + title
			}

			// Extract subtitle / short snippet
			lines := strings.Split(p.Text, "\n")
			subtitle := ""
			if len(lines) > 0 {
				subtitle = strings.TrimSpace(lines[0])
				if len(subtitle) > 120 {
					subtitle = subtitle[:117] + "..."
				}
			}

			wordCount := len(strings.Fields(p.Text))
			readingTime := wordCount/150 + 1

			art := entity.Article{
				ID:                 articleID,
				Slug:               generateSlug(title) + "-" + p.ID,
				Title:              title,
				Subtitle:           subtitle,
				ContentMarkdown:    p.Text,
				CoverImage:         cover,
				Author:             "MK Skincare Editorial",
				ReadingTimeMinutes: readingTime,
				Tags:               p.Tags,
				RelatedProductIDs:  []string{p.ID},
				SourceTelegramURL:  p.PostURL,
				Views:              p.Views,
				PublishedAt:        time.Now(),
			}

			if err := u.repo.Upsert(ctx, art); err == nil {
				createdCount++
			}
		}
	}

	return createdCount, nil
}

func generateSlug(text string) string {
	slug := strings.ToLower(text)
	reg := regexp.MustCompile(`[^a-z0-9а-яё]+`)
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = fmt.Sprintf("article-%d", time.Now().Unix())
	}
	return slug
}
