package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"mkcosmetics/server/internal/infrastructure/bcatalog"
	"mkcosmetics/server/internal/infrastructure/persistence/sqlite"
	"mkcosmetics/server/internal/usecase"
)

func main() {
	db, err := sqlite.NewDB("data/mkcosmetics.db")
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	defer db.Close()

	catalogRepo := sqlite.NewCatalogRepository(db)
	bcatClient := bcatalog.NewClient("roznmkkoreacosmetic")
	catalogUC := usecase.NewCatalogUseCase(bcatClient, catalogRepo)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	fmt.Println("Starting initial catalog sync from b-catalog...")
	res, err := catalogUC.Sync(ctx)
	if err != nil {
		log.Fatalf("Sync error: %v", err)
	}

	fmt.Printf("Sync completed successfully!\n")
	fmt.Printf("Total products processed: %d\n", res.Total)
	fmt.Printf("Added: %d, Updated: %d, Archived: %d, Duration: %d ms\n",
		res.Added, res.Updated, res.Archived, res.DurationMs)
}
