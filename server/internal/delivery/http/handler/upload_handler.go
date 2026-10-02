package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type UploadHandler struct {
	uploadDir string
}

func NewUploadHandler(uploadDir string) *UploadHandler {
	if uploadDir == "" {
		uploadDir = filepath.Join("data", "uploads")
	}
	_ = os.MkdirAll(uploadDir, 0755)
	return &UploadHandler{
		uploadDir: uploadDir,
	}
}

func (h *UploadHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Max upload size: 10MB
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Размер файла превышает лимит 10MB",
		})
		return
	}

	// Look for file under keys: "file", "receipt", "image"
	file, header, err := r.FormFile("file")
	if err != nil {
		file, header, err = r.FormFile("receipt")
	}
	if err != nil {
		file, header, err = r.FormFile("image")
	}
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Файл не передан в форме (ожидается поле 'file' или 'receipt')",
		})
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
		".pdf":  true,
	}
	if !allowedExts[ext] {
		ext = ".jpg"
	}

	_ = os.MkdirAll(h.uploadDir, 0755)

	filename := fmt.Sprintf("receipt_%d%s", time.Now().UnixNano(), ext)
	targetPath := filepath.Join(h.uploadDir, filename)

	dst, err := os.Create(targetPath)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Не удалось сохранить файл: " + err.Error(),
		})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Ошибка записи файла: " + err.Error(),
		})
		return
	}

	publicURL := "/uploads/" + filename

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"url":      publicURL,
		"filename": filename,
	})
}
