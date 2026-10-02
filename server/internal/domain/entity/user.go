package entity

import "time"

// User represents an admin user in the system
type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	DisplayName  string    `json:"displayName"`
	Phone        string    `json:"phone"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"` // 'admin', 'manager', 'logistics'
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	LastLogin    time.Time `json:"lastLogin,omitempty"`
}

// UserClaims represents the authenticated JWT payload
type UserClaims struct {
	UserID    int64  `json:"userId"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	ExpiresAt int64  `json:"exp"`
}
