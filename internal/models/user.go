package models

type User struct {
	Name         string `json:"name"`
	ID           string `json:"id"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	HashPassword string `json:"hasgPassword"`
}

type UserLoginRequest struct {
	Name     string `json:"username"`
	Password string `json:"password"`
}
