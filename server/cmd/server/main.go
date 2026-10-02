package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"mkcosmetics/server/internal/delivery/http/handler"
	"mkcosmetics/server/internal/delivery/http/middleware"
	"mkcosmetics/server/internal/delivery/http/router"
	"mkcosmetics/server/internal/infrastructure/persistence/sqlite"
	"mkcosmetics/server/internal/infrastructure/scraper"
	"mkcosmetics/server/internal/usecase"
)

func main() {
	log.Println("✨ Starting MK Cosmetics Go Backend...")

	// 1. Configuration from environment
	port := getEnv("PORT", "3001")
	dbPath := getEnv("DB_PATH", "./data/mkcosmetics.db")
	channelUsername := getEnv("TELEGRAM_CHANNEL", "mkcosmetkor")
	staticDir := getEnv("STATIC_DIR", "./dist")
	jwtSecret := getEnv("JWT_SECRET", "mkcosmetics-secret-key-2026-auth")
	syncMinutes, _ := strconv.Atoi(getEnv("SYNC_INTERVAL_MINUTES", "3"))
	if syncMinutes <= 0 {
		syncMinutes = 3
	}

	// 2. Initialize Database (Pure Go SQLite + WAL)
	db, err := sqlite.NewDB(dbPath)
	if err != nil {
		log.Fatalf("❌ Failed to initialize SQLite database: %v", err)
	}
	defer db.Close()
	log.Printf("💾 SQLite database connected at '%s'", dbPath)

	// 3. Domain Repositories
	productRepo := sqlite.NewProductRepository(db)
	channelRepo := sqlite.NewChannelRepository(db)
	visitorRepo := sqlite.NewVisitorRepository(db)
	userRepo := sqlite.NewUserRepository(db)
	orderRepo := sqlite.NewOrderRepository(db)

	// 4. Infrastructure Scraper
	tgScraper := scraper.NewTelegramScraper(channelUsername)

	// 5. Use Cases (Clean Architecture Layer)
	feedUC := usecase.NewFeedUseCase(productRepo, channelRepo)
	syncUC := usecase.NewSyncUseCase(tgScraper, productRepo, channelRepo)
	visitorUC := usecase.NewVisitorUseCase(visitorRepo)
	authUC := usecase.NewAuthUseCase(userRepo, jwtSecret)
	orderUC := usecase.NewOrderUseCase(orderRepo)
	adminUC := usecase.NewAdminUseCase(productRepo, visitorRepo, channelRepo, orderRepo)

	// 6. HTTP Handlers & Middlewares
	healthHandler := handler.NewHealthHandler(productRepo)
	feedHandler := handler.NewFeedHandler(feedUC, syncUC)
	visitorHandler := handler.NewVisitorHandler(visitorUC)
	authHandler := handler.NewAuthHandler(authUC)
	orderHandler := handler.NewOrderHandler(orderUC)
	adminHandler := handler.NewAdminHandler(adminUC, syncUC)
	uploadDir := getEnv("UPLOAD_DIR", "./data/uploads")
	uploadHandler := handler.NewUploadHandler(uploadDir)
	authMiddleware := middleware.NewAuthMiddleware(authUC)

	// 7. Chi HTTP Router & Static SPA Server
	r := router.NewRouter(
		router.Config{StaticDir: staticDir},
		healthHandler,
		feedHandler,
		visitorHandler,
		authHandler,
		adminHandler,
		orderHandler,
		uploadHandler,
		authMiddleware,
	)

	// 8. Start Telegram Background Sync Worker
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	syncUC.StartBackgroundWorker(ctx, time.Duration(syncMinutes)*time.Minute)

	// 9. HTTP Server with Graceful Shutdown
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Listen for OS signals in a separate goroutine
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Printf("🚀 MK Cosmetics API & Web server listening on http://0.0.0.0:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ HTTP server listen failed: %v", err)
		}
	}()

	// Wait for shutdown signal
	sig := <-shutdownChan
	log.Printf("🛑 Received shutdown signal (%v). Gracefully stopping server...", sig)

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("⚠️ Server forced to shutdown: %v", err)
	}

	log.Println("👋 Server stopped gracefully. Goodbye!")
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
