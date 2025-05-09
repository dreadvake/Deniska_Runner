package handler

import (
	"deniska_runner/internal/models"
	"deniska_runner/internal/responder"
	"deniska_runner/internal/service"
	"encoding/json"
	"net/http"
)

type GameHandler struct {
	service service.GameServicer
}

func NewGameHandler(service service.GameServicer) *GameHandler {
	return &GameHandler{service: service}
}

func (h *GameHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	game := r.URL.Query().Get("game")
	if game == "" {
		responder.ErrorResponse(w, http.StatusBadRequest, "game parameter is required")
		return
	}

	leaderboard, err := h.service.GetLeaderboard(r.Context(), game)
	if err != nil {
		responder.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	responder.SuccessResponse(w, http.StatusOK, leaderboard)
}

func (h *GameHandler) SaveScore(w http.ResponseWriter, r *http.Request) {
	var score models.Score
	if err := json.NewDecoder(r.Body).Decode(&score); err != nil {
		responder.ErrorResponse(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.service.SaveScore(r.Context(), &score); err != nil {
		responder.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	responder.SuccessResponse(w, http.StatusOK, map[string]string{
		"status":  "success",
		"message": "Score saved successfully",
	})
}
