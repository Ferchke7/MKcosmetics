package imageprocessor

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"

	"github.com/disintegration/imaging"
)

// ProcessAndUpscale takes raw image bytes (JPEG), scales it up using Lanczos resampling,
// applies mild sharpening to recover packaging edges, and returns clean JPEG bytes.
func ProcessAndUpscale(data []byte, targetHeight int) ([]byte, error) {
	if len(data) == 0 {
		return nil, fmt.Errorf("empty image data")
	}

	src, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := src.Bounds()
	w := bounds.Dx()
	h := bounds.Dy()

	if targetHeight <= 0 {
		targetHeight = 900
	}

	// Calculate target width preserving aspect ratio
	scale := float64(targetHeight) / float64(h)
	targetWidth := int(float64(w) * scale)

	// High-fidelity Lanczos resampling
	resized := imaging.Resize(src, targetWidth, targetHeight, imaging.Lanczos)

	// Unsharp mask / edge sharpening for cosmetic bottles and text
	sharpened := imaging.Sharpen(resized, 0.6)

	// Encode to clean high-quality JPEG (Quality: 92)
	var buf bytes.Buffer
	err = jpeg.Encode(&buf, sharpened, &jpeg.Options{Quality: 92})
	if err != nil {
		return nil, fmt.Errorf("failed to encode jpeg: %w", err)
	}

	return buf.Bytes(), nil
}
