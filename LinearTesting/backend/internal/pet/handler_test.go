package pet

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"aoa-user-mvp/backend/internal/auth"
	"aoa-user-mvp/backend/internal/user"
	"aoa-user-mvp/backend/internal/wallet"

	"github.com/gin-gonic/gin"
)

func TestPetRoutesRequireAuthentication(t *testing.T) {
	t.Parallel()

	router := newTestRouter()
	response := performJSON(router, http.MethodGet, "/api/pet", nil, "")
	if response.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
	}
}

func TestPetRoutesCreateAndFetchCurrentPet(t *testing.T) {
	t.Parallel()

	router := newTestRouter()
	token := registerTestUser(t, router)

	missing := performJSON(router, http.MethodGet, "/api/pet", nil, token)
	if missing.Code != http.StatusNotFound {
		t.Fatalf("missing status = %d, want %d", missing.Code, http.StatusNotFound)
	}

	created := performJSON(router, http.MethodPost, "/api/pet", map[string]string{
		"name":     "Sprout",
		"template": "mint-bean",
	}, token)
	if created.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body=%s", created.Code, http.StatusCreated, created.Body.String())
	}

	var createBody struct {
		Data struct {
			Pet Pet `json:"pet"`
		} `json:"data"`
	}
	if err := json.Unmarshal(created.Body.Bytes(), &createBody); err != nil {
		t.Fatal(err)
	}
	if createBody.Data.Pet.Level != 1 || createBody.Data.Pet.Mood != "happy" {
		t.Fatalf("created pet level=%d mood=%q", createBody.Data.Pet.Level, createBody.Data.Pet.Mood)
	}

	fetched := performJSON(router, http.MethodGet, "/api/pet", nil, token)
	if fetched.Code != http.StatusOK {
		t.Fatalf("fetch status = %d, want %d; body=%s", fetched.Code, http.StatusOK, fetched.Body.String())
	}

	var fetchBody struct {
		Data struct {
			Pet           Pet           `json:"pet"`
			LevelProgress LevelProgress `json:"level_progress"`
		} `json:"data"`
	}
	if err := json.Unmarshal(fetched.Body.Bytes(), &fetchBody); err != nil {
		t.Fatal(err)
	}
	if fetchBody.Data.Pet.ID != createBody.Data.Pet.ID {
		t.Fatalf("fetched pet ID = %q, want %q", fetchBody.Data.Pet.ID, createBody.Data.Pet.ID)
	}
	if fetchBody.Data.Pet.CurrentSkin == "" {
		t.Fatal("fetched pet did not include current skin")
	}
	if fetchBody.Data.LevelProgress.Current.LevelNumber != 1 {
		t.Fatalf("level progress current = %d, want 1", fetchBody.Data.LevelProgress.Current.LevelNumber)
	}

	progress := performJSON(router, http.MethodGet, "/api/pet/level-progress", nil, token)
	if progress.Code != http.StatusOK {
		t.Fatalf("progress status = %d, want %d; body=%s", progress.Code, http.StatusOK, progress.Body.String())
	}
	if !bytes.Contains(progress.Body.Bytes(), []byte("growth_to_next")) {
		t.Fatalf("progress response should include growth_to_next: %s", progress.Body.String())
	}
}

func TestPetRoutesFeedRejectsInsufficientBalance(t *testing.T) {
	t.Parallel()

	router := newTestRouter()
	token := registerTestUser(t, router)

	created := performJSON(router, http.MethodPost, "/api/pet", map[string]string{
		"name":     "Sprout",
		"template": "mint-bean",
	}, token)
	if created.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body=%s", created.Code, http.StatusCreated, created.Body.String())
	}

	fed := performJSON(router, http.MethodPost, "/api/pet/feed", map[string]int{"amount": 1}, token)
	if fed.Code != http.StatusConflict {
		t.Fatalf("feed status = %d, want %d; body=%s", fed.Code, http.StatusConflict, fed.Body.String())
	}
}

func TestPetRoutesEventsReturnActivityWithoutUserID(t *testing.T) {
	t.Parallel()

	router := newTestRouter()
	token := registerTestUser(t, router)

	created := performJSON(router, http.MethodPost, "/api/pet", map[string]string{
		"name":     "Sprout",
		"template": "mint-bean",
	}, token)
	if created.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body=%s", created.Code, http.StatusCreated, created.Body.String())
	}

	events := performJSON(router, http.MethodGet, "/api/pet/events", nil, token)
	if events.Code != http.StatusOK {
		t.Fatalf("events status = %d, want %d; body=%s", events.Code, http.StatusOK, events.Body.String())
	}
	if bytes.Contains(events.Body.Bytes(), []byte("user_id")) {
		t.Fatalf("events response should not expose user_id: %s", events.Body.String())
	}
	if !bytes.Contains(events.Body.Bytes(), []byte("pet_created")) {
		t.Fatalf("events response should include pet_created: %s", events.Body.String())
	}
}

