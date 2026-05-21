package task

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"aoa-user-mvp/backend/internal/response"
	"aoa-user-mvp/backend/internal/user"
	"aoa-user-mvp/backend/internal/wallet"

	"github.com/gin-gonic/gin"
)

type fakeAuthenticator struct {
	allow bool
	role  string
}

func (a fakeAuthenticator) CurrentUser(ctx context.Context, token string) (user.User, error) {
	if !a.allow || token == "" {
		return user.User{}, ErrInvalidTemplate
	}
	role := a.role
	if role == "" {
		role = "user"
	}
	return user.User{ID: "usr_000001", Email: "user@example.com", Role: role}, nil
}

func TestHandler_ListActiveTemplatesRequiresAuth(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: false})
	request := httptest.NewRequest(http.MethodGet, "/api/task-templates", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestHandler_ListActiveTemplatesReturnsActiveOnly(t *testing.T) {
	t.Parallel()

	repo := NewMemoryRepository()
	service := NewService(repo)
	disabled, _, err := service.CreateTemplate(context.Background(), TemplateInput{
		Name:         "Disabled",
		Description:  "Hidden from employees.",
		RewardType:   RewardEnergy,
		RewardAmount: 5,
		DailyLimit:   1,
		Status:       StatusDisabled,
	})
	if err != nil {
		t.Fatalf("CreateTemplate disabled error = %v", err)
	}

	router := gin.New()
	RegisterRoutes(router, service, fakeAuthenticator{allow: true})
	request := httptest.NewRequest(http.MethodGet, "/api/task-templates", nil)
	request.Header.Set("Authorization", "Bearer token")
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var body response.Body
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("json.Unmarshal error = %v", err)
	}
	payload, ok := body.Data.(map[string]any)
	if !ok {
		t.Fatalf("body.Data = %#v, want object", body.Data)
	}
	templates, ok := payload["task_templates"].([]any)
	if !ok {
		t.Fatalf("task_templates = %#v, want list", payload["task_templates"])
	}
	for _, raw := range templates {
		template, ok := raw.(map[string]any)
		if !ok {
			t.Fatalf("template = %#v, want object", raw)
		}
		if template["id"] == disabled.ID {
			t.Fatalf("disabled template %q should not be returned", disabled.ID)
		}
	}
}

func TestHandler_ClaimRewardRejectsDuplicate(t *testing.T) {
	t.Parallel()

	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(context.Background(), TemplateInput{
		Name:         "Clock in",
		Description:  "Start on schedule.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	router := gin.New()
	RegisterRoutes(router, service, fakeAuthenticator{allow: true})

	first := httptest.NewRequest(http.MethodPost, "/api/tasks/"+template.ID+"/claim", nil)
	first.Header.Set("Authorization", "Bearer token")
	firstRecorder := httptest.NewRecorder()
	router.ServeHTTP(firstRecorder, first)
	if firstRecorder.Code != http.StatusCreated {
		t.Fatalf("first status = %d, want %d; body = %s", firstRecorder.Code, http.StatusCreated, firstRecorder.Body.String())
	}

	second := httptest.NewRequest(http.MethodPost, "/api/tasks/"+template.ID+"/claim", nil)
	second.Header.Set("Authorization", "Bearer token")
	secondRecorder := httptest.NewRecorder()
	router.ServeHTTP(secondRecorder, second)
	if secondRecorder.Code != http.StatusConflict {
		t.Fatalf("second status = %d, want %d; body = %s", secondRecorder.Code, http.StatusConflict, secondRecorder.Body.String())
	}
}

func TestHandler_ClaimRewardRejectsInvalidTask(t *testing.T) {
	t.Parallel()

	taskRepo := NewMemoryRepository()
	router := gin.New()
	RegisterRoutes(
		router,
		NewRewardService(taskRepo, taskRepo, wallet.NewService(wallet.NewMemoryRepository())),
		fakeAuthenticator{allow: true},
	)

	request := httptest.NewRequest(http.MethodPost, "/api/tasks/missing/claim", nil)
	request.Header.Set("Authorization", "Bearer token")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusNotFound, recorder.Body.String())
	}
}

func TestHandler_AdminCreateRejectsNonAdmin(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: true, role: "user"})
	request := jsonRequest(http.MethodPost, "/api/admin/task-templates", map[string]any{
		"name":          "Admin task",
		"description":   "Admin only.",
		"reward_type":   RewardEnergy,
		"reward_amount": 10,
		"daily_limit":   1,
		"status":        StatusActive,
	})
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusForbidden, recorder.Body.String())
	}
}

