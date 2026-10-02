package scraper

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"mkcosmetics/server/internal/domain/entity"
)

var (
	rePriceKrw      = regexp.MustCompile(`(?i)(?:❌\s*[\d\.,\s]+(?:вон|won|₩)?\s*)?✅\s*([\d\.,\s]+)\s*(?:вон|won|₩)`)
	reOriginalKrw   = regexp.MustCompile(`(?i)❌\s*([\d\.,\s]+)\s*(?:вон|won|₩)`)
	reFallbackKrw   = regexp.MustCompile(`(?i)(?:krw|вон|won|₩)\s*[:=-]?\s*([\d\.,\s]+)|([\d\.,\s]+)\s*(?:вон|won|₩)`)
	rePriceRub      = regexp.MustCompile(`(?i)(?:🇷🇺|rub|руб|₽)\s*[:=-]?\s*([\d\.,\s]+)|([\d\.,\s]+)\s*(?:rub|руб|₽)`)
	rePriceUsd      = regexp.MustCompile(`(?i)(?:🇺🇸|usd|\$)\s*[:=-]?\s*([\d\.,]+)|([\d\.,]+)\s*(?:usd|\$)`)
	rePriceUzs      = regexp.MustCompile(`(?i)(?:🇺🇿|uzs|сум|som)\s*[:=-]?\s*([\d\.,\s]+)|([\d\.,\s]+)\s*(?:uzs|сум|som)`)
	rePriceKzt      = regexp.MustCompile(`(?i)(?:🇰🇿|kzt|тг|тенге|₸)\s*[:=-]?\s*([\d\.,\s]+)|([\d\.,\s]+)\s*(?:kzt|тг|тенге|₸)`)
	rePostID        = regexp.MustCompile(`mkcosmetkor/(\d+)`)
	reTag           = regexp.MustCompile(`#([A-Za-zА-Яа-я0-9_]+)`)
	reFlagCutoff    = regexp.MustCompile(`[\x{1F1E6}-\x{1F1FF}]{2}|❌|✅|🇰🇷|🇷🇺|🇺🇿|🇰🇿|💰|💸|💳|Цена|Стоимость|krw|won|вон|руб|₽|\$`)
)

type TelegramScraper struct {
	channelUsername string
	client          *http.Client
}

