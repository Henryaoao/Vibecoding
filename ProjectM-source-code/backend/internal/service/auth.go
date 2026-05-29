package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"projectm/backend/internal/model"
	"projectm/backend/internal/repository"
)

var (
	ErrInvalidCredentials    = errors.New("invalid credentials")
	ErrTeamsOAuthUnavailable = errors.New("teams oauth unavailable")
	ErrTeamsOAuthFailed      = errors.New("teams oauth failed")
)

type TeamsOAuthConfig struct {
	ClientID     string
	ClientSecret string
	TenantID     string
	RedirectURI  string
	AuthURL      string
	TokenURL     string
	UserInfoURL  string
	Scopes       string
}

type UserReader interface {
	FindByID(ctx context.Context, userID string) (model.CurrentUser, error)
	FindOrCreateByTeamsIdentity(ctx context.Context, identity model.TeamsUserIdentity) (model.CurrentUser, error)
}

type AuthService struct {
	users      UserReader
	teamsOAuth TeamsOAuthConfig
	httpClient *http.Client
}

func NewAuthService(users UserReader, teamsOAuth TeamsOAuthConfig) *AuthService {
	return &AuthService{
		users:      users,
		teamsOAuth: teamsOAuth,
		httpClient: &http.Client{Timeout: 5 * time.Second},
	}
}

func (s *AuthService) CurrentUser(ctx context.Context, userID string) (model.CurrentUser, error) {
	user, err := s.users.FindByID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return model.CurrentUser{}, ErrInvalidCredentials
		}
		return model.CurrentUser{}, err
	}
	if user.AccountStatus != "active" {
		return model.CurrentUser{}, ErrInvalidCredentials
	}
	return user, nil
}

func (s *AuthService) NewTeamsState() (string, error) {
	var state [32]byte
	if _, err := rand.Read(state[:]); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(state[:]), nil
}

func (s *AuthService) TeamsAuthorizationURL(state string) (string, error) {
	if !s.teamsEnabled() {
		return "", ErrTeamsOAuthUnavailable
	}
	authURL, err := url.Parse(s.teamsOAuth.AuthURL)
	if err != nil {
		return "", err
	}
	query := authURL.Query()
	query.Set("client_id", s.teamsOAuth.ClientID)
	query.Set("response_type", "code")
	query.Set("redirect_uri", s.teamsOAuth.RedirectURI)
	query.Set("response_mode", "query")
	query.Set("scope", s.teamsOAuth.Scopes)
	query.Set("state", state)
	query.Set("prompt", "login")
	authURL.RawQuery = query.Encode()
	return authURL.String(), nil
}

func (s *AuthService) LoginWithTeamsCode(ctx context.Context, code string) (model.CurrentUser, error) {
	if !s.teamsEnabled() {
		return model.CurrentUser{}, ErrTeamsOAuthUnavailable
	}
	code = strings.TrimSpace(code)
	if code == "" {
		return model.CurrentUser{}, ErrTeamsOAuthFailed
	}

	token, err := s.exchangeTeamsCode(ctx, code)
	if err != nil {
		return model.CurrentUser{}, err
	}
	identity, err := s.fetchTeamsUser(ctx, token)
	if err != nil {
		return model.CurrentUser{}, err
	}
	if identity.UserID == "" && identity.Email == "" {
		return model.CurrentUser{}, ErrTeamsOAuthFailed
	}

	user, err := s.users.FindOrCreateByTeamsIdentity(ctx, identity)
	if err != nil {
		return model.CurrentUser{}, err
	}
	if user.AccountStatus != "active" {
		return model.CurrentUser{}, ErrInvalidCredentials
	}
	return user, nil
}

func (s *AuthService) teamsEnabled() bool {
	return s.teamsOAuth.ClientID != "" &&
		s.teamsOAuth.ClientSecret != "" &&
		s.teamsOAuth.RedirectURI != "" &&
		s.teamsOAuth.AuthURL != "" &&
		s.teamsOAuth.TokenURL != "" &&
		s.teamsOAuth.UserInfoURL != "" &&
		s.teamsOAuth.Scopes != ""
}

func (s *AuthService) exchangeTeamsCode(ctx context.Context, code string) (string, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("client_id", s.teamsOAuth.ClientID)
	form.Set("client_secret", s.teamsOAuth.ClientSecret)
	form.Set("code", code)
	form.Set("redirect_uri", s.teamsOAuth.RedirectURI)
	form.Set("scope", s.teamsOAuth.Scopes)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.teamsOAuth.TokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", ErrTeamsOAuthFailed
	}

	var responseBody struct {
		AccessToken      string `json:"access_token"`
		Error            string `json:"error"`
		ErrorDescription string `json:"error_description"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
		return "", fmt.Errorf("decode teams token response: %w", err)
	}
	if responseBody.Error != "" || responseBody.AccessToken == "" {
		return "", ErrTeamsOAuthFailed
	}
	return responseBody.AccessToken, nil
}

func (s *AuthService) fetchTeamsUser(ctx context.Context, accessToken string) (model.TeamsUserIdentity, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, s.teamsOAuth.UserInfoURL, nil)
	if err != nil {
		return model.TeamsUserIdentity{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return model.TeamsUserIdentity{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return model.TeamsUserIdentity{}, ErrTeamsOAuthFailed
	}

	var responseBody struct {
		Subject           string `json:"sub"`
		ObjectID          string `json:"oid"`
		TenantID          string `json:"tid"`
		Email             string `json:"email"`
		PreferredUsername string `json:"preferred_username"`
		Name              string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&responseBody); err != nil {
		return model.TeamsUserIdentity{}, err
	}

	userID := strings.TrimSpace(responseBody.Subject)
	if userID == "" {
		userID = strings.TrimSpace(responseBody.ObjectID)
	}
	email := strings.ToLower(strings.TrimSpace(responseBody.Email))
	if email == "" {
		email = strings.ToLower(strings.TrimSpace(responseBody.PreferredUsername))
	}
	return model.TeamsUserIdentity{
		UserID:      userID,
		TenantID:    strings.TrimSpace(responseBody.TenantID),
		Email:       email,
		DisplayName: strings.TrimSpace(responseBody.Name),
	}, nil
}
