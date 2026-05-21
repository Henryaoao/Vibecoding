package task

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"aoa-user-mvp/backend/internal/response"
	"aoa-user-mvp/backend/internal/user"

	"github.com/gin-gonic/gin"
)

type Authenticator interface {
	CurrentUser(ctx context.Context, token string) (user.User, error)
}

type Handler struct {
	service *Service
	auth    Authenticator
}

func RegisterRoutes(router *gin.Engine, service *Service, auth Authenticator) {
	handler := &Handler{service: service, auth: auth}

	router.GET("/api/task-templates", handler.ListActiveTemplates)
	router.POST("/api/tasks/:taskId/claim", handler.ClaimReward)
	router.POST("/api/external/task-events", handler.ExternalTaskEvent)
	router.POST("/api/external/attendance/check-ins", handler.AttendanceCheckIn)

	admin := router.Group("/api/admin/task-templates")
	admin.GET("", handler.AdminListTemplates)
	admin.POST("", handler.AdminCreateTemplate)
	admin.PUT("/:taskId", handler.AdminUpdateTemplate)
	admin.POST("/:taskId/disable", handler.AdminDisableTemplate)
}

func (h *Handler) ListActiveTemplates(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	templates, err := h.service.ListActiveTemplates(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load task templates", nil)
		return
	}

	response.OK(c, gin.H{"task_templates": templates})
}

func (h *Handler) ClaimReward(c *gin.Context) {
	current, ok := h.authenticated(c)
	if !ok {
		return
	}

	result, details, err := h.service.ClaimReward(
		c.Request.Context(),
		current.ID,
		c.Param("taskId"),
		c.GetHeader("Idempotency-Key"),
	)
	switch {
	case errors.Is(err, ErrTemplateNotFound):
		response.Error(c, http.StatusNotFound, "TASK_NOT_FOUND", "Task template not found", details)
	case errors.Is(err, ErrDailyClaimLimit):
		response.Error(c, http.StatusConflict, "DUPLICATE_TASK_CLAIM", "Task reward already claimed today", details)
	case errors.Is(err, ErrInvalidTemplate):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid task reward claim", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not claim task reward", nil)
	default:
		response.Created(c, result)
	}
}

func (h *Handler) ExternalTaskEvent(c *gin.Context) {
	if _, ok := h.adminUser(c); !ok {
		return
	}

	var req ExternalTaskEventInput
	if !bindJSON(c, &req) {
		return
	}

	result, details, err := h.service.ClaimExternalTaskEvent(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrTemplateNotFound):
		response.Error(c, http.StatusNotFound, "TASK_NOT_FOUND", "Task template not found", details)
	case errors.Is(err, ErrDailyClaimLimit):
		response.Error(c, http.StatusConflict, "DUPLICATE_EXTERNAL_EVENT", "External task event already processed", details)
	case errors.Is(err, ErrInvalidTemplate):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid external task event", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not process external task event", nil)
	default:
		response.Created(c, gin.H{"external_task_event": result})
	}
}

func (h *Handler) AttendanceCheckIn(c *gin.Context) {
	if _, ok := h.adminUser(c); !ok {
		return
	}

	var req AttendanceCheckInInput
	if !bindJSON(c, &req) {
		return
	}

	result, details, err := h.service.ProcessAttendanceCheckIn(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrTemplateNotFound):
		response.Error(c, http.StatusNotFound, "TASK_NOT_FOUND", "Task template not found", details)
	case errors.Is(err, ErrDailyClaimLimit):
		response.Error(c, http.StatusConflict, "DUPLICATE_ATTENDANCE_EVENT", "Attendance check-in already processed", details)
	case errors.Is(err, ErrInvalidTemplate):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid attendance check-in", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not process attendance check-in", nil)
	default:
		response.Created(c, gin.H{"attendance_check_in": result})
	}
}

func (h *Handler) AdminListTemplates(c *gin.Context) {
	if _, ok := h.adminUser(c); !ok {
		return
	}

	templates, err := h.service.ListTemplates(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load task templates", nil)
		return
	}

	response.OK(c, gin.H{"task_templates": templates})
}

func (h *Handler) AdminCreateTemplate(c *gin.Context) {
	current, ok := h.adminUser(c)
	if !ok {
		return
	}

	var req TemplateInput
	if !bindJSON(c, &req) {
		return
	}

	created, details, err := h.service.AdminCreateTemplate(c.Request.Context(), current.ID, req)
	switch {
	case errors.Is(err, ErrInvalidTemplate):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid task template", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not create task template", nil)
	default:
		response.Created(c, gin.H{"task_template": created})
	}
}

func (h *Handler) AdminUpdateTemplate(c *gin.Context) {
	current, ok := h.adminUser(c)
	if !ok {
		return
	}

	var req TemplateInput
	if !bindJSON(c, &req) {
		return
	}

	changed, details, err := h.service.AdminUpdateTemplate(
		c.Request.Context(),
		current.ID,
		c.Param("taskId"),
		req,
	)
	switch {
	case errors.Is(err, ErrTemplateNotFound):
		response.Error(c, http.StatusNotFound, "TASK_NOT_FOUND", "Task template not found", nil)
	case errors.Is(err, ErrInvalidTemplate):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid task template", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not update task template", nil)
	default:
		response.OK(c, gin.H{"task_template": changed})
	}
}

func (h *Handler) AdminDisableTemplate(c *gin.Context) {
	current, ok := h.adminUser(c)
	if !ok {
		return
	}

	disabled, details, err := h.service.AdminDisableTemplate(
		c.Request.Context(),
		current.ID,
		c.Param("taskId"),
	)
	switch {
	case errors.Is(err, ErrTemplateNotFound):
		response.Error(c, http.StatusNotFound, "TASK_NOT_FOUND", "Task template not found", nil)
	case errors.Is(err, ErrInvalidTemplate):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid task template", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not disable task template", nil)
	default:
		response.OK(c, gin.H{"task_template": disabled})
	}
}

func bindJSON(c *gin.Context, req any) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"VALIDATION_ERROR",
			"Invalid request",
			[]string{"request body must be valid JSON"},
		)
		return false
	}
	return true
}

func (h *Handler) adminUser(c *gin.Context) (user.User, bool) {
	current, ok := h.authenticated(c)
	if !ok {
		return user.User{}, false
	}
	if current.Role != "admin" {
		response.Error(c, http.StatusForbidden, "PERMISSION_DENIED", "Admin access required", nil)
		return user.User{}, false
	}
	return current, true
}

func (h *Handler) authenticated(c *gin.Context) (user.User, bool) {
	current, err := h.auth.CurrentUser(c.Request.Context(), bearerToken(c))
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return user.User{}, false
	}
	return current, true
}

func bearerToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
}