// NewTelegramScraper creates a new TelegramScraper instance
func NewTelegramScraper(username string) *TelegramScraper {
	cleanUsername := strings.TrimPrefix(username, "@")
	return &TelegramScraper{
		channelUsername: cleanUsername,
		client: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

// ScrapePage fetches a single page of posts, optionally before a given message ID
func (s *TelegramScraper) ScrapePage(ctx context.Context, beforeID int) (*entity.ChannelInfo, []*entity.ProductPost, int, error) {
	url := fmt.Sprintf("https://t.me/s/%s", s.channelUsername)
	if beforeID > 0 {
		url = fmt.Sprintf("https://t.me/s/%s?before=%d", s.channelUsername, beforeID)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, nil, 0, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
	req.Header.Set("Accept-Language", "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, nil, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, nil, 0, fmt.Errorf("telegram returned status %d", resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, nil, 0, err
	}

	// 1. Channel Info
	channel := &entity.ChannelInfo{
		Title:            doc.Find(".tgme_channel_info_header_title").Text(),
		Username:         s.channelUsername,
		AvatarURL:        doc.Find(".tgme_channel_info_header .tgme_page_photo_image img").AttrOr("src", ""),
		SubscribersCount: doc.Find(".tgme_channel_info_counter .counter_value").First().Text(),
		Description:      doc.Find(".tgme_channel_info_description").Text(),
		UpdatedAt:        time.Now(),
	}
	if channel.Title == "" {
		channel.Title = "MK KOREA COSMETIC"
	}

	// 2. Posts Parsing
	var (
		posts      []*entity.ProductPost
		earliestID = 0
	)

	doc.Find(".tgme_widget_message_wrap").Each(func(i int, wrap *goquery.Selection) {
		msg := wrap.Find(".tgme_widget_message")
		dataPost, exists := msg.Attr("data-post")
		if !exists {
			return
		}

		parts := strings.Split(dataPost, "/")
		if len(parts) < 2 {
			return
		}
		numID, _ := strconv.Atoi(parts[1])
		if earliestID == 0 || (numID > 0 && numID < earliestID) {
			earliestID = numID
		}

		postID := fmt.Sprintf("mkcosmetkor_%d", numID)
		postURL := fmt.Sprintf("https://t.me/%s/%d", s.channelUsername, numID)

		// Text & Date
		textSel := msg.Find(".tgme_widget_message_text")
		text := strings.TrimSpace(textSel.Text())
		timeSel := msg.Find("time.datetime")
		dateStr := timeSel.AttrOr("datetime", "")
		var ts int64
		if t, err := time.Parse(time.RFC3339, dateStr); err == nil {
			ts = t.UnixMilli()
		}

		// Photos
		var photos []string
		msg.Find(".tgme_widget_message_photo_wrap").Each(func(j int, p *goquery.Selection) {
			style := p.AttrOr("style", "")
			if idx := strings.Index(style, "url('"); idx != -1 {
				rem := style[idx+5:]
				if endIdx := strings.Index(rem, "')"); endIdx != -1 {
					photos = append(photos, rem[:endIdx])
				}
			}
		})

		// Views
		viewsText := msg.Find(".tgme_widget_message_views").Text()
		views := parseViews(viewsText)

		if text == "" && len(photos) == 0 {
			return
		}

		// Title, Brand, Prices, Discount
		productTitle := extractTitle(text)
		brand := extractBrand(text)
		prices, discount := extractPricesAndDiscount(text)
		tags := extractTags(text)

		post := &entity.ProductPost{
			ID:              postID,
			PostURL:         postURL,
			Date:            dateStr,
			Timestamp:       ts,
			ProductTitle:    productTitle,
			Brand:           brand,
			Text:            text,
			Prices:          prices,
			Photos:          photos,
			Tags:            tags,
			DiscountPercent: discount,
			IsBestseller:    discount >= 30 || views > 500,
			Views:           views,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		posts = append(posts, post)
	})

	// Check Telegram's native cursor for earlier messages
	doc.Find("a.tgme_messages_more, a[data-before], link[rel='prev']").Each(func(i int, s *goquery.Selection) {
		if val, exists := s.Attr("data-before"); exists && val != "" {
			if num, err := strconv.Atoi(val); err == nil && num > 0 {
				if earliestID == 0 || num < earliestID {
					earliestID = num
				}
			}
		}
		if href, exists := s.Attr("href"); exists && strings.Contains(href, "before=") {
			parts := strings.Split(href, "before=")
			if len(parts) > 1 {
				numStr := strings.Split(parts[1], "&")[0]
				if num, err := strconv.Atoi(numStr); err == nil && num > 0 {
					if earliestID == 0 || num < earliestID {
						earliestID = num
					}
				}
			}
		}
	})

	return channel, posts, earliestID, nil
}

// ScrapeDeep scrapes multiple pages of historical posts
func (s *TelegramScraper) ScrapeDeep(ctx context.Context, maxPages int) (*entity.ChannelInfo, []*entity.ProductPost, error) {
	var (
		allPosts   []*entity.ProductPost
		seenIDs    = make(map[string]bool)
		lastCh     *entity.ChannelInfo
		beforeID   = 0
	)

	log.Printf("🚀 Starting Telegram Deep Scrape for @%s (up to %d pages)...", s.channelUsername, maxPages)

	for page := 1; page <= maxPages; page++ {
		ch, posts, earliestID, err := s.ScrapePage(ctx, beforeID)
		if err != nil {
			log.Printf("⚠️ Error scraping page %d: %v", page, err)
			break
		}
		if ch != nil {
			lastCh = ch
		}

		addedOnPage := 0
		for _, p := range posts {
			if !seenIDs[p.ID] {
				seenIDs[p.ID] = true
				allPosts = append(allPosts, p)
				addedOnPage++
			}
		}

		log.Printf("📄 Page %d: fetched %d posts (new: %d), earliest ID: %d, total so far: %d", page, len(posts), addedOnPage, earliestID, len(allPosts))

		if earliestID <= 1 || (beforeID > 0 && earliestID >= beforeID) {
			log.Printf("🛑 Reached earliest post cursor (%d). Stopping deep scrape.", earliestID)
			break
		}

		beforeID = earliestID
		time.Sleep(350 * time.Millisecond) // Polite delay between requests
	}

	log.Printf("✨ Telegram Deep Scrape completed! Total unique posts: %d", len(allPosts))
	return lastCh, allPosts, nil
}

func parseViews(str string) int {
	clean := strings.TrimSpace(strings.ReplaceAll(str, " ", ""))
	if strings.HasSuffix(clean, "K") || strings.HasSuffix(clean, "k") {
		numStr := clean[:len(clean)-1]
		if val, err := strconv.ParseFloat(numStr, 64); err == nil {
			return int(val * 1000)
		}
	}
	val, _ := strconv.Atoi(clean)
	return val
}

func extractTitle(text string) string {
	lines := strings.Split(text, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		// Cut off after flags/prices
		loc := reFlagCutoff.FindStringIndex(trimmed)
		if loc != nil && loc[0] > 3 {
			trimmed = trimmed[:loc[0]]
		}
		trimmed = strings.Trim(trimmed, " -:—•#✨🌸")
		if len([]rune(trimmed)) >= 3 {
			return trimmed
		}
	}
	return "Корейский уход"
}

func extractBrand(text string) string {
	commonBrands := []string{
		"MEDIPEEL", "MEDI-PEEL", "LANEIGE", "SULWHASOO", "ROUND LAB", "ANUA", "TORRIDEN",
		"COSRX", "DR.JART", "DR.JART+", "MISSHA", "INNISFREE", "SOME BY MI", "BEAUTY OF JOSEON",
		"NUMBUZIN", "SKIN1004", "MANYOO", "MANYO", "HERA", "OHUI", "WHOO", "IOPE", "SUM:37", "VT",
		"FARMSTAY", "ESTHETIC HOUSE", "CP-1", "MASIL", "LADOR", "DEOPROCE", "PYUNKANG YUL", "TIAM",
	}

	upper := strings.ToUpper(text)
	for _, b := range commonBrands {
		if strings.Contains(upper, b) {
			return strings.ReplaceAll(b, "DR.JART+", "Dr.Jart+")
		}
	}
	return "K-Beauty"
}

func parseNum(s string) int {
	clean := strings.ReplaceAll(s, ".", "")
	clean = strings.ReplaceAll(clean, ",", "")
	clean = strings.ReplaceAll(clean, " ", "")
	clean = strings.ReplaceAll(clean, "\u00a0", "")
	val, _ := strconv.Atoi(clean)
	return val
}

func extractPricesAndDiscount(text string) (entity.Prices, int) {
	var prices entity.Prices
	discountPercent := 0

	// KRW Price
	var saleKrw, origKrw int
	if m := rePriceKrw.FindStringSubmatch(text); len(m) > 1 {
		saleKrw = parseNum(m[1])
	}
	if m := reOriginalKrw.FindStringSubmatch(text); len(m) > 1 {
		origKrw = parseNum(m[1])
	}

	if saleKrw == 0 {
		if m := reFallbackKrw.FindStringSubmatch(text); len(m) > 0 {
			for _, match := range m[1:] {
				if match != "" {
					saleKrw = parseNum(match)
					break
				}
			}
		}
	}

	if saleKrw > 0 {
		prices.KRW = &saleKrw
		if origKrw > saleKrw {
			discountPercent = int(float64(origKrw-saleKrw) / float64(origKrw) * 100)
		}
	}

	// RUB
	if m := rePriceRub.FindStringSubmatch(text); len(m) > 0 {
		for _, match := range m[1:] {
			if match != "" {
				val := parseNum(match)
				if val > 0 {
					prices.RUB = &val
				}
				break
			}
		}
	}

	// USD
	if m := rePriceUsd.FindStringSubmatch(text); len(m) > 0 {
		for _, match := range m[1:] {
			if match != "" {
				val, _ := strconv.ParseFloat(match, 64)
				if val > 0 {
					prices.USD = &val
				}
				break
			}
		}
	}

	// UZS
	if m := rePriceUzs.FindStringSubmatch(text); len(m) > 0 {
		for _, match := range m[1:] {
			if match != "" {
				val := parseNum(match)
				if val > 0 {
					prices.UZS = &val
				}
				break
			}
		}
	}

	// KZT
	if m := rePriceKzt.FindStringSubmatch(text); len(m) > 0 {
		for _, match := range m[1:] {
			if match != "" {
				val := parseNum(match)
				if val > 0 {
					prices.KZT = &val
				}
				break
			}
		}
	}

	return prices, discountPercent
}

func extractTags(text string) []string {
	matches := reTag.FindAllStringSubmatch(text, -1)
	var tags []string
	for _, m := range matches {
		if len(m) > 1 {
			tags = append(tags, m[1])
		}
	}
	return tags
}
