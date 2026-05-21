package wallet

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

	router.GET("/api/wallet/me", handler.CurrentWallet)
}

func (h *Handler) CurrentWallet(c *gin.Context) {
	current, ok := h.authenticated(c)
	if !ok {
		return
	}

	found, details, err := h.service.Wallet(c.Request.Context(), current.ID)
	switch {
	case errors.Is(err, ErrWalletNotFound):
		response.OK(c, gin.H{"wallet": Wallet{UserID: current.ID}})
	case errors.Is(err, ErrInvalidChange):
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid wallet request", details)
	case err != nil:
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Could not load wallet", nil)
	default:
		response.OK(c, gin.H{"wallet": found})
	}
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
