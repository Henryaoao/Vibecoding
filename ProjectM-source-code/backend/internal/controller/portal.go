package controller

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"projectm/backend/internal/auth"
	"projectm/backend/internal/middleware"
	"projectm/backend/internal/model"
	"projectm/backend/internal/response"
	"projectm/backend/internal/service"
)

type PortalService interface {
	LoadHome(ctx context.Context) (model.HomeResponse, error)
	LoadContent(ctx context.Context, section string, limit int) (model.ContentResponse, error)
}

type AuthService interface {
	CurrentUser(ctx context.Context, userID string) (model.CurrentUser, error)
	NewTeamsState() (string, error)
	TeamsAuthorizationURL(state string) (string, error)
	LoginWithTeamsCode(ctx context.Context, code string) (model.CurrentUser, error)
}

type PortalController struct {
	portalService PortalService
	authService   AuthService
	authenticator *middleware.Authenticator
	sessions      *auth.SessionManager
	frontendURL   string
}

func NewPortalController(portalService PortalService, authService AuthService, authenticator *middleware.Authenticator, sessions *auth.SessionManager, frontendURL string) *PortalController {
	return &PortalController{
		portalService: portalService,
		authService:   authService,
		authenticator: authenticator,
		sessions:      sessions,
		frontendURL:   frontendURL,
	}
}

func (c *PortalController) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /", c.handleRoot)
	mux.HandleFunc("GET /healthz", c.handleHealth)
	mux.HandleFunc("GET /api/v1/auth/teams/start", c.handleTeamsStart)
	mux.HandleFunc("GET /api/v1/auth/teams/callback", c.handleTeamsCallback)
	mux.HandleFunc("GET /api/v1/auth/me", c.authenticator.RequireUser(c.handleMe))
	mux.HandleFunc("POST /api/v1/auth/logout", c.handleLogout)
	mux.HandleFunc("GET /api/v1/home", c.authenticator.RequireUser(c.handleHome))
	mux.HandleFunc("GET /api/v1/content", c.authenticator.RequireUser(c.handleContent))
}

func (c *PortalController) handleRoot(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, c.frontendURL, http.StatusTemporaryRedirect)
}

func (c *PortalController) handleHealth(w http.ResponseWriter, r *http.Request) {
	response.Success(w, r, map[string]string{"status": "ok"})
}

func (c *PortalController) handleTeamsStart(w http.ResponseWriter, r *http.Request) {
	state, err := c.authService.NewTeamsState()
	if err != nil {
		log.Printf("teams start state request_id=%s: %v", response.RequestID(r), err)
		response.Error(w, r, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
		return
	}
	authURL, err := c.authService.TeamsAuthorizationURL(state)
	if errors.Is(err, service.ErrTeamsOAuthUnavailable) {
		response.Error(w, r, http.StatusServiceUnavailable, "TEAMS_AUTH_UNAVAILABLE", "teams authentication is not configured")
		return
	}
	if err != nil {
		log.Printf("teams start request_id=%s: %v", response.RequestID(r), err)
		response.Error(w, r, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
		return
	}

	http.SetCookie(w, c.teamsStateCookie(state, 10*time.Minute))
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func (c *PortalController) handleTeamsCallback(w http.ResponseWriter, r *http.Request) {
	expectedState, err := r.Cookie("projectm_teams_oauth_state")
	if err != nil || expectedState.Value == "" || r.URL.Query().Get("state") != expectedState.Value {
		response.Error(w, r, http.StatusBadRequest, "INVALID_OAUTH_STATE", "invalid teams authentication state")
		return
	}
	if oauthError := r.URL.Query().Get("error"); oauthError != "" {
		response.Error(w, r, http.StatusUnauthorized, "TEAMS_AUTH_FAILED", "teams authentication failed")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	user, err := c.authService.LoginWithTeamsCode(ctx, r.URL.Query().Get("code"))
	if errors.Is(err, service.ErrTeamsOAuthUnavailable) {
		response.Error(w, r, http.StatusServiceUnavailable, "TEAMS_AUTH_UNAVAILABLE", "teams authentication is not configured")
		return
	}
	if errors.Is(err, service.ErrTeamsOAuthFailed) || errors.Is(err, service.ErrInvalidCredentials) {
		response.Error(w, r, http.StatusUnauthorized, "TEAMS_AUTH_FAILED", "teams authentication failed")
		return
	}
	if err != nil {
		log.Printf("teams callback request_id=%s: %v", response.RequestID(r), err)
		response.Error(w, r, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
		return
	}

	http.SetCookie(w, c.teamsStateCookie("", -time.Hour))
	http.SetCookie(w, c.sessionCookie(c.sessions.Sign(user.UserID, time.Now()), c.sessions.TTL()))
	http.Redirect(w, r, c.frontendURL, http.StatusTemporaryRedirect)
}

func (c *PortalController) handleMe(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	user, err := c.authService.CurrentUser(ctx, middleware.UserID(r))
	if errors.Is(err, service.ErrInvalidCredentials) {
		response.Error(w, r, http.StatusUnauthorized, "UNAUTHENTICATED", "authentication required")
		return
	}
	if err != nil {
		log.Printf("me request_id=%s: %v", response.RequestID(r), err)
		response.Error(w, r, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
		return
	}
	response.Success(w, r, map[string]any{"user": user})
}

func (c *PortalController) handleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, c.sessionCookie("", -time.Hour))
	response.Success(w, r, map[string]string{"status": "logged_out"})
}

func (c *PortalController) sessionCookie(value string, maxAge time.Duration) *http.Cookie {
	return &http.Cookie{
		Name:     c.sessions.CookieName(),
		Value:    value,
		Path:     "/",
		MaxAge:   int(maxAge.Seconds()),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
}

func (c *PortalController) teamsStateCookie(value string, maxAge time.Duration) *http.Cookie {
	return &http.Cookie{
		Name:     "projectm_teams_oauth_state",
		Value:    value,
		Path:     "/api/v1/auth/teams",
		MaxAge:   int(maxAge.Seconds()),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
}

func (c *PortalController) handleHome(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	home, err := c.portalService.LoadHome(ctx)
	if err != nil {
		log.Printf("load home request_id=%s: %v", response.RequestID(r), err)
		response.Error(w, r, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
		return
	}
	response.Success(w, r, home)
}

func (c *PortalController) handleContent(w http.ResponseWriter, r *http.Request) {
	section := r.URL.Query().Get("section")
	if section == "" {
		section = "announcements"
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	content, err := c.portalService.LoadContent(ctx, section, 30)
	if errors.Is(err, service.ErrUnknownSection) {
		response.Error(w, r, http.StatusBadRequest, "BAD_REQUEST", "unknown section")
		return
	}
	if err != nil {
		log.Printf("load content request_id=%s section=%s: %v", response.RequestID(r), section, err)
		response.Error(w, r, http.StatusInternalServerError, "INTERNAL_ERROR", "internal server error")
		return
	}
	response.Success(w, r, content)
}
