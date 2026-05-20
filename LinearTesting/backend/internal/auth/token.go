package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"strings"
	"time"
)

type TokenConfig struct {
	Secret string
}

func CreateToken(userID string, secret string) string {
	issuedAt := time.Now().UTC().Format(time.RFC3339)
	payload := base64.RawURLEncoding.EncodeToString([]byte(userID + ":" + issuedAt))
	signature := sign(payload, secret)
	return payload + "." + signature
}

func ParseToken(token string, secret string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return "", errors.New("invalid token")
	}

	if !hmac.Equal([]byte(parts[1]), []byte(sign(parts[0], secret))) {
		return "", errors.New("invalid token")
	}

	decoded, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", errors.New("invalid token")
	}

	fields := strings.SplitN(string(decoded), ":", 2)
	if len(fields) != 2 || fields[0] == "" {
		return "", errors.New("invalid token")
	}

	return fields[0], nil
}

func sign(payload string, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

