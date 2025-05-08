package main

import (
	"deniska_runner/internal/handler"
	"deniska_runner/internal/repository"
	"deniska_runner/internal/router"
	"deniska_runner/internal/service"
	"log"
)

func main() {

	cfg := config.LoadConfig()

	dbConn, err := db.InitDB(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer dbConn.Close()

	useRepo := repository.NewUserRepositoryDB(dbConn)

	userService := service.NewUserService(useRepo)

	userHandler := handler.NewUserHandler(userService)

	r := router.SetupRouter(userHandler)

}
