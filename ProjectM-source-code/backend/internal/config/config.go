package config

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	DatabaseURL   string
	FrontendURL   string
	Port          string
	SessionSecret string
	TeamsOAuth    TeamsOAuthConfig
}

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

func Load() Config {
	if err := loadEnvFiles(".env", "../.env", "../../.env"); err != nil {
		log.Printf("load env files: %v", err)
	}

	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	tenantID := envDefault("TEAMS_TENANT_ID", "common")

	return Config{
		DatabaseURL:   databaseURL,
		FrontendURL:   envDefault("FRONTEND_URL", "http://localhost:3000/"),
		Port:          envDefault("PORT", "8080"),
		SessionSecret: envDefault("SESSION_SECRET", "projectm-local-dev-session-secret-change-me"),
		TeamsOAuth: TeamsOAuthConfig{
			ClientID:     strings.TrimSpace(os.Getenv("TEAMS_CLIENT_ID")),
			ClientSecret: strings.TrimSpace(os.Getenv("TEAMS_CLIENT_SECRET")),
			TenantID:     tenantID,
			RedirectURI:  strings.TrimSpace(os.Getenv("TEAMS_REDIRECT_URI")),
			AuthURL:      envDefault("TEAMS_AUTH_URL", "https://login.microsoftonline.com/"+tenantID+"/oauth2/v2.0/authorize"),
			TokenURL:     envDefault("TEAMS_TOKEN_URL", "https://login.microsoftonline.com/"+tenantID+"/oauth2/v2.0/token"),
			UserInfoURL:  envDefault("TEAMS_USERINFO_URL", "https://graph.microsoft.com/oidc/userinfo"),
			Scopes:       envDefault("TEAMS_SCOPES", "openid profile email"),
		},
	}
}

func (c TeamsOAuthConfig) Enabled() bool {
	return c.ClientID != "" && c.ClientSecret != "" && c.RedirectURI != "" && c.AuthURL != "" && c.TokenURL != "" && c.UserInfoURL != "" && c.Scopes != ""
}

func envDefault(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func loadEnvFiles(paths ...string) error {
	var errs []string
	for _, path := range paths {
		if err := loadDotEnv(path); err != nil && !os.IsNotExist(err) {
			errs = append(errs, err.Error())
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("%s", strings.Join(errs, "; "))
	}
	return nil
}

func loadDotEnv(path string) error {
	file, err := os.Open(filepath.Clean(path))
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key != "" && os.Getenv(key) == "" {
			os.Setenv(key, value)
		}
	}
	return scanner.Err()
}
