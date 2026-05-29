package response

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type APIResponse struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"requestId"`
	Data      any    `json:"data,omitempty"`
}

func Success(w http.ResponseWriter, r *http.Request, data any) {
	writeJSON(w, http.StatusOK, APIResponse{
		Code:      "OK",
		Message:   "ok",
		RequestID: RequestID(r),
		Data:      data,
	})
}

func Error(w http.ResponseWriter, r *http.Request, status int, code string, message string) {
	writeJSON(w, status, APIResponse{
		Code:      code,
		Message:   message,
		RequestID: RequestID(r),
	})
}

func RequestID(r *http.Request) string {
	if value := r.Header.Get("X-Request-ID"); value != "" {
		return value
	}
	return fmt.Sprintf("req-%d", time.Now().UnixNano())
}

func writeJSON(w http.ResponseWriter, status int, data APIResponse) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("write json: %v", err)
	}
}
