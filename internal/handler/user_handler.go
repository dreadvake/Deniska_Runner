package handler

import (
	"context"
	"deniska_runner/internal/models"
	"deniska_runner/internal/responder"
	"deniska_runner/internal/security"
	"deniska_runner/internal/service"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"net/http"
)

type UserHandler struct {
	service service.UserServicer
}

func NewUserHandler(service service.UserServicer) *UserHandler {
	return &UserHandler{service: service}
}

func (uc *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		responder.ErrorResponse(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if err := uc.service.CreateUser(context.Background(), &user); err != nil {
		responder.ErrorResponse(w, http.StatusConflict, err.Error())
		return
	}
	responder.SuccessResponse(w, http.StatusOK, user)
}

func (uc *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		responder.ErrorResponse(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	user.Name = username
	if err := uc.service.UpdateUser(context.Background(), &user); err != nil {
		responder.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	responder.SuccessResponse(w, http.StatusOK, user)
}

func (uc *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	if err := uc.service.DeleteUser(context.Background(), username); err != nil {
		responder.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	responder.SuccessResponse(w, http.StatusOK, map[string]string{"message": "User deleted"})
}

func (uc *UserHandler) LoginUser(w http.ResponseWriter, r *http.Request) {
	var userRequest models.UserLoginRequest

	if err := json.NewDecoder(r.Body).Decode(&userRequest); err != nil {
		responder.ErrorResponse(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	user, err := uc.service.LoginUser(context.Background(), userRequest.Name, userRequest.Password)

	if err != nil {
		responder.ErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	tokenstring, err := security.CreateToken(user.Name)

	if err != nil {
		responder.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	responder.SuccessResponse(w, http.StatusOK, map[string]string{"token": tokenstring})
}

func (uc *UserHandler) LogoutUser(w http.ResponseWriter, r *http.Request) {
	responder.SuccessResponse(w, http.StatusOK, map[string]string{"message": "User logged out"})
}
