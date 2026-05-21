package pet

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"aoa-user-mvp/backend/internal/response"
	"aoa-user-mvp/backend/internal/user"
	"aoa-user-mvp/backend/internal/wallet"

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

	router.GET("/api/pet", handler.CurrentPet)
	router.POST("/api/pet", handler.CreatePet)
	router.GET("/api/pet/level-progress", handler.CurrentLevelProgress)
	router.GET("/api/pet/skins", handler.Skins)
	router.GET("/api/pet/team-summary", handler.TeamContributionSummary)
	router.POST("/api/pet/feed", handler.FeedPet)
	router.GET("/api/pet/activity", handler.Activity)
	router.GET("/api/pet/events", handler.Activity)

	admin := router.Group("/api/admin/reports")
	admin.GET("/summary", handler.AdminReportSummary)
}

func (h *Handler) CurrentPet(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	found, err := h.service.CurrentPet(c.Request.Context())
	switch {
	case errors.Is(err, ErrPetNotFound):
		response.Error(c, http.StatusNotFound, "PET_NOT_FOUND", "Team pet not found", nil)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load team pet", nil)
	default:
		progress, err := h.service.CurrentLevelProgress(c.Request.Context())
		if err != nil {
			response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load pet level progress", nil)
			return
		}
		response.OK(c, gin.H{"pet": found, "level_progress": progress})
	}
}

func (h *Handler) CurrentLevelProgress(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	progress, err := h.service.CurrentLevelProgress(c.Request.Context())
	switch {
	case errors.Is(err, ErrPetNotFound):
		response.Error(c, http.StatusNotFound, "PET_NOT_FOUND", "Team pet not found", nil)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load pet level progress", nil)
	default:
		response.OK(c, gin.H{"level_progress": progress})
	}
}

func (h *Handler) Skins(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	skins, err := h.service.Skins(c.Request.Context())
	switch {
	case errors.Is(err, ErrPetNotFound):
		response.Error(c, http.StatusNotFound, "PET_NOT_FOUND", "Team pet not found", nil)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load pet skins", nil)
	default:
		response.OK(c, gin.H{"skins": skins})
	}
}

func (h *Handler) TeamContributionSummary(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	summary, err := h.service.TeamContributionSummary(c.Request.Context())
	switch {
	case errors.Is(err, ErrPetNotFound):
		response.Error(c, http.StatusNotFound, "PET_NOT_FOUND", "Team pet not found", nil)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load team summary", nil)
	default:
		response.OK(c, gin.H{"team_summary": summary})
	}
}

func (h *Handler) AdminReportSummary(c *gin.Context) {
	if _, ok := h.adminUser(c); !ok {
		return
	}

	report, err := h.service.AdminReportSummary(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load admin report", nil)
		return
	}

	response.OK(c, gin.H{"report": report})
}

func (h *Handler) CreatePet(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	var req CreatePetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"VALIDATION_ERROR",
			"Invalid request",
			[]string{"request body must be valid JSON"},
		)
		return
	}

	created, details, err := h.service.CreateDefaultPet(c.Request.Context(), req)
	switch {
	case errors.Is(err, ErrPetAlreadyExist):
		response.Error(c, http.StatusConflict, "VALIDATION_ERROR", "Team already has a pet", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not create team pet", nil)
	default:
		response.Created(c, gin.H{"pet": created})
	}
}

func (h *Handler) FeedPet(c *gin.Context) {
	current, ok := h.authenticated(c)
	if !ok {
		return
	}

	var req FeedPetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(
			c,
			http.StatusBadRequest,
			"VALIDATION_ERROR",
			"Invalid request",
			[]string{"request body must be valid JSON"},
		)
		return
	}

	result, details, err := h.service.FeedPet(c.Request.Context(), current.ID, req)
	switch {
	case errors.Is(err, wallet.ErrInsufficientBalance):
		response.Error(c, http.StatusConflict, "INSUFFICIENT_BALANCE", "Not enough feed balance", details)
	case errors.Is(err, ErrPetNotFound):
		response.Error(c, http.StatusNotFound, "PET_NOT_FOUND", "Team pet not found", nil)
	case errors.Is(err, ErrInvalidFeedRequest):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid feed request", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not feed team pet", nil)
	default:
		response.Created(c, result)
	}
}

func (h *Handler) Activity(c *gin.Context) {
	if _, ok := h.authenticated(c); !ok {
		return
	}

	events, err := h.service.Activity(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load team activity", nil)
		return
	}

	response.OK(c, gin.H{"activity": events})
}

func (h *Handler) authenticated(c *gin.Context) (user.User, bool) {
	current, err := h.auth.CurrentUser(c.Request.Context(), bearerToken(c))
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "AUTH_REQUIRED", "Authentication required", nil)
		return user.User{}, false
	}
	return current, true
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

func bearerToken(c *gin.Context) string {
	header := c.GetHeader("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
}
