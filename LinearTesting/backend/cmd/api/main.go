package main

import (
	"database/sql"
	"log"
	"os"
	"time"

	"aoa-user-mvp/backend/internal/auth"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	router := gin.Default()
	auth.RegisterRoutes(router, auth.NewService(authRepository(), auth.TokenConfig{
		Secret: tokenSecret(),
	}))

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func authRepository() auth.Repository {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return auth.NewMemoryRepository()
	}

	db, err := openMySQL(dsn)
	if err != nil {
		log.Fatal("could not connect to database")
	}
	return auth.NewMySQLRepository(db)
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
