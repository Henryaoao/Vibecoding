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

	group := router.Group("/api/auth")
	group.POST("/register", handler.Register)
	group.POST("/login", handler.Login)
	group.GET("/me", handler.Me)
	group.POST("/logout", handler.Logout)
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request", []string{"request body must be valid JSON"})
		return
	}

	result, details, err := h.service.Register(req)
	if errors.Is(err, ErrDuplicateEmail) {
		response.Error(c, http.StatusConflict, "VALIDATION_ERROR", "Email already exists", details)
		return
	}
	if errors.Is(err, ErrValidation) {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid registration details", details)
		return
	}
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not register user", nil)
		return
	}

	response.Created(c, result)
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request", []string{"request body must be valid JSON"})
		return
	}

	result, details, err := h.service.Login(req)
	if errors.Is(err, ErrValidation) {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid login details", details)
		return
	}
	if errors.Is(err, ErrInvalidCredential) {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Invalid email or password", nil)
		return
	}
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not log in", nil)
		return
	}

	response.OK(c, result)
}

func (h *Handler) Me(c *gin.Context) {
	current, err := h.service.CurrentUser(bearerToken(c))
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	response.OK(c, gin.H{"user": current})
}

func (h *Handler) Logout(c *gin.Context) {
	if err := h.service.Logout(bearerToken(c)); err != nil {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return
	}

	response.OK(c, gin.H{"logged_out": true})
}

func bearerToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
}
