package router

import (
	"deniska_runner/internal/handler"
	"deniska_runner/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func SetupRouter(
	userHandler *handler.UserHandler,
	gameHandler *handler.GameHandler,
	wsHandler *handler.WebSocketHandler,
) *chi.Mux {
	r := chi.NewRouter()

	r.Route("/api", func(r chi.Router) {

		r.Use(middleware.CorsMiddleware)

		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)
			r.Get("/leaderboard", gameHandler.GetLeaderboard)
			r.Post("/score", gameHandler.SaveScore)
			r.Get("/ws/game", wsHandler.HandleGameWebSocket)
		})

		r.Post("/register", userHandler.CreateUser)
		r.Post("/login", userHandler.LoginUser)
		r.Post("/logout", userHandler.LogoutUser)
	})

	return r
}
