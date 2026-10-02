package middleware

import (
	"context"
	"net/http"
	"strings"

	"mkcosmetics/server/internal/domain/entity"
	"mkcosmetics/server/internal/usecase"
)

type contextKey string

const UserClaimsKey contextKey = "user_claims"

type AuthMiddleware struct {
	authUC *usecase.AuthUseCase
}

func NewAuthMiddleware(authUC *usecase.AuthUseCase) *AuthMiddleware {
	return &AuthMiddleware{authUC: authUC}
}

func (m *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		tokenStr := ""

		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else if qToken := r.URL.Query().Get("token"); qToken != "" {
			tokenStr = qToken
		}

		if tokenStr == "" {
			http.Error(w, `{"error":"unauthorized: missing token"}`, http.StatusUnauthorized)
			return
		}

		claims, err := m.authUC.ValidateToken(tokenStr)
		if err != nil {
			http.Error(w, `{"error":"unauthorized: `+err.Error()+`"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserClaimsKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserClaims retrieves user claims from context
func GetUserClaims(ctx context.Context) *entity.UserClaims {
	if val, ok := ctx.Value(UserClaimsKey).(*entity.UserClaims); ok {
		return val
	}
	return nil
}
