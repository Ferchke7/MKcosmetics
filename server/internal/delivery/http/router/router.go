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
)

type Config struct {
	StaticDir string
}

func NewRouter(
	cfg Config,
	healthHandler *handler.HealthHandler,
	feedHandler *handler.FeedHandler,
	visitorHandler *handler.VisitorHandler,
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
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// API Routes
	r.Route("/api", func(api chi.Router) {
		api.Get("/health", healthHandler.HealthCheck)

		api.Route("/telegram", func(tg chi.Router) {
			tg.Get("/feed", feedHandler.GetFeed)
			tg.Post("/sync", feedHandler.Sync)
		})

		api.Route("/visitor", func(v chi.Router) {
			v.Post("/track", visitorHandler.Track)
			v.Get("/stats", visitorHandler.GetStats)
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

		// Fallback to index.html for SPA client-side routes (e.g. /all-products, /product/123)
		indexPath := filepath.Join(staticDir, "index.html")
		http.ServeFile(w, req, indexPath)
	})
}
