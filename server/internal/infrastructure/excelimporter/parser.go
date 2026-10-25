package excelimporter

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"strings"
	"unicode/utf16"
)

type ExcelProductItem struct {
	Code      string
	Title     string
	PriceKRW  int64
	ImageData []byte
}

// ParseXlsExtractProducts extracts structured products from BIFF8 XLS (Business.Ru / Class365 export)
// and pairs each product with its embedded JPEG image.
func ParseXlsExtractProducts(data []byte) ([]ExcelProductItem, error) {
	if len(data) < 1000 {
		return nil, fmt.Errorf("файл слишком мал для XLS книги")
	}

	// Detect if user accidentally uploaded an empty Class365 print template instead of the database export
	if bytes.Contains(data, []byte("%row.code%")) || bytes.Contains(data, []byte("%row.goodsname%")) || bytes.Contains(data, []byte("%typeprice%")) {
		return nil, fmt.Errorf("выбран пустой печатный шаблон Класс365/Бизнес.Ру (размер %d КБ) с переменными %%row.code%%. Пожалуйста, выберите файл полной выгрузки товаров 'РабочийШБ2.xls' (~26 МБ) с фотографиями", len(data)/1024)
	}

	if len(data) < 50*1024 {
		return nil, fmt.Errorf("размер файла слишком мал (%d КБ). Полная база товаров с фото 'РабочийШБ2.xls' имеет размер ~26 МБ", len(data)/1024)
	}

	// 1. Extract all embedded JPEG images in sequential order
	images := extractJpegImages(data)

	// 2. Locate Shared String Table (SST) in BIFF8 stream
	headerUtf16 := encodeUtf16("Код товара")
	headerPos := bytes.Index(data, headerUtf16)
	if headerPos == -1 {
		// Try alternative headers
		headerUtf16 = encodeUtf16("Артикул")
		headerPos = bytes.Index(data, headerUtf16)
		if headerPos == -1 {
			headerUtf16 = encodeUtf16("Наименование")
			headerPos = bytes.Index(data, headerUtf16)
		}
	}

	if headerPos == -1 {
		return nil, fmt.Errorf("не найдена колонка 'Код товара' или 'Наименование' в файле Excel")
	}

	// 3. Parse all Unicode BIFF8 strings starting from header
	stringsList := extractBiff8Strings(data[headerPos:])

	// 4. Pair products by (Code -> Title) pattern
	var items []ExcelProductItem
	imgIdx := 0

	for i := 0; i < len(stringsList)-1; i++ {
		curr := strings.TrimSpace(stringsList[i])
		next := strings.TrimSpace(stringsList[i+1])

		// Code is numeric/alphanumeric and next is a product title
		if isProductCode(curr) && isProductTitle(next) {
			var img []byte
			if imgIdx < len(images) {
				img = images[imgIdx]
				imgIdx++
			}

			items = append(items, ExcelProductItem{
				Code:      curr,
				Title:     next,
				PriceKRW:  0, // Enriched/merged with b-catalog or defaults
				ImageData: img,
			})
			i++ // skip title on next iteration
		}
	}

	return items, nil
}

func extractJpegImages(data []byte) [][]byte {
	var images [][]byte
	pos := 0
	for {
		start := bytes.Index(data[pos:], []byte{0xFF, 0xD8, 0xFF})
		if start == -1 {
			break
		}
		absStart := pos + start
		end := bytes.Index(data[absStart:], []byte{0xFF, 0xD9})
		if end == -1 {
			break
		}
		absEnd := absStart + end + 2
		imgData := data[absStart:absEnd]
		if len(imgData) > 1000 { // valid image threshold
			images = append(images, imgData)
		}
		pos = absEnd
	}
	return images
}

func extractBiff8Strings(data []byte) []string {
	var res []string
	pos := 0
	limit := len(data) - 4

	for pos < limit {
		if pos+3 <= len(data) && data[pos+2] == 1 { // Unicode flag
			charCount := int(binary.LittleEndian.Uint16(data[pos : pos+2]))
			if charCount > 0 && charCount < 600 {
				byteLen := charCount * 2
				strStart := pos + 3
				strEnd := strStart + byteLen
				if strEnd <= len(data) {
					u16 := make([]uint16, charCount)
					for j := 0; j < charCount; j++ {
						u16[j] = binary.LittleEndian.Uint16(data[strStart+j*2 : strStart+j*2+2])
					}
					decoded := string(utf16.Decode(u16))
					res = append(res, decoded)
					pos = strEnd
					continue
				}
			}
		}
		pos++
	}
	return res
}

func isProductCode(s string) bool {
	s = strings.TrimSpace(s)
	if len(s) < 2 || len(s) > 12 {
		return false
	}
	if strings.HasPrefix(s, "%") {
		return false
	}
	hasDigit := false
	for _, c := range s {
		if c >= '0' && c <= '9' {
			hasDigit = true
			break
		}
	}
	return hasDigit
}

func isProductTitle(s string) bool {
	s = strings.TrimSpace(s)
	if len(s) < 5 {
		return false
	}
	// Exclude template tags and table headers
	headers := []string{
		"Код товара", "Артикул", "Наименование", "Цена", "Ед. изм.",
		"Организация", "Прайс", "%row.", "%typeprice%", "Сумма",
	}
	for _, h := range headers {
		if strings.Contains(s, h) {
			return false
		}
	}
	// Must contain letters (Cyrillic, Latin, or Korean)
	hasLetters := false
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') ||
			(r >= 0x0400 && r <= 0x04FF) || (r >= 0xAC00 && r <= 0xD7AF) {
			hasLetters = true
			break
		}
	}
	return hasLetters
}

func encodeUtf16(s string) []byte {
	u16 := utf16.Encode([]rune(s))
	buf := make([]byte, len(u16)*2)
	for i, v := range u16 {
		binary.LittleEndian.PutUint16(buf[i*2:], v)
	}
	return buf
}
