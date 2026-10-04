package sqlite

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/infrastructure/persistence/sqlite/seed"
	_ "modernc.org/sqlite"
)

// DB wraps *sql.DB with helper operations
type DB struct {
	*sql.DB
}

// NewDB initializes SQLite connection, runs schema migrations and seeds initial data if fresh
func NewDB(dbPath string) (*DB, error) {
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create db directory: %w", err)
	}

	db, err := sql.Open("sqlite", dbPath+"?_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)&_pragma=synchronous(NORMAL)")
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite db: %w", err)
	}

	db.SetMaxOpenConns(1) // SQLite single writer guarantee for WAL mode
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping sqlite db: %w", err)
	}

	instance := &DB{db}
	if err := instance.migrate(); err != nil {
		return nil, fmt.Errorf("failed to run sqlite migrations: %w", err)
	}

	// Seed from posts.json and channel.json if fresh DB
	instance.seedFromJSONIfFresh(dir)

	return instance, nil
}

func (db *DB) migrate() error {
	// 1. Create tables IF NOT EXISTS
	tables := `
	CREATE TABLE IF NOT EXISTS channel_info (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		title TEXT NOT NULL,
		username TEXT NOT NULL,
		avatar_url TEXT NOT NULL DEFAULT '',
		subscribers_count TEXT NOT NULL DEFAULT '',
		description TEXT NOT NULL DEFAULT '',
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS posts (
		id TEXT PRIMARY KEY,
		post_url TEXT NOT NULL,
		date TEXT NOT NULL,
		timestamp INTEGER NOT NULL DEFAULT 0,
		product_title TEXT NOT NULL,
		brand TEXT NOT NULL DEFAULT '',
		text TEXT NOT NULL,
		prices_json TEXT NOT NULL DEFAULT '{}',
		photos_json TEXT NOT NULL DEFAULT '[]',
		tags_json TEXT NOT NULL DEFAULT '[]',
		discount_percent INTEGER NOT NULL DEFAULT 0,
		is_bestseller INTEGER NOT NULL DEFAULT 0,
		views INTEGER NOT NULL DEFAULT 0,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS visitor_stats (
		country_code TEXT PRIMARY KEY,
		visits INTEGER NOT NULL DEFAULT 0,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS visitor_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		ip TEXT NOT NULL,
		country_code TEXT NOT NULL,
		visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		display_name TEXT NOT NULL DEFAULT '',
		phone TEXT NOT NULL DEFAULT '',
		password_hash TEXT NOT NULL,
		role TEXT NOT NULL DEFAULT 'admin',
		is_active INTEGER NOT NULL DEFAULT 1,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		last_login TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS orders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		order_number TEXT UNIQUE NOT NULL,
		customer_name TEXT NOT NULL,
		phone TEXT NOT NULL,
		channel_source TEXT NOT NULL DEFAULT 'web',
		type TEXT NOT NULL DEFAULT 'order',
		items_json TEXT NOT NULL DEFAULT '[]',
		total_amount REAL NOT NULL DEFAULT 0,
		cost_price REAL NOT NULL DEFAULT 0,
		currency TEXT NOT NULL DEFAULT 'UZS',
		status TEXT NOT NULL DEFAULT 'new',
		payment_receipt_url TEXT NOT NULL DEFAULT '',
		payment_method TEXT NOT NULL DEFAULT '',
		tracking_number TEXT NOT NULL DEFAULT '',
		shipping_address TEXT NOT NULL DEFAULT '',
		city TEXT NOT NULL DEFAULT '',
		assigned_to TEXT NOT NULL DEFAULT '',
		cargo_batch_id INTEGER NOT NULL DEFAULT 0,
		notes TEXT NOT NULL DEFAULT '',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS cargo_batches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		batch_code TEXT UNIQUE NOT NULL,
		title TEXT NOT NULL,
		origin TEXT NOT NULL DEFAULT 'Seoul (ICN)',
		destination TEXT NOT NULL DEFAULT 'Tashkent (TAS)',
		awb_number TEXT NOT NULL DEFAULT '',
		carrier TEXT NOT NULL DEFAULT '',
		weight_kg REAL NOT NULL DEFAULT 0,
		rate_per_kg REAL NOT NULL DEFAULT 0,
		departure_date TEXT NOT NULL DEFAULT '',
		arrival_date TEXT NOT NULL DEFAULT '',
		status TEXT NOT NULL DEFAULT 'draft',
		notes TEXT NOT NULL DEFAULT '',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS product_variants (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		product_id TEXT NOT NULL,
		variant_type TEXT NOT NULL DEFAULT 'volume',
		name TEXT NOT NULL,
		sku TEXT NOT NULL DEFAULT '',
		cost_price REAL NOT NULL DEFAULT 0,
		retail_price REAL NOT NULL DEFAULT 0,
		stock_quantity INTEGER NOT NULL DEFAULT 10,
		stock_status TEXT NOT NULL DEFAULT 'in_stock',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS customers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		phone TEXT UNIQUE NOT NULL,
		email TEXT NOT NULL DEFAULT '',
		telegram_username TEXT NOT NULL DEFAULT '',
		city TEXT NOT NULL DEFAULT '',
		delivery_address TEXT NOT NULL DEFAULT '',
		total_orders INTEGER NOT NULL DEFAULT 0,
		total_spent REAL NOT NULL DEFAULT 0,
		average_order_value REAL NOT NULL DEFAULT 0,
		last_order_at TIMESTAMP,
		segment TEXT NOT NULL DEFAULT 'new',
		notes TEXT NOT NULL DEFAULT '',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS articles (
		id TEXT PRIMARY KEY,
		slug TEXT UNIQUE NOT NULL,
		title TEXT NOT NULL,
		subtitle TEXT NOT NULL DEFAULT '',
		content_markdown TEXT NOT NULL,
		cover_image TEXT NOT NULL DEFAULT '',
		author TEXT NOT NULL DEFAULT 'MK Skincare Editor',
		reading_time_minutes INTEGER NOT NULL DEFAULT 3,
		tags_json TEXT NOT NULL DEFAULT '[]',
		related_product_ids_json TEXT NOT NULL DEFAULT '[]',
		source_telegram_url TEXT NOT NULL DEFAULT '',
		views INTEGER NOT NULL DEFAULT 0,
		published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS catalog_categories (
		id INTEGER PRIMARY KEY,
		parent_id INTEGER NOT NULL DEFAULT 0,
		title TEXT NOT NULL,
		slug TEXT NOT NULL,
		photo_url TEXT NOT NULL DEFAULT '',
		count INTEGER NOT NULL DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS catalog_products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		source_id INTEGER UNIQUE NOT NULL,
		slug TEXT NOT NULL,
		title TEXT NOT NULL,
		brand TEXT NOT NULL DEFAULT '',
		description TEXT NOT NULL DEFAULT '',
		excerpt TEXT NOT NULL DEFAULT '',
		category_id INTEGER NOT NULL DEFAULT 0,
		category_title TEXT NOT NULL DEFAULT '',
		category_slug TEXT NOT NULL DEFAULT '',
		price_krw INTEGER NOT NULL DEFAULT 0,
		old_price_krw INTEGER NOT NULL DEFAULT 0,
		discount_pct INTEGER NOT NULL DEFAULT 0,
		stock INTEGER NOT NULL DEFAULT 0,
		in_stock INTEGER NOT NULL DEFAULT 1,
		archived INTEGER NOT NULL DEFAULT 0,
		photos_json TEXT NOT NULL DEFAULT '[]',
		is_hit INTEGER NOT NULL DEFAULT 0,
		is_hidden INTEGER NOT NULL DEFAULT 0,
		brand_override TEXT NOT NULL DEFAULT '',
		excerpt_override TEXT NOT NULL DEFAULT '',
		synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS catalog_sync_log (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		added INTEGER NOT NULL DEFAULT 0,
		updated INTEGER NOT NULL DEFAULT 0,
		archived INTEGER NOT NULL DEFAULT 0,
		total INTEGER NOT NULL DEFAULT 0,
		duration_ms INTEGER NOT NULL DEFAULT 0,
		error_message TEXT NOT NULL DEFAULT '',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	`

	if _, err := db.Exec(tables); err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	// 2. Safe column migrations for existing SQLite databases (must run before indexes on new columns)
	alterCols := []string{
		"ALTER TABLE orders ADD COLUMN payment_receipt_url TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE orders ADD COLUMN tracking_number TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE orders ADD COLUMN shipping_address TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE orders ADD COLUMN cost_price REAL NOT NULL DEFAULT 0;",
		"ALTER TABLE orders ADD COLUMN city TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE orders ADD COLUMN assigned_to TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE orders ADD COLUMN cargo_batch_id INTEGER NOT NULL DEFAULT 0;",
		"ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE users ADD COLUMN phone TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;",
		"ALTER TABLE customers ADD COLUMN segment TEXT NOT NULL DEFAULT 'new';",
		"ALTER TABLE customers ADD COLUMN notes TEXT NOT NULL DEFAULT '';",
		"ALTER TABLE articles ADD COLUMN source_telegram_url TEXT NOT NULL DEFAULT '';",
	}
	for _, query := range alterCols {
		_, _ = db.Exec(query) // Ignore error if column already exists
	}

	// 3. Create indexes AFTER all columns are guaranteed to exist
	indexes := `
	CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp DESC);
	CREATE INDEX IF NOT EXISTS idx_posts_brand ON posts(brand);
	CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
	CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
	CREATE INDEX IF NOT EXISTS idx_orders_cargo ON orders(cargo_batch_id);
	CREATE INDEX IF NOT EXISTS idx_orders_assigned ON orders(assigned_to);
	CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
	CREATE INDEX IF NOT EXISTS idx_cargo_batches_code ON cargo_batches(batch_code);
	CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
	CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
	CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
	CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
	CREATE INDEX IF NOT EXISTS idx_cat_prod_cat ON catalog_products(category_id);
	CREATE INDEX IF NOT EXISTS idx_cat_prod_brand ON catalog_products(brand);
	CREATE INDEX IF NOT EXISTS idx_cat_prod_price ON catalog_products(price_krw);
	CREATE INDEX IF NOT EXISTS idx_cat_prod_source ON catalog_products(source_id);
	CREATE INDEX IF NOT EXISTS idx_cat_prod_slug ON catalog_products(slug);
	CREATE INDEX IF NOT EXISTS idx_cat_prod_flags ON catalog_products(is_hidden, archived, in_stock);
	CREATE INDEX IF NOT EXISTS idx_cat_sync_date ON catalog_sync_log(created_at DESC);
	`
	if _, err := db.Exec(indexes); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	// 4. Ensure default admin user exists
	db.seedDefaultAdmin()
	return nil
}