func TestPetRoutesSkinsReturnLockedAndUnlockedSkins(t *testing.T) {
	t.Parallel()

	router := newTestRouter()
	token := registerTestUser(t, router)

	created := performJSON(router, http.MethodPost, "/api/pet", map[string]string{
		"name":     "Sprout",
		"template": "mint-bean",
	}, token)
	if created.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body=%s", created.Code, http.StatusCreated, created.Body.String())
	}

	skins := performJSON(router, http.MethodGet, "/api/pet/skins", nil, token)
	if skins.Code != http.StatusOK {
		t.Fatalf("skins status = %d, want %d; body=%s", skins.Code, http.StatusOK, skins.Body.String())
	}
	if !bytes.Contains(skins.Body.Bytes(), []byte("asset_path")) {
		t.Fatalf("skins response should include asset_path: %s", skins.Body.String())
	}
	if !bytes.Contains(skins.Body.Bytes(), []byte("unlock_condition")) {
		t.Fatalf("skins response should include unlock_condition: %s", skins.Body.String())
	}
	if !bytes.Contains(skins.Body.Bytes(), []byte("Mint Bean")) {
		t.Fatalf("skins response should include default skin: %s", skins.Body.String())
	}
}

func TestPetRoutesTeamSummaryReturnsAggregateData(t *testing.T) {
	t.Parallel()

	router := newTestRouter()
	token := registerTestUser(t, router)

	created := performJSON(router, http.MethodPost, "/api/pet", map[string]string{
		"name":     "Sprout",
		"template": "mint-bean",
	}, token)
	if created.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body=%s", created.Code, http.StatusCreated, created.Body.String())
	}

	summary := performJSON(router, http.MethodGet, "/api/pet/team-summary", nil, token)
	if summary.Code != http.StatusOK {
		t.Fatalf("summary status = %d, want %d; body=%s", summary.Code, http.StatusOK, summary.Body.String())
	}
	if bytes.Contains(summary.Body.Bytes(), []byte("user_id")) {
		t.Fatalf("summary response should not expose user_id: %s", summary.Body.String())
	}
	if !bytes.Contains(summary.Body.Bytes(), []byte("team_summary")) {
		t.Fatalf("summary response should include team_summary: %s", summary.Body.String())
	}
}

func TestPetRoutesAdminReportRequiresAdmin(t *testing.T) {
	t.Parallel()

	router := gin.New()
	RegisterRoutes(
		router,
		NewService(NewMemoryRepository()),
		petFakeAuthenticator{allow: true, role: "user"},
	)

	report := performJSON(router, http.MethodGet, "/api/admin/reports/summary", nil, "token")
	if report.Code != http.StatusForbidden {
		t.Fatalf("report status = %d, want %d; body=%s", report.Code, http.StatusForbidden, report.Body.String())
	}
}

func TestPetRoutesAdminReportReturnsAggregateData(t *testing.T) {
	t.Parallel()

	router := gin.New()
	RegisterRoutes(
		router,
		NewService(NewMemoryRepository()),
		petFakeAuthenticator{allow: true, role: "admin"},
	)

	report := performJSON(router, http.MethodGet, "/api/admin/reports/summary", nil, "token")
	if report.Code != http.StatusOK {
		t.Fatalf("report status = %d, want %d; body=%s", report.Code, http.StatusOK, report.Body.String())
	}
	if bytes.Contains(report.Body.Bytes(), []byte("user_id")) {
		t.Fatalf("report response should not expose user_id: %s", report.Body.String())
	}
	if !bytes.Contains(report.Body.Bytes(), []byte("daily_active_users")) {
		t.Fatalf("report response should include core metrics: %s", report.Body.String())
	}
}

func newTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	authService := auth.NewService(auth.NewMemoryRepository(), auth.TokenConfig{Secret: "test-secret"})

	auth.RegisterRoutes(router, authService)
	RegisterRoutes(router, NewFeedService(NewMemoryRepository(), wallet.NewService(wallet.NewMemoryRepository())), authService)

	return router
}

func registerTestUser(t *testing.T, router *gin.Engine) string {
	t.Helper()

	response := performJSON(router, http.MethodPost, "/api/users", map[string]string{
		"email":    "pet-user@example.com",
		"username": "pet_user",
		"password": "secure-password",
	}, "")
	if response.Code != http.StatusCreated {
		t.Fatalf("register status = %d, want %d; body=%s", response.Code, http.StatusCreated, response.Body.String())
	}

	var parsed struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &parsed); err != nil {
		t.Fatal(err)
	}
	if parsed.Data.Token == "" {
		t.Fatal("register response did not include token")
	}

	return parsed.Data.Token
}

type petFakeAuthenticator struct {
	allow bool
	role  string
}

func (a petFakeAuthenticator) CurrentUser(ctx context.Context, token string) (user.User, error) {
	if !a.allow || token == "" {
		return user.User{}, ErrPetNotFound
	}
	role := a.role
	if role == "" {
		role = "user"
	}
	return user.User{ID: "usr_000001", Email: "user@example.com", Role: role}, nil
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
