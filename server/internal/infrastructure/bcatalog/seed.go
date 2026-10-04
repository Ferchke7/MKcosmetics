package bcatalog

import (
	_ "embed"
	"encoding/json"
	"log"
)

//go:embed catalog_products_seed.json
var embeddedCatalogSeed []byte

func GetEmbeddedSeedProducts() []RawProduct {
	if len(embeddedCatalogSeed) == 0 {
		return nil
	}
	var products []RawProduct
	if err := json.Unmarshal(embeddedCatalogSeed, &products); err != nil {
		log.Printf("[CatalogSeed] Warning: failed to unmarshal embedded seed: %v", err)
		return nil
	}
	return products
}
