package excelimporter

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"math"
	"strings"
	"unicode/utf16"
)

type ExcelProductItem struct {
	Code          string
	Title         string
	PriceKRW      int64
	ImageData     []byte
	CategoryID    int64
	CategoryTitle string
	CategorySlug  string
}

type CategoryRule struct {
	ID       int64
	Title    string
	Slug     string
	Keywords []string
}

// Canonical store category definitions matching the live database
var DefaultCategoryRules = []CategoryRule{
	{588136, "Наборы", "nabory-588136", []string{"набор", "set", "s.s.", "специальный набор", "3pcs", "2pcs", "4pcs", "5pcs", "gift set"}},
	{588137, "Маски", "maski-588137", []string{"маск", "mask", "патч", "patch"}},
	{588147, "Помады и Бальзамы для губ", "pomady-i-balzamy-dlia-gub-588147", []string{"помад", "lip", "губ", "rouge", "lipstick", "lipcerin", "бальзам для губ"}},
	{588143, "Пудры и Кушоны", "pudry-i-kushony-588143", []string{"кушон", "cushion", "пудр", "powder"}},
	{588148, "Основы под макияж", "osnovy-pod-makiiazh-588148", []string{"тональн", "макияж", "foundation", "bb ", "cc ", "base", "concealer", "консилер"}},
	{588152, "Солнцезащитные крема", "solntsezashchitnye-krema-588152", []string{"солнц", "sun", "spf", "sunquid", "sunstick", "sun block"}},
	{588146, "Очищение", "ochishchenie-588146", []string{"пенк", "умыван", "cleans", "foam", "масло для снятия", "cleansing", "демакияж"}},
	{588151, "Скрабы и Пилинги", "skraby-i-pilingi-588151", []string{"пилинг", "peeling", "скраб", "scrub"}},
	{588138, "Мист", "mist-588138", []string{"мист", "mist"}},
	{588131, "Ампулы и серумы", "ampuly-i-serumy-588131", []string{"сыворотк", "серум", "serum", "ампул", "ampoule"}},
	{588154, "Эссенции и Эмульсии", "essentsii-i-emulsii-588154", []string{"эссенци", "essence", "эмульси", "emulsion"}},
	{588141, "Тонеры и Тоники", "tonery-i-toniki-588141", []string{"тонер", "тоник", "toner", "пэд", "pad", "skin refresher", "refresher"}},
	{588150, "Уход за кожей вокруг глаз", "ukhod-za-kozhei-vokrug-glaz-588150", []string{"для глаз", "eye cream", "вокруг глаз", "век"}},
	{588139, "Для мужчин", "dlia-muzhchin-588139", []string{"мужчин", "homme", "men"}},
	{588145, "Уход за Волосами", "ukhod-za-volosami-588145", []string{"волос", "shampoo", "шампунь", "hair", "бальзам для волос"}},
	{588153, "Уход за Телом", "ukhod-za-telom-588153", []string{"для тела", "body", "гель для душа", "крем для рук", "hand cream"}},
	{588135, "Бады и Витамины", "bady-i-vitaminy-588135", []string{"бад", "витамин", "meta green", "vital beautie", "таблетки", "collagen", "коллаген"}},
	{588144, "Крема", "krema-588144", []string{"крем", "cream", "бальм", "balm"}},
}

func ClassifyCategory(title string) (int64, string, string) {
	t := strings.ToLower(title)
	for _, rule := range DefaultCategoryRules {
		for _, kw := range rule.Keywords {
			if strings.Contains(t, kw) {
				return rule.ID, rule.Title, rule.Slug
			}
		}
	}
	return 588149, "Разное", "raznoe-588149"
}

// ParseXlsExtractProducts extracts structured products from BIFF8 XLS (Business.Ru / Class365 export)
// using deterministic OLE DIFAT/FAT unpacking and Escher ClientAnchor row matching.
func ParseXlsExtractProducts(data []byte) ([]ExcelProductItem, error) {
	if len(data) < 1000 {
		return nil, fmt.Errorf("файл слишком мал для XLS книги")
	}

	// Detect if user accidentally uploaded an empty Class365 print template instead of the database export
	if bytes.Contains(data, []byte("%row.code%")) || bytes.Contains(data, []byte("%row.goodsname%")) || bytes.Contains(data, []byte("%typeprice%")) {
		return nil, fmt.Errorf("выбран пустой печатный шаблон Класс365/Бизнес.Ру (размер %d КБ) с переменными %%row.code%%. Пожалуйста, выберите файл полной выгрузки товаров 'РабочийШБ2.xls' (~26 МБ) с фотографиями", len(data)/1024)
	}

	oleMagic := []byte{0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1}
	if !bytes.HasPrefix(data, oleMagic) {
		return nil, fmt.Errorf("файл не является допустимой XLS (BIFF8 OLE) книгой")
	}

	wbStream, err := parseOLEWorkbook(data)
	if err != nil {
		return nil, fmt.Errorf("ошибка чтения структуры книги Excel: %w", err)
	}

	return parseBiff8Workbook(wbStream)
}

