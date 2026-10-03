package router

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"mkcosmetics/server/internal/delivery/http/handler"
	appMiddleware "mkcosmetics/server/internal/delivery/http/middleware"
)

type Config struct {
	StaticDir string
}

func NewRouter(
	cfg Config,
	healthHandler *handler.HealthHandler,
	feedHandler *handler.FeedHandler,
	visitorHandler *handler.VisitorHandler,
	authHandler *handler.AuthHandler,
	adminHandler *handler.AdminHandler,
	orderHandler *handler.OrderHandler,
	uploadHandler *handler.UploadHandler,
	analyticsHandler *handler.AnalyticsHandler,
	cargoHandler *handler.CargoHandler,
	variantHandler *handler.VariantHandler,
	staffHandler *handler.StaffHandler,
	exportHandler *handler.ExportHandler,
	salesHandler *handler.SalesHandler,
	customerHandler *handler.CustomerHandler,
	articleHandler *handler.ArticleHandler,
	telegramHandler *handler.TelegramHandler,
	authMiddleware *appMiddleware.AuthMiddleware,
) http.Handler {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))

	// CORS Setup
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Country-Code", "CF-IPCountry"},
		ExposedHeaders:   []string{"Link", "Content-Disposition"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Static Uploads Serving (Images & Payment Receipts)
	uploadDir := filepath.Join("data", "uploads")
	_ = os.MkdirAll(uploadDir, 0755)
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadDir))))

	// API Routes
	r.Route("/api", func(api chi.Router) {
		api.Get("/health", healthHandler.HealthCheck)

		// Public Telegram Webhook & Feed
		api.Route("/telegram", func(tg chi.Router) {
			tg.Get("/feed", feedHandler.GetFeed)
			tg.Post("/sync", feedHandler.Sync)
			tg.Post("/webhook", telegramHandler.HandleWebhook)
		})

		// Public Beauty Articles Magazine (From Telegram)
		api.Route("/articles", func(art chi.Router) {
			art.Get("/", articleHandler.GetAll)
			art.Get("/{id}", articleHandler.GetByID)
			art.Get("/slug/{slug}", articleHandler.GetBySlug)
		})

		api.Route("/visitor", func(v chi.Router) {
			v.Post("/track", visitorHandler.Track)
			v.Get("/stats", visitorHandler.GetStats)
		})

		// Public Orders & Tracking
		api.Route("/orders", func(o chi.Router) {
			o.Post("/", orderHandler.CreateOrder)
			o.Get("/track/{orderNumber}", orderHandler.TrackOrder)
		})

		// Public Product Variants query
		api.Get("/variants", variantHandler.GetAll)

		// Authentication Routes (100% Open Source JWT Auth)
		api.Route("/auth", func(a chi.Router) {
			a.Post("/login", authHandler.Login)
			a.Group(func(protected chi.Router) {
				protected.Use(authMiddleware.RequireAuth)
				protected.Get("/me", authHandler.Me)
				protected.Post("/change-password", authHandler.ChangePassword)
			})
		})

		// Protected Admin, CRM, HRM & ERP Routes
		api.Route("/admin", func(admin chi.Router) {
			admin.Use(authMiddleware.RequireAuth)

			admin.Get("/stats", adminHandler.GetDashboard)
			admin.Get("/visitors", adminHandler.GetVisitorLogs)
			admin.Post("/sync", adminHandler.TriggerSync)
			admin.Post("/upload", uploadHandler.UploadFile)
			admin.Post("/telegram/import-dummy", adminHandler.ImportDummyProducts)
			admin.Get("/telegram/bot-config", telegramHandler.GetBotConfig)

			// Deep ECharts Analytics
			admin.Route("/analytics", func(an chi.Router) {
				an.Get("/deep", analyticsHandler.GetDeepAnalytics)
			})

			// Products Management & Full Catalog XLSX Export
			admin.Route("/products", func(p chi.Router) {
				p.Post("/", adminHandler.CreateProduct)
				p.Get("/export/xlsx", exportHandler.ExportProductsXLSX)
				p.Put("/{id}", adminHandler.UpdateProduct)
				p.Delete("/{id}", adminHandler.DeleteProduct)
			})

			// Orders & Multi-format Export & Telegram Bot Forwarding
			admin.Route("/orders", func(o chi.Router) {
				o.Get("/", orderHandler.GetAdminOrders)
				o.Get("/export/csv", exportHandler.ExportCSV)
				o.Get("/export/xlsx", exportHandler.ExportOrdersXLSX)
				o.Put("/{id}/status", orderHandler.UpdateStatus)
				o.Put("/{id}/notes", orderHandler.UpdateNotes)
				o.Put("/{id}/process", orderHandler.ProcessOrder)
				o.Post("/{id}/receipt", orderHandler.AttachReceipt)
				o.Post("/{id}/notify-telegram", telegramHandler.NotifyOrderTelegram)
				o.Delete("/{id}", orderHandler.DeleteOrder)
			})

			// Enterprise CRM: Customers Management
			admin.Route("/customers", func(c chi.Router) {
				c.Get("/", customerHandler.GetAll)
				c.Get("/export/xlsx", customerHandler.ExportXLSX)
				c.Get("/{id}", customerHandler.GetByID)
				c.Put("/{id}", customerHandler.Update)
				c.Delete("/{id}", customerHandler.Delete)
			})

			// Enterprise HRM: Staff & Commission Management
			admin.Route("/staff", func(s chi.Router) {
				s.Get("/", staffHandler.GetAll)
				s.Post("/", staffHandler.Create)
				s.Put("/{id}", staffHandler.Update)
				s.Delete("/{id}", staffHandler.Delete)
				s.Get("/payroll", staffHandler.GetPayroll)
				s.Get("/payroll/export-csv", staffHandler.ExportPayrollCSV)
				s.Get("/export/payroll/xlsx", exportHandler.ExportPayrollXLSX)
			})

			// Unit Economics & Sales Ledger
			admin.Route("/sales", func(sl chi.Router) {
				sl.Get("/unit-economics", salesHandler.GetUnitEconomics)
				sl.Get("/export-ledger", salesHandler.ExportLedgerCSV)
			})

			// Air Cargo Logistics Management
			admin.Route("/cargo", func(cg chi.Router) {
				cg.Get("/batches", cargoHandler.GetAll)
				cg.Get("/batches/{id}", cargoHandler.GetByID)
				cg.Post("/batches", cargoHandler.Create)
				cg.Put("/batches/{id}", cargoHandler.Update)
				cg.Delete("/batches/{id}", cargoHandler.Delete)
				cg.Post("/batches/assign-order", cargoHandler.AssignOrder)
			})

			// Product Variants & Matrix
			admin.Route("/variants", func(v chi.Router) {
				v.Get("/", variantHandler.GetAll)
				v.Post("/", variantHandler.Create)
				v.Put("/{id}", variantHandler.Update)
				v.Delete("/{id}", variantHandler.Delete)
			})
		})
	})

	// Static SPA Serving (Frontend Build)
	if cfg.StaticDir != "" {
		if _, err := os.Stat(cfg.StaticDir); err == nil {
			fileServer := http.FileServer(http.Dir(cfg.StaticDir))
			r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
				if strings.HasPrefix(r.URL.Path, "/api") || strings.HasPrefix(r.URL.Path, "/uploads") {
					http.NotFound(w, r)
					return
				}

				requestedPath := filepath.Join(cfg.StaticDir, filepath.Clean(r.URL.Path))
				if info, err := os.Stat(requestedPath); err == nil && !info.IsDir() {
					fileServer.ServeHTTP(w, r)
					return
				}

				// SPA Fallback: serve index.html
				indexPath := filepath.Join(cfg.StaticDir, "index.html")
				http.ServeFile(w, r, indexPath)
			})
		}
	}

	return r
}
