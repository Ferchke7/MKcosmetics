package main

import (
	"fmt"
	"log"
	"os"

	"mkcosmetics/server/internal/infrastructure/persistence/sqlite"
	_ "modernc.org/sqlite"
)

func main() {
	dbPath := "./data/mkcosmetics.db"
	if envPath := os.Getenv("DB_PATH"); envPath != "" {
		dbPath = envPath
	}
	if len(os.Args) > 1 && (os.Args[1] == "-h" || os.Args[1] == "--help") {
		fmt.Println("Использование: go run ./server/cmd/resetpass [username] [new_password]")
		fmt.Println("По умолчанию: username='admin', new_password='admin'")
		return
	}

	username := "admin"
	if len(os.Args) > 1 && os.Args[1] != "" {
		username = os.Args[1]
	}

	newPassword := "admin"
	if len(os.Args) > 2 && os.Args[2] != "" {
		newPassword = os.Args[2]
	}

	// NewDB automatically runs migrations and schema updates
	db, err := sqlite.NewDB(dbPath)
	if err != nil {
		log.Fatalf("❌ Ошибка инициализации базы SQLite (%s): %v", dbPath, err)
	}
	defer db.Close()

	hash, err := sqlite.HashPassword(newPassword)
	if err != nil {
		log.Fatalf("❌ Ошибка хеширования пароля: %v", err)
	}

	res, err := db.Exec(`
		UPDATE users 
		SET password_hash = ?, is_active = 1 
		WHERE username = ?
	`, hash, username)
	if err != nil {
		log.Fatalf("❌ Ошибка обновления пароля в базе: %v", err)
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		// Insert if user doesn't exist
		_, err = db.Exec(`
			INSERT INTO users (username, display_name, password_hash, role, is_active)
			VALUES (?, 'Administrator', ?, 'admin', 1)
			ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
		`, username, hash)
		if err != nil {
			log.Fatalf("❌ Ошибка создания пользователя: %v", err)
		}
		fmt.Printf("✅ Создан пользователь '%s' с паролем '%s' в базе '%s'\n", username, newPassword, dbPath)
	} else {
		fmt.Printf("✅ Пароль для пользователя '%s' успешно сброшен на '%s' (База: %s)\n", username, newPassword, dbPath)
	}
}
