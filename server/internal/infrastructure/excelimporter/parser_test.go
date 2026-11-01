package excelimporter_test

import (
	"os"
	"strings"
	"testing"

	"mkcosmetics/server/internal/infrastructure/excelimporter"
)

func TestParseXlsExtractProducts(t *testing.T) {
	path := `C:\Users\ferda\Downloads\Telegram Desktop\РабочийШБ2.xls (3).xls`
	data, err := os.ReadFile(path)
	if err != nil {
		t.Skipf("File not found on test machine: %v", err)
	}

	items, err := excelimporter.ParseXlsExtractProducts(data)
	if err != nil {
		t.Fatalf("Parse error: %v", err)
	}

	if len(items) < 1500 {
		t.Fatalf("Expected >= 1500 items, got %d", len(items))
	}

	var foundBiodance bool
	withPhotos := 0
	for _, it := range items {
		if len(it.ImageData) > 0 {
			withPhotos++
			if it.ImageData[0] != 0xFF || it.ImageData[1] != 0xD8 {
				t.Errorf("Item %s has invalid JPEG header: %X %X", it.Code, it.ImageData[0], it.ImageData[1])
			}
		}
		if strings.Contains(strings.ToLower(it.Title), "biodance") && strings.Contains(it.Title, "BIO COLLAGEN") {
			foundBiodance = true
			if len(it.ImageData) == 0 {
				t.Errorf("Biodance product has no image!")
			}
			if it.CategoryID != 588137 || it.CategoryTitle != "Маски" {
				t.Errorf("Biodance category unexpected: %d %s", it.CategoryID, it.CategoryTitle)
			}
		}
	}

	if !foundBiodance {
		t.Errorf("Biodance product not found in parsed items")
	}

	t.Logf("Successfully parsed %d items, %d with photos", len(items), withPhotos)
}
