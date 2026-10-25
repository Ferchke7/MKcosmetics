package bcatalog

import (
	"regexp"
	"strings"
)

type BrandRule struct {
	Canonical string
	Keywords  []string
}

var canonicalBrandRules = []BrandRule{
	{
		Canonical: "The History of Whoo",
		Keywords: []string{
			"THE HISTORY OF WHOO", "THE HISTORY", "THE WHOO", "WHOO",
			"CHEONGIDAN", "GONGJINHYANG", "BICHUP", "HWANYU", "JINYULHYANG", "MYEONGUIHYANG", "WHOOSPA",
		},
	},
	{
		Canonical: "O HUI",
		Keywords: []string{
			"O HUI", "OHUI", "O-HUI", "THE FIRST GENITURE", "AGE RECOVERY", "PRIME ADVANCER", "MIRACLE MOISTURE",
		},
	},
	{
		Canonical: "Sulwhasoo",
		Keywords: []string{
			"SULWHASOO", "SULWHASSO", "SULWHASSOO", "SULWHAS", "JAUMSAENG", "FIRST CARE ACTIVATING",
		},
	},
	{
		Canonical: "SU:M37",
		Keywords: []string{
			"SU:M37", "SUM:37", "SUM37", "SU:M", "SUM", "LOSEC SUMMA", "SECRET ESSENCE", "WATER-FULL", "TIME ENERGY",
		},
	},
	{
		Canonical: "HERA",
		Keywords: []string{
			"HERA", "BLACK CUSHION", "SENSUAL POWDER", "SIGNIA", "ROSY-SATIN",
		},
	},
	{
		Canonical: "CNP Laboratory",
		Keywords: []string{
			"CNP LABORATORY", "CNP",
		},
	},
	{
		Canonical: "PRIMERA",
		Keywords: []string{
			"PRIMERA", "PRMR", "VITA-TINOL", "ORGANICENCE",
		},
	},
	{
		Canonical: "HOLITUAL",
		Keywords: []string{
			"HOLITUAL", "홀리추얼",
		},
	},
	{
		Canonical: "USOLAB",
		Keywords: []string{
			"USOLAB",
		},
	},
	{
		Canonical: "VITAL BEAUTIE",
		Keywords: []string{
			"VITAL BEAUTIE", "VITALBEAUTIE", "VITAL BEAUTY", "VITAL GARDEN", "VITALGARDEN", "METAGREEN", "VITAL",
		},
	},
	{
		Canonical: "AMOREPACIFIC",
		Keywords: []string{
			"AMORE PACIFIC", "AMOREPACIFIC", "AMORE", "TIME RESPONSE", "VINTAGE SINGLE EXTRACT",
		},
	},
	{
		Canonical: "NUMBUZIN",
		Keywords: []string{
			"NUMBUZIN", "NUNBUZIN", "NYMBIZIN",
		},
	},
	{
		Canonical: "RYO",
		Keywords: []string{
			"RYO", "ROOT:GEN",
		},
	},
	{
		Canonical: "CH6",
		Keywords: []string{
			"CH6",
		},
	},
	{
		Canonical: "TOM-TIT-TOT",
		Keywords: []string{
			"TOM-TIT-TOT", "TTT", "TENSELOID",
		},
	},
	{
		Canonical: "RiRe",
		Keywords: []string{
			"RIRE", "RIRE TRIPLE",
		},
	},
	{
		Canonical: "ATOMY",
		Keywords: []string{
			"ATOMY",
		},
	},
	{
		Canonical: "CORINGCO",
		Keywords: []string{
			"CORINGCO",
		},
	},
	{
		Canonical: "TROIAREUKE",
		Keywords: []string{
			"TROIAREUKE",
		},
	},
	{
		Canonical: "BIODANCE",
		Keywords: []string{
			"BIODANCE",
		},
	},
	{
		Canonical: "Medicube",
		Keywords: []string{
			"MEDICUBE", "ZERO PORE", "AGE-R",
		},
	},
	{
		Canonical: "LANEIGE",
		Keywords: []string{
			"LANEIGE", "WATER BANK", "LIP SLEEPING MASK", "NEO CUSHION",
		},
	},
	{
		Canonical: "IOPE",
		Keywords: []string{
			"IOPE", "STEM III", "AIR CUSHION",
		},
	},
	{
		Canonical: "Innisfree",
		Keywords: []string{
			"INNISFREE", "GREEN TEA SEED",
		},
	},
	{
		Canonical: "Etude",
		Keywords: []string{
			"ETUDE", "ETUDE HOUSE", "SOON JUNG",
		},
	},
	{
		Canonical: "COSRX",
		Keywords: []string{
			"COSRX", "SNAIL 96",
		},
	},
	{
		Canonical: "VT Cosmetics",
		Keywords: []string{
			"VT COSMETICS", "REEDLE SHOT", "VT ",
		},
	},
	{
		Canonical: "Dr.Jart+",
		Keywords: []string{
			"DR.JART+", "DR. JART+", "DR.JART", "CICAPAIR", "CERAMIDIN",
		},
	},
	{
		Canonical: "Medi-Peel",
		Keywords: []string{
			"MEDI-PEEL", "MEDIPEEL", "BOR-TOX", "PEPTIDE 9",
		},
	},
	{
		Canonical: "Manyo",
		Keywords: []string{
			"MANYO FACTORY", "MANYO", "BIFIDA BIOME", "PURE CLEANSING",
		},
	},
	{
		Canonical: "JOGABI",
		Keywords: []string{
			"JOGABI",
		},
	},
	{
		Canonical: "CURACION",
		Keywords: []string{
			"CURACION",
		},
	},
	{
		Canonical: "ROUND LAB",
		Keywords: []string{
			"ROUND LAB", "DOKDO", "BIRCH JUICE",
		},
	},
	{
		Canonical: "ANUA",
		Keywords: []string{
			"ANUA", "HEARTLEAF 77",
		},
	},
	{
		Canonical: "SKIN1004",
		Keywords: []string{
			"SKIN1004", "MADAGASCAR CENTELLA",
		},
	},
	{
		Canonical: "TORRIDEN",
		Keywords: []string{
			"TORRIDEN", "DIVE-IN",
		},
	},
	{
		Canonical: "BEAUTY OF JOSEON",
		Keywords: []string{
			"BEAUTY OF JOSEON", "RELIEF SUN",
		},
	},
	{
		Canonical: "SOME BY MI",
		Keywords: []string{
			"SOME BY MI", "AHA BHA PHA",
		},
	},
	{
		Canonical: "ILLIYOON",
		Keywords: []string{
			"ILLIYOON", "CERAMIDE ATO",
		},
	},
	{
		Canonical: "Mamonde",
		Keywords: []string{
			"MAMONDE",
		},
	},
	{
		Canonical: "Hanyul",
		Keywords: []string{
			"HANYUL",
		},
	},
	{
		Canonical: "Sooryehan",
		Keywords: []string{
			"SOORYEHAN",
		},
	},
	{
		Canonical: "Isa Knox",
		Keywords: []string{
			"ISA KNOX",
		},
	},
	{
		Canonical: "A'PIEU",
		Keywords: []string{
			"A'PIEU", "APIEU",
		},
	},
	{
		Canonical: "Missha",
		Keywords: []string{
			"MISSHA", "TIME REVOLUTION",
		},
	},
}

