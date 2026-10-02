package usecase

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/domain/repository"
	"mkcosmetics/server/internal/infrastructure/persistence/sqlite"
)

type AuthUseCase struct {
	userRepo  repository.UserRepository
	jwtSecret []byte
}

func NewAuthUseCase(userRepo repository.UserRepository, secret string) *AuthUseCase {
	if secret == "" {
		secret = "mkcosmetics-super-secret-jwt-key-2026"
	}
	return &AuthUseCase{
		userRepo:  userRepo,
		jwtSecret: []byte(secret),
	}
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type UserResponse struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	LastLogin time.Time `json:"lastLogin,omitempty"`
}

func (uc *AuthUseCase) Login(ctx context.Context, username, password string) (*AuthResponse, error) {
	user, err := uc.userRepo.FindByUsername(ctx, username)
	if err != nil || user == nil {
		return nil, errors.New("неверный логин или пароль")
	}

	if !sqlite.CheckPassword(password, user.PasswordHash) {
		return nil, errors.New("неверный логин или пароль")
	}

	_ = uc.userRepo.UpdateLastLogin(ctx, user.ID)

	// Generate 7-day token
	claims := entity.UserClaims{
		UserID:    user.ID,
		Username:  user.Username,
		Role:      user.Role,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour).Unix(),
	}

	token, err := uc.generateJWT(claims)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &AuthResponse{
		Token: token,
		User: UserResponse{
			ID:        user.ID,
			Username:  user.Username,
			Role:      user.Role,
			LastLogin: time.Now(),
		},
	}, nil
}

func (uc *AuthUseCase) ChangePassword(ctx context.Context, userID int64, newPassword string) error {
	if len(newPassword) < 4 {
		return errors.New("пароль должен быть не менее 4 символов")
	}

	hash, err := sqlite.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return uc.userRepo.UpdatePassword(ctx, userID, hash)
}

func (uc *AuthUseCase) ValidateToken(tokenStr string) (*entity.UserClaims, error) {
	parts := strings.Split(tokenStr, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	headerPayload := parts[0] + "." + parts[1]
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, errors.New("invalid signature encoding")
	}

	mac := hmac.New(sha256.New, uc.jwtSecret)
	mac.Write([]byte(headerPayload))
	expectedSignature := mac.Sum(nil)

	if !hmac.Equal(signature, expectedSignature) {
		return nil, errors.New("invalid token signature")
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("invalid payload encoding")
	}

	var claims entity.UserClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, errors.New("invalid payload json")
	}

	if time.Now().Unix() > claims.ExpiresAt {
		return nil, errors.New("token expired")
	}

	return &claims, nil
}

func (uc *AuthUseCase) generateJWT(claims entity.UserClaims) (string, error) {
	headerJSON := `{"alg":"HS256","typ":"JWT"}`
	headerB64 := base64.RawURLEncoding.EncodeToString([]byte(headerJSON))

	payloadJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadJSON)

	unsignedToken := headerB64 + "." + payloadB64

	mac := hmac.New(sha256.New, uc.jwtSecret)
	mac.Write([]byte(unsignedToken))
	signature := mac.Sum(nil)
	signatureB64 := base64.RawURLEncoding.EncodeToString(signature)

	return unsignedToken + "." + signatureB64, nil
}
