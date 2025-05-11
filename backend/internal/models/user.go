package models

import "time"

type User struct {
	Name      string     `json:"name"`
	ID        string     `json:"id"`
	Email     string     `json:"email"`
	Password  string     `json:"password"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

type UserLoginRequest struct {
	Name     string `json:"username"`
	Password string `json:"password"`
}