var stopWords = map[string]bool{
	"THE": true, "O": true, "A": true, "AN": true, "IN": true, "ON": true,
	"FOR": true, "TO": true, "OF": true, "WITH": true, "SET": true,
	"SPECIAL": true, "MINI": true, "CARE": true, "NEW": true, "PRO": true,
}

var russianStopWords = map[string]bool{
	"косметический": true, "тональный": true, "крем": true, "пенка": true,
	"пробники": true, "противовоспалительный": true, "зубная": true,
	"красный": true, "лечебный": true, "помада": true, "антивозрастной": true,
	"бальзам": true, "детские": true, "коллаген": true, "кушон": true,
	"маска": true, "сыворотка": true, "тонер": true, "табле6тки": true,
	"капсулы": true, "таблетки": true, "набор": true, "эссенция": true,
	"пэды": true, "средство": true, "упак": true,
}

var stripPrefixRegex = regexp.MustCompile(`^(?:\d+\s+)+`)

func ExtractBrand(title string) string {
	cleanTitle := strings.TrimSpace(title)
	cleanTitle = stripPrefixRegex.ReplaceAllString(cleanTitle, "")
	cleanUpper := strings.ToUpper(cleanTitle)

	// 1. Check against Canonical Brand Rules (Exact keyword matching)
	for _, rule := range canonicalBrandRules {
		for _, kw := range rule.Keywords {
			kwUpper := strings.ToUpper(kw)
			// Match as whole word or prefix/contains
			if strings.HasPrefix(cleanUpper, kwUpper) || strings.Contains(cleanUpper, " "+kwUpper+" ") || strings.Contains(cleanUpper, kwUpper) {
				return rule.Canonical
			}
		}
	}

	// 2. Fallback: extract leading uppercase words if safe
	words := strings.Fields(cleanTitle)
	if len(words) > 0 {
		firstUpper := strings.ToUpper(words[0])
		if !stopWords[firstUpper] && !russianStopWords[strings.ToLower(words[0])] && len(words[0]) > 2 {
			if len(words) > 1 {
				secondUpper := strings.ToUpper(words[1])
				if !stopWords[secondUpper] && len(words[1]) > 1 && strings.ToUpper(words[1]) == words[1] {
					return words[0] + " " + words[1]
				}
			}
			return words[0]
		}
	}

	return "MK Collection"
}
