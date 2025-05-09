package handler

import (
	"deniska_runner/internal/models"
	"deniska_runner/internal/service"
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

type WebSocketHandler struct {
	service service.GameServicer
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // В продакшене нужно настроить более строгую проверку
	},
}

func NewWebSocketHandler(service service.GameServicer) *WebSocketHandler {
	return &WebSocketHandler{service: service}
}

func (h *WebSocketHandler) HandleGameWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}

		var score models.Score
		if err := json.Unmarshal(p, &score); err != nil {
			log.Printf("Error unmarshaling score: %v", err)
			if err := conn.WriteMessage(messageType, []byte("Invalid score format")); err != nil {
				log.Printf("error sending error message: %v", err)
			}
			continue
		}

		if err := h.service.SaveScore(r.Context(), &score); err != nil {
			log.Printf("Error saving score: %v", err)
			if err := conn.WriteMessage(messageType, []byte("Failed to save score")); err != nil {
				log.Printf("error sending error message: %v", err)
			}
			continue
		}

		response := map[string]string{"status": "success", "message": "Score saved successfully"}
		responseJSON, err := json.Marshal(response)
		if err != nil {
			log.Printf("Error marshaling response: %v", err)
			continue
		}

		if err := conn.WriteMessage(messageType, responseJSON); err != nil {
			log.Printf("Error sending success message: %v", err)
		}
	}
}
