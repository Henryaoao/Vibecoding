package middleware

import (
	"context"
	"net/http"
	"time"

	"projectm/backend/internal/auth"
	"projectm/backend/internal/response"
)

type contextKey string

const userIDContextKey contextKey = "projectm_user_id"

type Authenticator struct {
	sessions *auth.SessionManager
}

func NewAuthenticator(sessions *auth.SessionManager) *Authenticator {
	return &Authenticator{sessions: sessions}
}

func CommonHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}

func (a *Authenticator) RequireUser(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := a.currentSessionUserID(r)
		if userID == "" {
			response.Error(w, r, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
			return
		}
		next(w, r.WithContext(context.WithValue(r.Context(), userIDContextKey, userID)))
	}
}

func UserID(r *http.Request) string {
	value, _ := r.Context().Value(userIDContextKey).(string)
	return value
}

func (a *Authenticator) currentSessionUserID(r *http.Request) string {
	if cookie, err := r.Cookie(a.sessions.CookieName()); err == nil {
		if userID, err := a.sessions.Verify(cookie.Value, time.Now()); err == nil {
			return userID
		}
	}
	return ""
}