func parseOLEWorkbook(fileData []byte) ([]byte, error) {
	if len(fileData) < 512 {
		return nil, fmt.Errorf("недостаточный размер OLE заголовка")
	}

	uSectorShift := binary.LittleEndian.Uint16(fileData[30:32])
	sectorSize := 1 << uSectorShift
	if sectorSize < 512 || sectorSize > 4096 {
		sectorSize = 512
	}
	numFatSectors := binary.LittleEndian.Uint32(fileData[44:48])
	firstDirSector := binary.LittleEndian.Uint32(fileData[48:52])
	firstDifatSector := binary.LittleEndian.Uint32(fileData[68:72])

	fatSectors := make([]uint32, 0, numFatSectors)
	for i := 0; i < 109 && i < (len(fileData)-76)/4; i++ {
		sec := binary.LittleEndian.Uint32(fileData[76+i*4 : 80+i*4])
		if sec < 0xFFFFFFFA {
			fatSectors = append(fatSectors, sec)
		}
	}

	curDifat := firstDifatSector
	for curDifat < 0xFFFFFFFA && uint32(len(fatSectors)) < numFatSectors {
		difatOffset := int(curDifat+1) * sectorSize
		if difatOffset+sectorSize > len(fileData) {
			break
		}
		difatData := fileData[difatOffset : difatOffset+sectorSize]
		entries := (sectorSize / 4) - 1
		for i := 0; i < entries; i++ {
			sec := binary.LittleEndian.Uint32(difatData[i*4 : (i+1)*4])
			if sec < 0xFFFFFFFA && uint32(len(fatSectors)) < numFatSectors {
				fatSectors = append(fatSectors, sec)
			}
		}
		curDifat = binary.LittleEndian.Uint32(difatData[entries*4 : (entries+1)*4])
	}

	fat := make([]uint32, 0, len(fatSectors)*(sectorSize/4))
	for _, sec := range fatSectors {
		secOffset := int(sec+1) * sectorSize
		if secOffset+sectorSize > len(fileData) {
			break
		}
		secData := fileData[secOffset : secOffset+sectorSize]
		for i := 0; i < sectorSize; i += 4 {
			fat = append(fat, binary.LittleEndian.Uint32(secData[i:i+4]))
		}
	}

	// Read directory stream
	var dirStream bytes.Buffer
	curSec := firstDirSector
	visited := make(map[uint32]bool)
	for curSec < 0xFFFFFFFA && !visited[curSec] && int(curSec) < len(fat) {
		visited[curSec] = true
		secOffset := int(curSec+1) * sectorSize
		if secOffset+sectorSize > len(fileData) {
			break
		}
		dirStream.Write(fileData[secOffset : secOffset+sectorSize])
		curSec = fat[curSec]
	}

	dirBytes := dirStream.Bytes()
	var wbStartSec uint32
	var wbSize uint64
	foundWorkbook := false

	for pos := 0; pos+128 <= len(dirBytes); pos += 128 {
		entry := dirBytes[pos : pos+128]
		nameLen := binary.LittleEndian.Uint16(entry[64:66])
		if nameLen > 64 {
			nameLen = 64
		}
		if nameLen > 0 {
			rawName := entry[:nameLen]
			var u16s []uint16
			for i := 0; i+2 <= len(rawName); i += 2 {
				val := binary.LittleEndian.Uint16(rawName[i : i+2])
				if val == 0 {
					break
				}
				u16s = append(u16s, val)
			}
			name := strings.ToLower(string(utf16.Decode(u16s)))
			if name == "workbook" || name == "book" {
				wbStartSec = binary.LittleEndian.Uint32(entry[116:120])
				wbSize = binary.LittleEndian.Uint64(entry[120:128])
				foundWorkbook = true
				break
			}
		}
	}

	if !foundWorkbook {
		return nil, fmt.Errorf("поток 'Workbook' не найден в OLE контейнере")
	}

	var wbStream bytes.Buffer
	curSec = wbStartSec
	visited = make(map[uint32]bool)
	for curSec < 0xFFFFFFFA && !visited[curSec] && int(curSec) < len(fat) && uint64(wbStream.Len()) < wbSize {
		visited[curSec] = true
		secOffset := int(curSec+1) * sectorSize
		if secOffset+sectorSize > len(fileData) {
			break
		}
		wbStream.Write(fileData[secOffset : secOffset+sectorSize])
		curSec = fat[curSec]
	}

	wbData := wbStream.Bytes()
	if uint64(len(wbData)) > wbSize {
		wbData = wbData[:wbSize]
	}
	return wbData, nil
}

