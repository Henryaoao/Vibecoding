package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"strings"
)

const passwordSaltBytes = 16

func HashPassword(password string) (string, error) {
	if len(password) < 8 {
		return "", errors.New("password must be at least 8 characters")
	}

	salt := make([]byte, passwordSaltBytes)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	sum := sha256.Sum256(append(salt, []byte(password)...))
	return base64.RawStdEncoding.EncodeToString(salt) + "." + base64.RawStdEncoding.EncodeToString(sum[:]), nil
}

func CheckPassword(password string, stored string) bool {
	parts := strings.Split(stored, ".")
	if len(parts) != 2 {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[0])
	if err != nil {
		return false
	}

	expected, err := base64.RawStdEncoding.DecodeString(parts[1])
	if err != nil {
		return false
	}

	sum := sha256.Sum256(append(salt, []byte(password)...))
	if len(expected) != len(sum) {
		return false
	}

	var diff byte
	for i := range expected {
		diff |= expected[i] ^ sum[i]
	}
	return diff == 0
}

