package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"projectm/backend/internal/auth"
	"projectm/backend/internal/config"
	"projectm/backend/internal/controller"
	"projectm/backend/internal/middleware"
	"projectm/backend/internal/repository"
	"projectm/backend/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()
	cfg := config.Load()

	poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("parse DATABASE_URL: %v", err)
	}
	poolConfig.MaxConns = 8
	poolConfig.MinConns = 1
	poolConfig.MaxConnLifetime = 30 * time.Minute
	poolConfig.HealthCheckPeriod = time.Minute

	db, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		log.Fatalf("ping database: %v", err)
	}

	contentRepository := repository.NewContentRepository(db)
	userRepository := repository.NewUserRepository(db)
	portalService := service.NewPortalService(contentRepository)
	authService := service.NewAuthService(userRepository, service.TeamsOAuthConfig(cfg.TeamsOAuth))
	sessionManager := auth.NewSessionManager(cfg.SessionSecret, 24*time.Hour)
	authenticator := middleware.NewAuthenticator(sessionManager)
	portalController := controller.NewPortalController(portalService, authService, authenticator, sessionManager, cfg.FrontendURL)

	mux := http.NewServeMux()
	portalController.RegisterRoutes(mux)

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           middleware.CommonHeaders(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("ProjectM API listening on http://localhost:%s", cfg.Port)
	log.Fatal(server.ListenAndServe())
}
