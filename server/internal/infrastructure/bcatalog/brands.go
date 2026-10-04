package bcatalog

import (
	"regexp"
	"strings"
)

var knownBrands = []string{
	"AMORE PACIFIC",
	"THE HISTORY OF WHOO",
	"SULWHASOO",
	"SU:M37",
	"O HUI",
	"CURACION",
	"JOGABI",
	"MEDI-PEEL",
	"MEDIPEEL",
	"DR.JART+",
	"DR. JART+",
	"DR.OREGAMO",
	"DR. OREGAMO",
	"23SKIN LAB.",
	"23SKIN LAB",
	"23 SKIN LAB",
	"ALPEN 1618",
	"ALPEN",
	"HERA",
	"CNP LABORATORY",
	"CNP",
	"LANEIGE",
	"IOPE",
	"MISSHA",
	"INNISFREE",
	"ETUDE",
	"CH6",
	"VT COSMETICS",
	"VT",
	"COSRX",
	"ROUND LAB",
	"ANUA",
	"SKIN1004",
	"TORRIDEN",
	"SOME BY MI",
	"BEAUTY OF JOSEON",
	"BANILA CO",
	"CLIO",
	"PERIPERA",
	"ROM&ND",
	"ROMAND",
	"TIRTIR",
	"NUMBUZIN",
	"ABIB",
	"MIXSOON",
	"PYUNKANG YUL",
	"HARUHARU WONDER",
	"PURITO",
	"ISNTREE",
	"I'M FROM",
	"KLAIRS",
	"DR.CEURACLE",
	"D'ALBA",
	"DALBA",
	"MANYO",
	"MANY O FACTORY",
	"GOODAL",
	"APIEU",
	"A'PIEU",
	"AHC",
	"DEAR DAHLIA",
	"HANYUL",
	"SOORYEHAN",
	"ISA KNOX",
	"ILLIYOON",
	"MAMONDE",
	"PRIMERA",
	"KAHI",
}

var stripPrefixRegex = regexp.MustCompile(`^(?:\d+\s+)+`)

func ExtractBrand(title string) string {
	cleanTitle := strings.TrimSpace(title)
	cleanTitle = stripPrefixRegex.ReplaceAllString(cleanTitle, "")
	cleanUpper := strings.ToUpper(cleanTitle)

	// Check against known brands
	for _, b := range knownBrands {
		pattern := strings.ToUpper(b)
		if strings.HasPrefix(cleanUpper, pattern) {
			return b
		}
	}

	for _, b := range knownBrands {
		pattern := strings.ToUpper(b)
		if strings.Contains(cleanUpper, pattern) {
			return b
		}
	}

	// Fallback: extract leading uppercase words
	words := strings.Fields(cleanTitle)
	if len(words) > 0 {
		first := words[0]
		if len(first) > 2 && strings.ToUpper(first) == first {
			if len(words) > 1 && strings.ToUpper(words[1]) == words[1] && len(words[1]) > 2 {
				return first + " " + words[1]
			}
			return first
		}
	}

	return "MK Collection"
}
