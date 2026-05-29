package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"projectm/backend/internal/auth"
)

func TestRequireUserRejectsRequestWithoutSession(t *testing.T) {
	authenticator := NewAuthenticator(auth.NewSessionManager("test-secret", time.Hour))
	request := httptest.NewRequest(http.MethodGet, "/api/v1/home", nil)
	request.Header.Set("X-ProjectM-User", "USR_FAKE")
	response := httptest.NewRecorder()

	authenticator.RequireUser(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not run without a valid session cookie")
	})(response, request)

	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
	}
}

func TestRequireUserAcceptsValidSessionCookie(t *testing.T) {
	sessions := auth.NewSessionManager("test-secret", time.Hour)
	authenticator := NewAuthenticator(sessions)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/home", nil)
	request.AddCookie(&http.Cookie{
		Name:  sessions.CookieName(),
		Value: sessions.Sign("USR_TEST", time.Now()),
	})
	response := httptest.NewRecorder()

	authenticator.RequireUser(func(w http.ResponseWriter, r *http.Request) {
		if got := UserID(r); got != "USR_TEST" {
			t.Fatalf("UserID = %q, want %q", got, "USR_TEST")
		}
		w.WriteHeader(http.StatusNoContent)
	})(response, request)

	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusNoContent)
	}
}
