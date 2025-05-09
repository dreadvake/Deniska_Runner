package main

import (
	"deniska_runner/internal/config"
	"deniska_runner/internal/db"
	"deniska_runner/internal/handler"
	"deniska_runner/internal/repository"
	"deniska_runner/internal/router"
	"deniska_runner/internal/service"
	"fmt"
	"log"
	"net/http"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	dbConn, err := db.InitDB(cfg.DB)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbConn.Close()

	userRepo := repository.NewUserRepositoryDB(dbConn)
	gameRepo := repository.NewGameRepositoryDB(dbConn)

	userService := service.NewUserService(userRepo)
	gameService := service.NewGameService(gameRepo)

	userHandler := handler.NewUserHandler(userService)
	gameHandler := handler.NewGameHandler(gameService)
	wsHandler := handler.NewWebSocketHandler(gameService)

	r := router.SetupRouter(userHandler, gameHandler, wsHandler)

	fmt.Println("Server running on :8080")
	http.ListenAndServe(":8080", r)

}
