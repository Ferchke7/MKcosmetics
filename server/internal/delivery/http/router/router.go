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

		// Public Telegram & Visitor feeds
		api.Route("/telegram", func(tg chi.Router) {
			tg.Get("/feed", feedHandler.GetFeed)
			tg.Post("/sync", feedHandler.Sync)
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

		// Protected Admin & CRM & ERP Routes
		api.Route("/admin", func(admin chi.Router) {
			admin.Use(authMiddleware.RequireAuth)

			admin.Get("/stats", adminHandler.GetDashboard)
			admin.Get("/visitors", adminHandler.GetVisitorLogs)
			admin.Post("/sync", adminHandler.TriggerSync)
			admin.Post("/upload", uploadHandler.UploadFile)

			// Deep ECharts Analytics
			admin.Route("/analytics", func(an chi.Router) {
				an.Get("/deep", analyticsHandler.GetDeepAnalytics)
			})

			// Products Management
			admin.Route("/products", func(p chi.Router) {
				p.Post("/", adminHandler.CreateProduct)
				p.Put("/{id}", adminHandler.UpdateProduct)
				p.Delete("/{id}", adminHandler.DeleteProduct)
			})

			// Orders & Export
			admin.Route("/orders", func(o chi.Router) {
				o.Get("/", orderHandler.GetAdminOrders)
				o.Get("/export/csv", exportHandler.ExportCSV)
				o.Put("/{id}/status", orderHandler.UpdateStatus)
				o.Put("/{id}/notes", orderHandler.UpdateNotes)
				o.Put("/{id}/process", orderHandler.ProcessOrder)
				o.Post("/{id}/receipt", orderHandler.AttachReceipt)
				o.Delete("/{id}", orderHandler.DeleteOrder)
			})

			// ERP: Cargo Flight Batches
			admin.Route("/cargo", func(c chi.Router) {
				c.Get("/", cargoHandler.GetAll)
				c.Post("/", cargoHandler.Create)
				c.Get("/{id}", cargoHandler.GetByID)
				c.Put("/{id}", cargoHandler.Update)
				c.Post("/assign", cargoHandler.AssignOrder)
				c.Delete("/{id}", cargoHandler.Delete)
			})

			// ERP: Product Variants & Inventory SKUs
			admin.Route("/variants", func(v chi.Router) {
				v.Get("/", variantHandler.GetAll)
				v.Post("/", variantHandler.Create)
				v.Put("/{id}", variantHandler.Update)
				v.Put("/{id}/stock", variantHandler.UpdateStock)
				v.Delete("/{id}", variantHandler.Delete)
			})

			// Staff & Seller Management
			admin.Route("/staff", func(s chi.Router) {
				s.Get("/", staffHandler.GetAll)
				s.Post("/", staffHandler.Create)
				s.Put("/{id}", staffHandler.Update)
				s.Delete("/{id}", staffHandler.Delete)
			})

			// Advanced Unit Economics & Sales Analysis
			admin.Route("/sales", func(sl chi.Router) {
				sl.Get("/unit-economics", salesHandler.GetUnitEconomics)
				sl.Get("/export-ledger", salesHandler.ExportLedgerCSV)
			})
		})
	})

	// Static SPA Serving
	if cfg.StaticDir != "" {
		setupSPAServer(r, cfg.StaticDir)
	}

	return r
}

func setupSPAServer(r *chi.Mux, staticDir string) {
	fs := http.FileServer(http.Dir(staticDir))

	r.Get("/*", func(w http.ResponseWriter, req *http.Request) {
		// Don't intercept API routes
		if strings.HasPrefix(req.URL.Path, "/api") {
			http.NotFound(w, req)
			return
		}

		path := filepath.Join(staticDir, filepath.Clean(req.URL.Path))
		info, err := os.Stat(path)
		if err == nil && !info.IsDir() {
			fs.ServeHTTP(w, req)
			return
		}

		// Fallback to index.html for SPA client-side routes (e.g. /admin, /catalog)
		indexPath := filepath.Join(staticDir, "index.html")
		http.ServeFile(w, req, indexPath)
	})
}
