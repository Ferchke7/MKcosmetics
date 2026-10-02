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
	cargoRepo := sqlite.NewCargoRepository(db)
	variantRepo := sqlite.NewVariantRepository(db)

	// 4. Infrastructure Scraper
	tgScraper := scraper.NewTelegramScraper(channelUsername)

	// 5. Use Cases (Clean Architecture Layer)
	feedUC := usecase.NewFeedUseCase(productRepo, channelRepo)
	syncUC := usecase.NewSyncUseCase(tgScraper, productRepo, channelRepo)
	visitorUC := usecase.NewVisitorUseCase(visitorRepo)
	authUC := usecase.NewAuthUseCase(userRepo, jwtSecret)
	orderUC := usecase.NewOrderUseCase(orderRepo)
	adminUC := usecase.NewAdminUseCase(productRepo, visitorRepo, channelRepo, orderRepo)
	analyticsUC := usecase.NewAnalyticsUseCase(orderRepo, productRepo, userRepo, visitorRepo)
	cargoUC := usecase.NewCargoUseCase(cargoRepo, orderRepo)
	variantUC := usecase.NewVariantUseCase(variantRepo)
	staffUC := usecase.NewStaffUseCase(userRepo, orderRepo)
	salesUC := usecase.NewSalesUseCase(orderRepo, productRepo, variantRepo, cargoRepo)

	// 6. HTTP Handlers & Middlewares
	healthHandler := handler.NewHealthHandler(productRepo)
	feedHandler := handler.NewFeedHandler(feedUC, syncUC)
	visitorHandler := handler.NewVisitorHandler(visitorUC)
	authHandler := handler.NewAuthHandler(authUC)
	orderHandler := handler.NewOrderHandler(orderUC)
	adminHandler := handler.NewAdminHandler(adminUC, syncUC)
	uploadDir := getEnv("UPLOAD_DIR", "./data/uploads")
	uploadHandler := handler.NewUploadHandler(uploadDir)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsUC)
	cargoHandler := handler.NewCargoHandler(cargoUC)
	variantHandler := handler.NewVariantHandler(variantUC)
	staffHandler := handler.NewStaffHandler(staffUC)
	exportHandler := handler.NewExportHandler(orderUC)
	salesHandler := handler.NewSalesHandler(salesUC)
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
		analyticsHandler,
		cargoHandler,
		variantHandler,
		staffHandler,
		exportHandler,
		salesHandler,
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
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 MK Cosmetics backend server running on http://localhost:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ HTTP server error: %v", err)
		}
	}()

	// Wait for shutdown signal
	sig := <-shutdownChan
	log.Printf("🛑 Received signal '%v', initiating graceful shutdown...", sig)

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("👋 Server gracefully stopped. Goodbye!")
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
