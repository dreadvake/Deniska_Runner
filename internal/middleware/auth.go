package middleware

import (
	"deniska_runner/internal/responder"
	"deniska_runner/internal/security"
	"net/http"
	"strings"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			responder.ErrorResponse(w, http.StatusUnauthorized, "Missing Authorization header")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			responder.ErrorResponse(w, http.StatusUnauthorized, "Invalid Authorization header")
			return
		}

		isvalid := security.VerifyToken(parts[1])
		if !isvalid {
			responder.ErrorResponse(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		next.ServeHTTP(w, r)
	})
}
