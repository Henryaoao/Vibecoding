package main

import (
	"database/sql"
	"log"
	"os"
	"time"

	"aoa-user-mvp/backend/internal/audit"
	"aoa-user-mvp/backend/internal/auth"
	"aoa-user-mvp/backend/internal/pet"
	"aoa-user-mvp/backend/internal/task"
	"aoa-user-mvp/backend/internal/wallet"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	router := gin.Default()
	authRepo, petRepo, taskRepo, claimRepo, walletRepo, auditRepo := repositories()
	authService := auth.NewService(authRepo, auth.TokenConfig{
		Secret: tokenSecret(),
	})
	auth.RegisterRoutes(router, authService)
	walletService := wallet.NewService(walletRepo)
	wallet.RegisterRoutes(router, walletService, authService)
	pet.RegisterRoutes(router, pet.NewAuditedFeedService(petRepo, walletService, auditRepo), authService)
	task.RegisterRoutes(
		router,
		task.NewAuditedRewardService(taskRepo, claimRepo, walletService, auditRepo),
		authService,
	)

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func repositories() (
	auth.Repository,
	pet.Repository,
	task.Repository,
	task.ClaimRepository,
	wallet.Repository,
	audit.Repository,
) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		taskRepo := task.NewMemoryRepository()
		return auth.NewMemoryRepository(),
			pet.NewMemoryRepository(),
			taskRepo,
			taskRepo,
			wallet.NewMemoryRepository(),
			audit.NewMemoryRepository()
	}

	db, err := openMySQL(dsn)
	if err != nil {
		log.Fatal("could not connect to database")
	}
	taskRepo := task.NewMySQLRepository(db)
	return auth.NewMySQLRepository(db),
		pet.NewMySQLRepository(db),
		taskRepo,
		taskRepo,
		wallet.NewMySQLRepository(db),
		audit.NewMySQLRepository(db)
}

func openMySQL(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	for attempt := 0; attempt < 20; attempt++ {
		if err := db.Ping(); err == nil {
			return db, nil
		}
		time.Sleep(1 * time.Second)
	}

	if err := db.Close(); err != nil {
		log.Print("could not close database connection after failed startup")
	}
	return nil, sql.ErrConnDone
}

func tokenSecret() string {
	secret := os.Getenv("AUTH_TOKEN_SECRET")
	if secret == "" {
		return "development-only-secret-change-me"
	}
	return secret
}
