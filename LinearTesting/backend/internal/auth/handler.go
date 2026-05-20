package auth

import (
	"errors"
	"net/http"
	"strings"

	"aoa-user-mvp/backend/internal/response"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func RegisterRoutes(router *gin.Engine, service *Service) {
	handler := &Handler{service: service}

	router.GET("/api/health", func(c *gin.Context) {
		response.OK(c, gin.H{"status": "ok"})
	})

	api := router.Group("/api")
	api.POST("/users", handler.CreateUser)
	api.GET("/users/me", handler.CurrentUser)
	api.POST("/sessions", handler.CreateSession)
	api.DELETE("/sessions/current", handler.DeleteSession)

	group := router.Group("/api/auth")
	group.POST("/register", handler.CreateUser)
	group.POST("/login", handler.CreateSession)
	group.GET("/me", handler.CurrentUser)
	group.POST("/logout", handler.DeleteSession)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req RegisterRequest
	if !bindJSON(c, &req) {
		return
	}

	result, details, err := h.service.Register(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrDuplicateEmail):
		response.Error(c, http.StatusConflict, "VALIDATION_ERROR", "Email already exists", details)
	case errors.Is(err, ErrValidation):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid registration details", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not register user", nil)
	default:
		response.Created(c, result)
	}
}

func (h *Handler) CreateSession(c *gin.Context) {
	var req LoginRequest
	if !bindJSON(c, &req) {
		return
	}

	result, details, err := h.service.Login(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrValidation):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid login details", details)
	case errors.Is(err, ErrInvalidCredential):
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Invalid email or password", nil)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not log in", nil)
	default:
		response.OK(c, result)
	}
}

func (h *Handler) CurrentUser(c *gin.Context) {
	current, err := h.service.CurrentUser(c.Request.Context(), bearerToken(c))
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	response.OK(c, gin.H{"user": current})
}

func (h *Handler) DeleteSession(c *gin.Context) {
	if err := h.service.Logout(c.Request.Context(), bearerToken(c)); err != nil {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	response.OK(c, gin.H{"logged_out": true})
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

func bearerToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
}
