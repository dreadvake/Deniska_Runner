package security

import (
	"github.com/dgrijalva/jwt-go"
	"time"
)

var jwtKey = []byte("secret")

func CreateToken(username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func VerifyToken(tokenString string) bool {
	toker, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) { return jwtKey, nil })
	if err != nil || !toker.Valid {
		return false
	}

	return true
}
