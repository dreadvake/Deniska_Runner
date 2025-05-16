package models

type Score struct {
	Game     string `json:"game"`
	Distance int    `json:"distance"`
	Money    int    `json:"money"`
	UserName string `json:"user_name"`
}
