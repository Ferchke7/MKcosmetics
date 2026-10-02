package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"mkcosmetics/server/internal/usecase"
)

type StaffHandler struct {
	staffUC *usecase.StaffUseCase
}

func NewStaffHandler(staffUC *usecase.StaffUseCase) *StaffHandler {
	return &StaffHandler{staffUC: staffUC}
}

func (h *StaffHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	staff, err := h.staffUC.GetAllStaff(r.Context())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "staff": staff})
}

func (h *StaffHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input usecase.CreateStaffInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	user, err := h.staffUC.CreateStaff(r.Context(), input)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "user": user})
}

func (h *StaffHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid user id"}`, http.StatusBadRequest)
		return
	}

	var input usecase.CreateStaffInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	if err := h.staffUC.UpdateStaff(r.Context(), id, input); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func (h *StaffHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid user id"}`, http.StatusBadRequest)
		return
	}

	if err := h.staffUC.DeleteStaff(r.Context(), id); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// GetPayroll handles GET /api/admin/staff/payroll
func (h *StaffHandler) GetPayroll(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	commType := r.URL.Query().Get("commissionType")
	commRateStr := r.URL.Query().Get("commissionRate")
	baseSalaryStr := r.URL.Query().Get("baseSalary")
	kpiBonusStr := r.URL.Query().Get("kpiBonus")

	commRate, _ := strconv.ParseFloat(commRateStr, 64)
	baseSalary, _ := strconv.ParseFloat(baseSalaryStr, 64)
	kpiBonus, _ := strconv.ParseFloat(kpiBonusStr, 64)

	report, err := h.staffUC.GetPayrollReport(r.Context(), month, commType, commRate, baseSalary, kpiBonus)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "report": report})
}

// ExportPayrollCSV handles GET /api/admin/staff/payroll/export-csv
func (h *StaffHandler) ExportPayrollCSV(w http.ResponseWriter, r *http.Request) {
	month := r.URL.Query().Get("month")
	commType := r.URL.Query().Get("commissionType")
	commRateStr := r.URL.Query().Get("commissionRate")
	baseSalaryStr := r.URL.Query().Get("baseSalary")
	kpiBonusStr := r.URL.Query().Get("kpiBonus")

	commRate, _ := strconv.ParseFloat(commRateStr, 64)
	baseSalary, _ := strconv.ParseFloat(baseSalaryStr, 64)
	kpiBonus, _ := strconv.ParseFloat(kpiBonusStr, 64)

	data, err := h.staffUC.ExportPayrollCSV(r.Context(), month, commType, commRate, baseSalary, kpiBonus)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	filename := "mk_payroll_statement.csv"
	if month != "" && month != "all" {
		filename = "mk_payroll_" + month + ".csv"
	}

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"\"")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(data)
}