type sstChunkReader struct {
	chunks   [][]byte
	chunkIdx int
	offset   int
}

func (r *sstChunkReader) readBytes(n int) []byte {
	res := make([]byte, 0, n)
	for n > 0 && r.chunkIdx < len(r.chunks) {
		cur := r.chunks[r.chunkIdx]
		avail := len(cur) - r.offset
		if avail <= 0 {
			r.chunkIdx++
			r.offset = 0
			continue
		}
		toRead := n
		if toRead > avail {
			toRead = avail
		}
		res = append(res, cur[r.offset:r.offset+toRead]...)
		r.offset += toRead
		n -= toRead
	}
	return res
}

func (r *sstChunkReader) readU16() uint16 {
	b := r.readBytes(2)
	if len(b) < 2 {
		return 0
	}
	return binary.LittleEndian.Uint16(b)
}

func (r *sstChunkReader) readU32() uint32 {
	b := r.readBytes(4)
	if len(b) < 4 {
		return 0
	}
	return binary.LittleEndian.Uint32(b)
}

func parseSST(chunks [][]byte) []string {
	if len(chunks) == 0 {
		return nil
	}
	reader := &sstChunkReader{chunks: chunks}
	_ = reader.readU32() // total strings
	unique := reader.readU32()
	if unique == 0 || unique > 500000 {
		return nil
	}

	res := make([]string, 0, unique)
	for i := uint32(0); i < unique; i++ {
		hdr := reader.readBytes(3)
		if len(hdr) < 3 {
			break
		}
		charCount := binary.LittleEndian.Uint16(hdr[:2])
		flags := hdr[2]
		isUnicode := (flags & 0x01) != 0
		hasRich := (flags & 0x08) != 0
		hasExt := (flags & 0x04) != 0

		var rt uint16
		if hasRich {
			rt = reader.readU16()
		}
		var cbExt uint32
		if hasExt {
			cbExt = reader.readU32()
		}

		charsLeft := int(charCount)
		var strBuilder strings.Builder

		for charsLeft > 0 && reader.chunkIdx < len(reader.chunks) {
			curChunk := reader.chunks[reader.chunkIdx]
			avail := len(curChunk) - reader.offset
			if avail <= 0 {
				reader.chunkIdx++
				reader.offset = 0
				if reader.chunkIdx >= len(reader.chunks) {
					break
				}
				contFlag := reader.chunks[reader.chunkIdx][0]
				reader.offset = 1
				isUnicode = (contFlag & 0x01) != 0
				avail = len(reader.chunks[reader.chunkIdx]) - reader.offset
			}

			bytesPerChar := 1
			if isUnicode {
				bytesPerChar = 2
			}

			charsCanRead := charsLeft
			if charsCanRead > avail/bytesPerChar {
				charsCanRead = avail / bytesPerChar
			}

			if charsCanRead == 0 && avail < bytesPerChar {
				raw := reader.readBytes(bytesPerChar)
				if isUnicode && len(raw) == 2 {
					u := binary.LittleEndian.Uint16(raw)
					strBuilder.WriteString(string(utf16.Decode([]uint16{u})))
				} else if len(raw) == 1 {
					strBuilder.WriteByte(raw[0])
				}
				charsLeft--
				continue
			}

			raw := reader.readBytes(charsCanRead * bytesPerChar)
			if isUnicode {
				u16s := make([]uint16, len(raw)/2)
				for k := 0; k < len(u16s); k++ {
					u16s[k] = binary.LittleEndian.Uint16(raw[k*2 : k*2+2])
				}
				strBuilder.WriteString(string(utf16.Decode(u16s)))
			} else {
				strBuilder.WriteString(string(raw))
			}
			charsLeft -= charsCanRead
		}

		res = append(res, strBuilder.String())

		if hasRich && rt > 0 {
			reader.readBytes(int(rt) * 4)
		}
		if hasExt && cbExt > 0 {
			reader.readBytes(int(cbExt))
		}
	}
	return res
}