func TestHandler_AdminCreateAndDisableTemplate(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: true, role: "admin"})
	create := jsonRequest(http.MethodPost, "/api/admin/task-templates", map[string]any{
		"name":          "Admin task",
		"description":   "Admin created.",
		"reward_type":   RewardFeed,
		"reward_amount": 2,
		"daily_limit":   1,
		"status":        StatusActive,
	})
	createRecorder := httptest.NewRecorder()
	router.ServeHTTP(createRecorder, create)
	if createRecorder.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want %d; body = %s", createRecorder.Code, http.StatusCreated, createRecorder.Body.String())
	}

	var parsed struct {
		Data struct {
			Template Template `json:"task_template"`
		} `json:"data"`
	}
	if err := json.Unmarshal(createRecorder.Body.Bytes(), &parsed); err != nil {
		t.Fatalf("json.Unmarshal error = %v", err)
	}
	if parsed.Data.Template.ID == "" {
		t.Fatal("created template did not include id")
	}

	disable := jsonRequest(http.MethodPost, "/api/admin/task-templates/"+parsed.Data.Template.ID+"/disable", nil)
	disableRecorder := httptest.NewRecorder()
	router.ServeHTTP(disableRecorder, disable)
	if disableRecorder.Code != http.StatusOK {
		t.Fatalf("disable status = %d, want %d; body = %s", disableRecorder.Code, http.StatusOK, disableRecorder.Body.String())
	}
}

func TestHandler_AdminCreateRejectsExcessiveRewardRule(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: true, role: "admin"})
	request := jsonRequest(http.MethodPost, "/api/admin/task-templates", map[string]any{
		"name":          "Unsafe admin task",
		"description":   "Too much reward.",
		"reward_type":   RewardEnergy,
		"reward_amount": maxRewardAmount + 1,
		"daily_limit":   maxDailyLimit + 1,
		"status":        StatusActive,
	})
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
}

func TestHandler_ExternalTaskEventRequiresAdmin(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: true, role: "user"})
	request := jsonRequest(http.MethodPost, "/api/external/task-events", map[string]any{
		"user_id":          "usr_000001",
		"task_template_id": "task_template_clock_in",
		"source_system":    "attendance",
		"idempotency_key":  "event-000001",
	})
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusForbidden, recorder.Body.String())
	}
}

func TestHandler_ExternalTaskEventValidatesPayload(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: true, role: "admin"})
	request := jsonRequest(http.MethodPost, "/api/external/task-events", map[string]any{
		"user_id": "usr_000001",
	})
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
}

func TestHandler_ExternalTaskEventRejectsDuplicate(t *testing.T) {
	t.Parallel()

	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(context.Background(), TemplateInput{
		Name:         "External check-in",
		Description:  "Attendance event reward.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}
	router := gin.New()
	RegisterRoutes(router, service, fakeAuthenticator{allow: true, role: "admin"})

	payload := map[string]any{
		"user_id":          "usr_000001",
		"task_template_id": template.ID,
		"source_system":    "attendance",
		"idempotency_key":  "event-000001",
	}
	first := jsonRequest(http.MethodPost, "/api/external/task-events", payload)
	firstRecorder := httptest.NewRecorder()
	router.ServeHTTP(firstRecorder, first)
	if firstRecorder.Code != http.StatusCreated {
		t.Fatalf("first status = %d, want %d; body = %s", firstRecorder.Code, http.StatusCreated, firstRecorder.Body.String())
	}

	second := jsonRequest(http.MethodPost, "/api/external/task-events", payload)
	secondRecorder := httptest.NewRecorder()
	router.ServeHTTP(secondRecorder, second)
	if secondRecorder.Code != http.StatusConflict {
		t.Fatalf("second status = %d, want %d; body = %s", secondRecorder.Code, http.StatusConflict, secondRecorder.Body.String())
	}
}

func TestHandler_AttendanceCheckInCompletesTask(t *testing.T) {
	t.Parallel()

	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(context.Background(), TemplateInput{
		Name:         "Clock in",
		Description:  "Attendance event reward.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}
	router := gin.New()
	RegisterRoutes(router, service, fakeAuthenticator{allow: true, role: "admin"})

	request := jsonRequest(http.MethodPost, "/api/external/attendance/check-ins", map[string]any{
		"external_employee_id": "employee_001",
		"user_id":              "usr_000001",
		"task_template_id":     template.ID,
		"event_id":             "checkin_000001",
	})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}
}

func TestHandler_AttendanceCheckInRejectsMissingMapping(t *testing.T) {
	t.Parallel()

	router := testRouter(fakeAuthenticator{allow: true, role: "admin"})
	request := jsonRequest(http.MethodPost, "/api/external/attendance/check-ins", map[string]any{
		"external_employee_id": "employee_001",
		"task_template_id":     "task_template_clock_in",
		"event_id":             "checkin_000001",
	})
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d; body = %s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
}

func testRouter(auth Authenticator) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	RegisterRoutes(router, NewService(NewMemoryRepository()), auth)
	return router
}

func jsonRequest(method string, path string, body any) *http.Request {
	var payload []byte
	if body != nil {
		payload, _ = json.Marshal(body)
	}
	request := httptest.NewRequest(method, path, bytes.NewReader(payload))
	request.Header.Set("Authorization", "Bearer token")
	request.Header.Set("Content-Type", "application/json")
	return request
}
