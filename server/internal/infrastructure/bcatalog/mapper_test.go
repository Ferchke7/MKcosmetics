package bcatalog

import "testing"

func TestExtractBrand(t *testing.T) {
	tests := []struct {
		title    string
		expected string
	}{
		{"Amore Pacific Clinical Response Triple Shot Cream", "AMORE PACIFIC"},
		{"AMORE PACIFIC Time Response Intensive Renewal", "AMORE PACIFIC"},
		{"06 CURACION Lacto Aquanic Cream Mask (Box 60)", "CURACION"},
		{"JOGABI AC CONTROL CALMING CLEANSING FOAM 150ml", "JOGABI"},
		{"Sulwhasoo First Care Activating Serum", "SULWHASOO"},
		{"THE HISTORY OF WHOO Radiant White Moisture Cream", "THE HISTORY OF WHOO"},
		{"CH6 Scalp SSAG SERUM 140 ml", "CH6"},
		{"DR. Oregamo Enzyme Cleansing Powder", "DR. OREGAMO"},
		{"23Skin Lab. Daily Skin Care 7pc Special Set", "23SKIN LAB."},
		{"Alpen 1618 MOOR Heilmoor Activation Facial Mask", "ALPEN 1618"},
	}

	for _, tt := range tests {
		brand := ExtractBrand(tt.title)
		if brand != tt.expected {
			t.Errorf("ExtractBrand(%q) = %q, want %q", tt.title, brand, tt.expected)
		}
	}
}

func TestMakeExcerpt(t *testing.T) {
	raw := `<p>AMORE PACIFIC: <b>Clinical Response</b> &laquo;Triple Shot&raquo; Cream.</p>`
	clean := MakeExcerpt(raw, 50)
	if clean == "" || len(clean) > 55 {
		t.Errorf("unexpected excerpt: %q", clean)
	}
}