func (db *DB) seedDefaultAdmin() {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users;").Scan(&count)
	if err == nil && count == 0 {
		hash, err := HashPassword("admin")
		if err == nil {
			_, _ = db.Exec(`
				INSERT INTO users (username, password_hash, role, created_at)
				VALUES ('admin', ?, 'admin', CURRENT_TIMESTAMP)
				ON CONFLICT(username) DO NOTHING;
			`, hash)
			log.Println("👤 Default admin user created (Username: 'admin', Password: 'admin')")
		}
	}
}

func findDataFile(dataDir, filename string) string {
	candidates := []string{
		filepath.Join(dataDir, filename),
		filepath.Join("server", "data", filename),
		filepath.Join("data", filename),
	}
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			return c
		}
	}
	return ""
}

func (db *DB) seedFromJSONIfFresh(dataDir string) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM posts").Scan(&count)
	if err == nil && count > 0 {
		log.Printf("💾 SQLite database already contains %d posts. Skipping JSON seed.", count)
		return
	}

	// 1. Seed channel info (from embedded seed or disk)
	channelBytes := seed.ChannelJSON
	if len(channelBytes) == 0 {
		if channelFile := findDataFile(dataDir, "channel.json"); channelFile != "" {
			channelBytes, _ = os.ReadFile(channelFile)
		}
	}
	if len(channelBytes) > 0 {
		var ch entity.ChannelInfo
		if err := json.Unmarshal(channelBytes, &ch); err == nil {
			_, _ = db.Exec(`
				INSERT INTO channel_info (id, title, username, avatar_url, subscribers_count, description, updated_at)
				VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					title=excluded.title,
					username=excluded.username,
					avatar_url=excluded.avatar_url,
					subscribers_count=excluded.subscribers_count,
					description=excluded.description,
					updated_at=CURRENT_TIMESTAMP
			`, ch.Title, ch.Username, ch.AvatarURL, ch.SubscribersCount, ch.Description)
			log.Printf("🌱 Seeded channel info into SQLite: %s (@%s)", ch.Title, ch.Username)
		}
	}

	// 2. Seed posts (from embedded seed or disk)
	postsBytes := seed.PostsJSON
	if len(postsBytes) == 0 {
		if postsFile := findDataFile(dataDir, "posts.json"); postsFile != "" {
			postsBytes, _ = os.ReadFile(postsFile)
		}
	}
	if len(postsBytes) > 0 {
		type rawSeedPost struct {
			ID              string        `json:"id"`
			PostURL         string        `json:"postUrl"`
			Date            string        `json:"date"`
			Timestamp       int64         `json:"timestamp"`
			ProductTitle    string        `json:"productTitle"`
			Brand           string        `json:"brand"`
			Text            string        `json:"text"`
			Prices          entity.Prices `json:"prices"`
			Photos          []string      `json:"photos"`
			Tags            []string      `json:"tags"`
			DiscountPercent int           `json:"discountPercent"`
			IsBestseller    bool          `json:"isBestseller"`
			Views           interface{}   `json:"views"`
		}

		var rawPosts []rawSeedPost
		if err := json.Unmarshal(postsBytes, &rawPosts); err == nil && len(rawPosts) > 0 {
			tx, err := db.Begin()
			if err != nil {
				return
			}
			stmt, err := tx.Prepare(`
				INSERT INTO posts (
					id, post_url, date, timestamp, product_title, brand, text,
					prices_json, photos_json, tags_json, discount_percent, is_bestseller, views, created_at, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				ON CONFLICT(id) DO UPDATE SET
					product_title=excluded.product_title,
					brand=excluded.brand,
					text=excluded.text,
					prices_json=excluded.prices_json,
					photos_json=excluded.photos_json,
					tags_json=excluded.tags_json,
					discount_percent=excluded.discount_percent,
					is_bestseller=excluded.is_bestseller,
					views=excluded.views,
					updated_at=CURRENT_TIMESTAMP
			`)
			if err == nil {
				defer stmt.Close()
				inserted := 0
				for _, p := range rawPosts {
					postID := p.ID
					if !strings.HasPrefix(postID, "mkcosmetkor_") {
						postID = "mkcosmetkor_" + postID
					}
					pricesJSON, _ := json.Marshal(p.Prices)
					photosJSON, _ := json.Marshal(p.Photos)
					tagsJSON, _ := json.Marshal(p.Tags)
					isBest := 0
					if p.IsBestseller {
						isBest = 1
					}
					viewsNum := 0
					if vStr, ok := p.Views.(string); ok {
						viewsNum, _ = strconv.Atoi(strings.TrimSpace(vStr))
					} else if vFloat, ok := p.Views.(float64); ok {
						viewsNum = int(vFloat)
					}

					_, err := stmt.Exec(
						postID, p.PostURL, p.Date, p.Timestamp, p.ProductTitle, p.Brand, p.Text,
						string(pricesJSON), string(photosJSON), string(tagsJSON),
						p.DiscountPercent, isBest, viewsNum,
					)
					if err == nil {
						inserted++
					}
				}
				_ = tx.Commit()
				log.Printf("🌱 Successfully seeded %d products into SQLite!", inserted)
			}
		}
	}
}
