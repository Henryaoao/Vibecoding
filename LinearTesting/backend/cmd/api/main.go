package main

import (
	"log"
	"os"

	"aoa-user-mvp/backend/internal/auth"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	auth.RegisterRoutes(router, auth.NewService(auth.NewMemoryRepository(), auth.TokenConfig{
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

func tokenSecret() string {
	secret := os.Getenv("AUTH_TOKEN_SECRET")
	if secret == "" {
		return "development-only-secret-change-me"
	}
	return secret
}

