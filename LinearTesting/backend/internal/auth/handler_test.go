package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAuthFlow(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	RegisterRoutes(router, NewService(NewMemoryRepository(), TokenConfig{Secret: "test-secret"}))

	registerBody := map[string]string{
		"email":    "user@example.com",
		"username": "example_user",
		"password": "secure-password",
	}
	registerResponse := performJSON(router, http.MethodPost, "/api/users", registerBody, "")
	if registerResponse.Code != http.StatusCreated {
		t.Fatalf(
			"register status = %d, want %d; body=%s",
			registerResponse.Code,
			http.StatusCreated,
			registerResponse.Body.String(),
		)
	}
	hasGoField := bytes.Contains(registerResponse.Body.Bytes(), []byte("PasswordHash"))
	hasJSONField := bytes.Contains(registerResponse.Body.Bytes(), []byte("password_hash"))
	if hasGoField || hasJSONField {
		t.Fatal("register response exposed password hash")
	}

	var parsed struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	if err := json.Unmarshal(registerResponse.Body.Bytes(), &parsed); err != nil {
		t.Fatal(err)
	}
	if parsed.Data.Token == "" {
		t.Fatal("register did not return token")
	}

	duplicateResponse := performJSON(router, http.MethodPost, "/api/users", registerBody, "")
	if duplicateResponse.Code != http.StatusConflict {
		t.Fatalf("duplicate status = %d, want %d", duplicateResponse.Code, http.StatusConflict)
	}

	loginResponse := performJSON(router, http.MethodPost, "/api/sessions", map[string]string{
		"email":    "user@example.com",
		"password": "secure-password",
	}, "")
	if loginResponse.Code != http.StatusOK {
		t.Fatalf("login status = %d, want %d; body=%s", loginResponse.Code, http.StatusOK, loginResponse.Body.String())
	}

	badLoginResponse := performJSON(router, http.MethodPost, "/api/sessions", map[string]string{
		"email":    "user@example.com",
		"password": "wrong-password",
	}, "")
	if badLoginResponse.Code != http.StatusUnauthorized {
		t.Fatalf("bad login status = %d, want %d", badLoginResponse.Code, http.StatusUnauthorized)
	}

	meResponse := performJSON(router, http.MethodGet, "/api/users/me", nil, parsed.Data.Token)
	if meResponse.Code != http.StatusOK {
		t.Fatalf("me status = %d, want %d; body=%s", meResponse.Code, http.StatusOK, meResponse.Body.String())
	}

	unauthenticatedMe := performJSON(router, http.MethodGet, "/api/users/me", nil, "")
	if unauthenticatedMe.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated me status = %d, want %d", unauthenticatedMe.Code, http.StatusUnauthorized)
	}

	logoutResponse := performJSON(router, http.MethodDelete, "/api/sessions/current", nil, parsed.Data.Token)
	if logoutResponse.Code != http.StatusOK {
		t.Fatalf("logout status = %d, want %d", logoutResponse.Code, http.StatusOK)
	}

	meAfterLogout := performJSON(router, http.MethodGet, "/api/users/me", nil, parsed.Data.Token)
	if meAfterLogout.Code != http.StatusUnauthorized {
		t.Fatalf("me after logout status = %d, want %d", meAfterLogout.Code, http.StatusUnauthorized)
	}
}

func TestRegisterValidation(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	RegisterRoutes(router, NewService(NewMemoryRepository(), TokenConfig{Secret: "test-secret"}))

	response := performJSON(router, http.MethodPost, "/api/users", map[string]string{
		"email":    "not-an-email",
		"username": "",
		"password": "short",
	}, "")
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusBadRequest)
	}
}

func TestLegacyAuthRoutesRemainAvailable(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	RegisterRoutes(router, NewService(NewMemoryRepository(), TokenConfig{Secret: "test-secret"}))

	registerResponse := performJSON(router, http.MethodPost, "/api/auth/register", map[string]string{
		"email":    "legacy@example.com",
		"username": "legacy_user",
		"password": "secure-password",
	}, "")
	if registerResponse.Code != http.StatusCreated {
		t.Fatalf("legacy register status = %d, want %d", registerResponse.Code, http.StatusCreated)
	}

	loginResponse := performJSON(router, http.MethodPost, "/api/auth/login", map[string]string{
		"email":    "legacy@example.com",
		"password": "secure-password",
	}, "")
	if loginResponse.Code != http.StatusOK {
		t.Fatalf("legacy login status = %d, want %d", loginResponse.Code, http.StatusOK)
	}
}

func performJSON(router *gin.Engine, method string, path string, body any, token string) *httptest.ResponseRecorder {
	var payload []byte
	if body != nil {
		payload, _ = json.Marshal(body)
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req_test")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}