func decodeRK(rk uint32) float64 {
	var val float64
	if (rk & 2) != 0 {
		intVal := int32(rk) >> 2
		val = float64(intVal)
	} else {
		bits := uint64(rk&0xFFFFFFFC) << 32
		val = math.Float64frombits(bits)
	}
	if (rk & 1) != 0 {
		val /= 100.0
	}
	return val
}

func parseBiff8Workbook(wb []byte) ([]ExcelProductItem, error) {
	var sstChunks [][]byte
	var dggChunks [][]byte
	var sheetBOFPos int = -1

	pos := 0
	for pos+4 <= len(wb) {
		recID := binary.LittleEndian.Uint16(wb[pos : pos+2])
		recLen := int(binary.LittleEndian.Uint16(wb[pos+2 : pos+4]))
		recEnd := pos + 4 + recLen
		if recEnd > len(wb) {
			break
		}

		if recID == 0x00EB { // MSODRAWINGGROUP
			dggChunks = append(dggChunks, wb[pos+4:recEnd])
			pNext := recEnd
			for pNext+4 <= len(wb) {
				nID := binary.LittleEndian.Uint16(wb[pNext : pNext+2])
				nLen := int(binary.LittleEndian.Uint16(wb[pNext+2 : pNext+4]))
				if nID == 0x003C { // CONTINUE
					dggChunks = append(dggChunks, wb[pNext+4:pNext+4+nLen])
					pNext += 4 + nLen
				} else {
					break
				}
			}
		} else if recID == 0x00FC { // SST
			sstChunks = append(sstChunks, wb[pos+4:recEnd])
			pNext := recEnd
			for pNext+4 <= len(wb) {
				nID := binary.LittleEndian.Uint16(wb[pNext : pNext+2])
				nLen := int(binary.LittleEndian.Uint16(wb[pNext+2 : pNext+4]))
				if nID == 0x003C { // CONTINUE
					sstChunks = append(sstChunks, wb[pNext+4:pNext+4+nLen])
					pNext += 4 + nLen
				} else {
					break
				}
			}
		} else if recID == 0x0809 { // BOF
			if pos+8 <= len(wb) {
				sub := binary.LittleEndian.Uint16(wb[pos+6 : pos+8])
				if sub == 0x0010 { // Worksheet
					sheetBOFPos = pos
					break
				}
			}
		}

		pos = recEnd
	}

	sst := parseSST(sstChunks)

	// Extract BSE Blips from continuous Escher drawing group stream
	dggData := bytes.Join(dggChunks, nil)
	bstoreIdx := bytes.Index(dggData, []byte{0x01, 0xF0})
	blipMap := make(map[uint32][]byte)

	if bstoreIdx != -1 && bstoreIdx+6 <= len(dggData) {
		bstoreLen := int(binary.LittleEndian.Uint32(dggData[bstoreIdx+2 : bstoreIdx+6]))
		if bstoreIdx+6+bstoreLen <= len(dggData) {
			bstoreBody := dggData[bstoreIdx+6 : bstoreIdx+6+bstoreLen]

			p := 0
			var blipID uint32 = 1
			for p+8 <= len(bstoreBody) {
				fbt := binary.LittleEndian.Uint16(bstoreBody[p+2 : p+4])
				recSize := int(binary.LittleEndian.Uint32(bstoreBody[p+4 : p+8]))
				if p+8+recSize > len(bstoreBody) {
					break
				}
				if fbt == 0xF007 { // BSE
					bseBody := bstoreBody[p+8 : p+8+recSize]
					jpgStart := bytes.Index(bseBody, []byte{0xFF, 0xD8})
					if jpgStart != -1 {
						jpgEnd := bytes.LastIndex(bseBody, []byte{0xFF, 0xD9})
						if jpgEnd != -1 && jpgEnd+2 > jpgStart {
							blipMap[blipID] = bseBody[jpgStart : jpgEnd+2]
						}
					}
					blipID++
				}
				p += 8 + recSize
			}
		}
	}

	// Parse sheet records
	rowCells := make(map[int]map[int]string)
	rowPrices := make(map[int]map[int]int64)
	rowBlips := make(map[int]uint32)

	if sheetBOFPos != -1 {
		pos = sheetBOFPos
		for pos+4 <= len(wb) {
			recID := binary.LittleEndian.Uint16(wb[pos : pos+2])
			recLen := int(binary.LittleEndian.Uint16(wb[pos+2 : pos+4]))
			recEnd := pos + 4 + recLen
			if recEnd > len(wb) {
				break
			}
			data := wb[pos+4 : recEnd]

			if recID == 0x00FD { // LABELSST
				if len(data) >= 10 {
					r := int(binary.LittleEndian.Uint16(data[0:2]))
					c := int(binary.LittleEndian.Uint16(data[2:4]))
					sIdx := int(binary.LittleEndian.Uint32(data[6:10]))
					if sIdx < len(sst) {
						if rowCells[r] == nil {
							rowCells[r] = make(map[int]string)
						}
						rowCells[r][c] = sst[sIdx]
					}
				}
			} else if recID == 0x0203 { // NUMBER
				if len(data) >= 14 {
					r := int(binary.LittleEndian.Uint16(data[0:2]))
					c := int(binary.LittleEndian.Uint16(data[2:4]))
					val := math.Float64frombits(binary.LittleEndian.Uint64(data[6:14]))
					if rowPrices[r] == nil {
						rowPrices[r] = make(map[int]int64)
					}
					rowPrices[r][c] = int64(math.Round(val))
				}
			} else if recID == 0x027E { // RK
				if len(data) >= 10 {
					r := int(binary.LittleEndian.Uint16(data[0:2]))
					c := int(binary.LittleEndian.Uint16(data[2:4]))
					val := decodeRK(binary.LittleEndian.Uint32(data[6:10]))
					if rowPrices[r] == nil {
						rowPrices[r] = make(map[int]int64)
					}
					rowPrices[r][c] = int64(math.Round(val))
				}
			} else if recID == 0x00BD { // MULRK
				if len(data) >= 6 {
					r := int(binary.LittleEndian.Uint16(data[0:2]))
					cFirst := int(binary.LittleEndian.Uint16(data[2:4]))
					subP := 4
					c := cFirst
					for subP < len(data)-2 {
						rkVal := binary.LittleEndian.Uint32(data[subP+2 : subP+6])
						val := decodeRK(rkVal)
						if rowPrices[r] == nil {
							rowPrices[r] = make(map[int]int64)
						}
						rowPrices[r][c] = int64(math.Round(val))
						subP += 6
						c++
					}
				}
			} else if recID == 0x00EC { // MSODRAWING
				ancIdx := bytes.Index(data, []byte{0x10, 0xF0})
				optIdx := bytes.Index(data, []byte{0x0B, 0xF0})
				if ancIdx != -1 && optIdx != -1 {
					if ancIdx+6+8 <= len(data) && optIdx+12 <= len(data) {
						ancData := data[ancIdx+6:]
						r1 := int(binary.LittleEndian.Uint16(ancData[6:8]))
						bID := binary.LittleEndian.Uint32(data[optIdx+8 : optIdx+12])
						rowBlips[r1] = bID
					}
				}
			} else if recID == 0x000A { // EOF
				break
			}

			pos = recEnd
		}
	}

	// Match products deterministically by row index
	var products []ExcelProductItem
	maxRow := 0
	for r := range rowCells {
		if r > maxRow {
			maxRow = r
		}
	}

	for r := 0; r <= maxRow; r++ {
		cols := rowCells[r]
		if cols == nil {
			continue
		}
		title := strings.TrimSpace(cols[5])
		if title == "" || title == "Наименование товара" {
			continue
		}
		code := strings.TrimSpace(cols[3])

		// Price: check col 8 (Цена продажи), then col 7, 9
		var price int64
		if pCols := rowPrices[r]; pCols != nil {
			if pCols[8] > 0 {
				price = pCols[8]
			} else if pCols[7] > 0 {
				price = pCols[7]
			} else if pCols[9] > 0 {
				price = pCols[9]
			}
		}

		// Image from exact row anchor
		var imgBytes []byte
		if bID, hasBlip := rowBlips[r]; hasBlip {
			imgBytes = blipMap[bID]
		}

		catID, catTitle, catSlug := ClassifyCategory(title)

		products = append(products, ExcelProductItem{
			Code:          code,
			Title:         title,
			PriceKRW:      price,
			ImageData:     imgBytes,
			CategoryID:    catID,
			CategoryTitle: catTitle,
			CategorySlug:  catSlug,
		})
	}

	if len(products) == 0 {
		return nil, fmt.Errorf("в таблице не найдено товарных строк")
	}

	return products, nil
}
