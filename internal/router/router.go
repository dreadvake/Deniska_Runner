package router

import (
	"deniska_runner/internal/handler"
	"deniska_runner/internal/middleware"

	"github.com/go-chi/chi/v5"
)

func SetupRouter(userHandler *handler.UserHandler) *chi.Mux {
	r := chi.NewRouter()

	r.Route("/hui", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)
			r.Get("/Leaderboard")
		})

		r.Post("/user", userHandler.CreateUser)
		r.Post("/user/createWithList", userHandler.CreateUser)
		r.Post("/user/login", userHandler.LoginUser)
		r.Post("/user/logout", userHandler.LogoutUser)
	})

	return r
}
