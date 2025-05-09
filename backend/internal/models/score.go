package models

type Score struct {
	Game     string `json:"game"`
	Points   Points `json:"points"`
	UserName string `json:"user_name"`
}

type Points struct {
	Distance int `json:"distance"`
	Money    int `json:"money"`
}
