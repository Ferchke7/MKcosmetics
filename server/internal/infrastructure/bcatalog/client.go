package bcatalog

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"time"
)

type Client struct {
	base     string
	shopCode string
	http     *http.Client
}

func NewClient(shopCode string) *Client {
	if shopCode == "" {
		shopCode = "roznmkkoreacosmetic"
	}

	dialer := &net.Dialer{
		Timeout:   15 * time.Second,
		KeepAlive: 30 * time.Second,
	}

	proxyFunc := http.ProxyFromEnvironment
	if proxyEnv := os.Getenv("CATALOG_PROXY_URL"); proxyEnv != "" {
		if parsed, err := url.Parse(proxyEnv); err == nil {
			proxyFunc = http.ProxyURL(parsed)
		}
	}

	tr := &http.Transport{
		Proxy: proxyFunc,
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			// Force IPv4 ("tcp4") to prevent hangs on Docker bridge networks and VPS with incomplete IPv6 routing
			return dialer.DialContext(ctx, "tcp4", addr)
		},
		TLSHandshakeTimeout:   15 * time.Second,
		ResponseHeaderTimeout: 35 * time.Second,
		IdleConnTimeout:       90 * time.Second,
		MaxIdleConns:          10,
		MaxIdleConnsPerHost:   5,
		DisableKeepAlives:     false,
	}

	return &Client{
		base:     fmt.Sprintf("https://%s.b-catalog.ru/api/api/v1", shopCode),
		shopCode: shopCode,
		http: &http.Client{
			Transport: tr,
			Timeout:   50 * time.Second,
		},
	}
}

type RawPhotoInfo struct {
	ID   int64  `json:"id"`
	URL  string `json:"url"`
	Size int64  `json:"size"`
}

type RawPhoto struct {
	ID         int64        `json:"id"`
	URL        string       `json:"url"`
	Preview600 RawPhotoInfo `json:"preview600w"`
	Preview300 RawPhotoInfo `json:"preview300w"`
	Preview150 RawPhotoInfo `json:"preview150w"`
}

type RawCategory struct {
	ID            int64      `json:"id"`
	Title         string     `json:"title"`
	CategoryID    *int64     `json:"category_id"`
	ProductsCount int        `json:"products_count"`
	Archive       bool       `json:"archive"`
	Slug          string     `json:"slug"`
	Photos        []RawPhoto `json:"photos"`
}

type RawProduct struct {
	ID          int64        `json:"id"`
	Type        int          `json:"type"`
	Title       string       `json:"title"`
	CategoryID  int64        `json:"category_id"`
	Part        *string      `json:"part"`
	Description string       `json:"description"`
	Amount      int          `json:"amount"`
	Archive     bool         `json:"archive"`
	Active      bool         `json:"active"`
	Code        *string      `json:"code"`
	Price       int64        `json:"price"`
	OldPrice    int64        `json:"old_price"`
	ActualPrice int64        `json:"actual_price"`
	Slug        string       `json:"slug"`
	Photos      []RawPhoto   `json:"photos"`
	Category    *RawCategory `json:"category"`
	Prices      RawPrices    `json:"prices"`
	Stock       RawStock     `json:"stock"`
}

type RawPrices struct {
	Price    int64  `json:"price"`
	OldPrice *int64 `json:"old_price"`
}

type RawStock struct {
	Count int `json:"count"`
}

type RawProductsResponse struct {
	Total   int          `json:"total"`
	Results []RawProduct `json:"results"`
}

type RawDelivery struct {
	ID        int64  `json:"id"`
	Title     string `json:"title"`
	Cost      int64  `json:"cost"`
	Enabled   bool   `json:"enabled"`
	AllowFree bool   `json:"allow_free"`
}

type RawShopSettings struct {
	Deliveries []RawDelivery `json:"deliveries"`
}

type RawShopResponse struct {
	ID          int64           `json:"id"`
	ShopCode    string          `json:"shop_code"`
	ShopName    string          `json:"shop_name"`
	CompanyName string          `json:"company_name"`
	Settings    RawShopSettings `json:"settings"`
}

func (c *Client) setBrowserHeaders(req *http.Request) {
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Accept-Language", "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7")
	req.Header.Set("Origin", fmt.Sprintf("https://%s.b-catalog.ru", c.shopCode))
	req.Header.Set("Referer", fmt.Sprintf("https://%s.b-catalog.ru/", c.shopCode))
}

func (c *Client) FetchAllProducts(ctx context.Context) ([]RawProduct, error) {
	pageSize := 100
	page := 1
	var all []RawProduct

	for {
		url := fmt.Sprintf("%s/shop/products?shop_code=%s&page=%d&page_size=%d", c.base, c.shopCode, page, pageSize)

		var pageData RawProductsResponse
		var lastErr error

		// Retry each page up to 3 times
		for attempt := 1; attempt <= 3; attempt++ {
			if ctx.Err() != nil {
				return nil, ctx.Err()
			}

			req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
			if err != nil {
				return nil, err
			}
			c.setBrowserHeaders(req)

			resp, err := c.http.Do(req)
			if err != nil {
				lastErr = err
				select {
				case <-ctx.Done():
					return nil, ctx.Err()
				case <-time.After(time.Duration(attempt) * time.Second):
					continue
				}
			}

			if resp.StatusCode != http.StatusOK {
				resp.Body.Close()
				lastErr = fmt.Errorf("unexpected status %d", resp.StatusCode)
				select {
				case <-ctx.Done():
					return nil, ctx.Err()
				case <-time.After(time.Duration(attempt) * time.Second):
					continue
				}
			}

			decodeErr := json.NewDecoder(resp.Body).Decode(&pageData)
			resp.Body.Close()

			if decodeErr != nil {
				lastErr = decodeErr
				select {
				case <-ctx.Done():
					return nil, ctx.Err()
				case <-time.After(time.Duration(attempt) * time.Second):
					continue
				}
			}

			lastErr = nil
			break
		}

		if lastErr != nil {
			return nil, fmt.Errorf("page %d failed after retries: %w", page, lastErr)
		}

		all = append(all, pageData.Results...)

		if len(all) >= pageData.Total || len(pageData.Results) == 0 {
			break
		}
		page++
	}

	return all, nil
}

func (c *Client) FetchShop(ctx context.Context) (*RawShopResponse, error) {
	url := fmt.Sprintf("%s/shop/_find?shop_code=%s&hostname=%s.b-catalog.ru", c.base, c.shopCode, c.shopCode)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	c.setBrowserHeaders(req)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("shop fetch status: %d", resp.StatusCode)
	}

	var shop RawShopResponse
	if err := json.NewDecoder(resp.Body).Decode(&shop); err != nil {
		return nil, err
	}
	return &shop, nil
}
