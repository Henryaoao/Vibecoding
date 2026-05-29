package service

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"projectm/backend/internal/model"
	"projectm/backend/internal/repository"
)

type fakeUsers struct {
	byID        map[string]model.CurrentUser
	byEmail     map[string]model.CurrentUser
	byTeamsID   map[string]model.CurrentUser
	createdRole string
}

func newFakeUsers() *fakeUsers {
	return &fakeUsers{
		byID:      map[string]model.CurrentUser{},
		byEmail:   map[string]model.CurrentUser{},
		byTeamsID: map[string]model.CurrentUser{},
	}
}

func (f *fakeUsers) FindByEmail(_ context.Context, email string) (model.CurrentUser, error) {
	user, ok := f.byEmail[email]
	if !ok {
		return model.CurrentUser{}, repository.ErrUserNotFound
	}
	return user, nil
}

func (f *fakeUsers) FindByID(_ context.Context, userID string) (model.CurrentUser, error) {
	user, ok := f.byID[userID]
	if !ok {
		return model.CurrentUser{}, repository.ErrUserNotFound
	}
	return user, nil
}

func (f *fakeUsers) FindOrCreateByTeamsIdentity(_ context.Context, identity model.TeamsUserIdentity) (model.CurrentUser, error) {
	if user, ok := f.byTeamsID[identity.UserID]; ok {
		return user, nil
	}
	user := model.CurrentUser{
		UserID:        "USR_TEAMS",
		Email:         identity.Email,
		DisplayName:   identity.DisplayName,
		RoleCode:      "user",
		AccountStatus: "active",
	}
	f.createdRole = user.RoleCode
	f.byTeamsID[identity.UserID] = user
	return user, nil
}

func TestTeamsAuthorizationURLRequiresConfig(t *testing.T) {
	authService := NewAuthService(newFakeUsers(), TeamsOAuthConfig{})

	if _, err := authService.TeamsAuthorizationURL("state"); !errors.Is(err, ErrTeamsOAuthUnavailable) {
		t.Fatalf("expected ErrTeamsOAuthUnavailable, got %v", err)
	}
}

func TestTeamsAuthorizationURLBuildsRedirect(t *testing.T) {
	authService := NewAuthService(newFakeUsers(), TeamsOAuthConfig{
		ClientID:     "client-id",
		ClientSecret: "client-secret",
		RedirectURI:  "https://projectm.example.com/api/v1/auth/teams/callback",
		AuthURL:      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
		TokenURL:     "https://login.microsoftonline.com/common/oauth2/v2.0/token",
		UserInfoURL:  "https://graph.microsoft.com/oidc/userinfo",
		Scopes:       "openid profile email",
	})

	rawURL, err := authService.TeamsAuthorizationURL("state-123")
	if err != nil {
		t.Fatalf("authorization URL: %v", err)
	}
	parsed, err := url.Parse(rawURL)
	if err != nil {
		t.Fatalf("parse URL: %v", err)
	}
	if got := parsed.Query().Get("client_id"); got != "client-id" {
		t.Fatalf("client_id = %q", got)
	}
	if got := parsed.Query().Get("redirect_uri"); got != "https://projectm.example.com/api/v1/auth/teams/callback" {
		t.Fatalf("redirect_uri = %q", got)
	}
	if got := parsed.Query().Get("response_type"); got != "code" {
		t.Fatalf("response_type = %q", got)
	}
	if got := parsed.Query().Get("scope"); got != "openid profile email" {
		t.Fatalf("scope = %q", got)
	}
	if got := parsed.Query().Get("state"); got != "state-123" {
		t.Fatalf("state = %q", got)
	}
	if got := parsed.Query().Get("prompt"); got != "login" {
		t.Fatalf("prompt = %q", got)
	}
}

func TestLoginWithTeamsCodeCreatesRegularUser(t *testing.T) {
	var sawSecret bool
	teamsServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/token":
			if err := r.ParseForm(); err != nil {
				t.Fatalf("parse token request: %v", err)
			}
			sawSecret = r.PostForm.Get("client_secret") == "client-secret"
			_ = json.NewEncoder(w).Encode(map[string]any{
				"access_token": "user-access-token",
			})
		case "/userinfo":
			if got := r.Header.Get("Authorization"); got != "Bearer user-access-token" {
				t.Fatalf("Authorization = %q", got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":   "teams-user-123",
				"tid":   "tenant-123",
				"email": "teams.user@example.com",
				"name":  "Teams User",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer teamsServer.Close()

	users := newFakeUsers()
	authService := NewAuthService(users, TeamsOAuthConfig{
		ClientID:     "client-id",
		ClientSecret: "client-secret",
		RedirectURI:  "https://projectm.example.com/api/v1/auth/teams/callback",
		AuthURL:      teamsServer.URL + "/authorize",
		TokenURL:     teamsServer.URL + "/token",
		UserInfoURL:  teamsServer.URL + "/userinfo",
		Scopes:       "openid profile email",
	})

	user, err := authService.LoginWithTeamsCode(context.Background(), "auth-code")
	if err != nil {
		t.Fatalf("LoginWithTeamsCode: %v", err)
	}
	if !sawSecret {
		t.Fatal("token exchange did not send app secret")
	}
	if user.RoleCode != "user" || users.createdRole != "user" {
		t.Fatalf("expected regular user role, got user=%q created=%q", user.RoleCode, users.createdRole)
	}
	if user.Email != "teams.user@example.com" {
		t.Fatalf("email = %q", user.Email)
	}
}
