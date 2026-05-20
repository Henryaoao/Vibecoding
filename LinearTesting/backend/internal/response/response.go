package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorBody struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Details []string `json:"details"`
}

type Body struct {
	Success   bool       `json:"success"`
	Data      any        `json:"data,omitempty"`
	Error     *ErrorBody `json:"error,omitempty"`
	RequestID string     `json:"request_id"`
}

func OK(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Body{
		Success:   true,
		Data:      data,
		RequestID: requestID(c),
	})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Body{
		Success:   true,
		Data:      data,
		RequestID: requestID(c),
	})
}

func Error(c *gin.Context, status int, code string, message string, details []string) {
	if details == nil {
		details = []string{}
	}

	c.JSON(status, Body{
		Success: false,
		Error: &ErrorBody{
			Code:    code,
			Message: message,
			Details: details,
		},
		RequestID: requestID(c),
	})
}

func requestID(c *gin.Context) string {
	requestID := c.GetHeader("X-Request-ID")
	if requestID == "" {
		return "req_local"
	}
	return requestID
}

