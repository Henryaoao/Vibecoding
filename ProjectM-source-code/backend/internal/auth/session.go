package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const CookieName = "projectm_session"

var ErrInvalidSession = errors.New("invalid session")

type SessionManager struct {
	secret []byte
	ttl    time.Duration
}

func NewSessionManager(secret string, ttl time.Duration) *SessionManager {
	return &SessionManager{secret: []byte(secret), ttl: ttl}
}

func (m *SessionManager) CookieName() string {
	return CookieName
}

func (m *SessionManager) TTL() time.Duration {
	return m.ttl
}

func (m *SessionManager) Sign(userID string, now time.Time) string {
	expiresAt := now.Add(m.ttl).Unix()
	payload := fmt.Sprintf("%s.%d", userID, expiresAt)
	signature := m.signature(payload)
	return base64.RawURLEncoding.EncodeToString([]byte(payload + "." + signature))
}

func (m *SessionManager) Verify(value string, now time.Time) (string, error) {
	decoded, err := base64.RawURLEncoding.DecodeString(strings.TrimSpace(value))
	if err != nil {
		return "", ErrInvalidSession
	}

	payload, signature, ok := strings.Cut(string(decoded), ".")
	if !ok {
		return "", ErrInvalidSession
	}
	expiresAtText := signature
	signatureStart := strings.LastIndex(string(decoded), ".")
	if signatureStart < 0 {
		return "", ErrInvalidSession
	}
	raw := string(decoded)
	payload = raw[:signatureStart]
	signature = raw[signatureStart+1:]

	userID, expiresAtText, ok := strings.Cut(payload, ".")
	if !ok || strings.TrimSpace(userID) == "" {
		return "", ErrInvalidSession
	}
	expiresAt, err := strconv.ParseInt(expiresAtText, 10, 64)
	if err != nil || now.Unix() > expiresAt {
		return "", ErrInvalidSession
	}
	if !hmac.Equal([]byte(signature), []byte(m.signature(payload))) {
		return "", ErrInvalidSession
	}
	return userID, nil
}

func (m *SessionManager) signature(payload string) string {
	mac := hmac.New(sha256.New, m.secret)
	_, _ = mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
