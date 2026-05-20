package auth

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"aoa-user-mvp/backend/internal/user"
)

var (
	ErrDuplicateEmail = errors.New("duplicate email")
	ErrUserNotFound   = errors.New("user not found")
)

type Repository interface {
	Create(email string, username string, passwordHash string) (user.User, error)
	FindByEmail(email string) (user.User, error)
	FindByID(id string) (user.User, error)
}

type MemoryRepository struct {
	mu      sync.RWMutex
	byID    map[string]user.User
	byEmail map[string]string
	nextID  int
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		byID:    map[string]user.User{},
		byEmail: map[string]string{},
		nextID:  1,
	}
}

func (r *MemoryRepository) Create(email string, username string, passwordHash string) (user.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	email = normalizeEmail(email)
	if _, ok := r.byEmail[email]; ok {
		return user.User{}, ErrDuplicateEmail
	}

	now := time.Now().UTC()
	created := user.User{
		ID:           makeID(r.nextID),
		Email:        email,
		Username:     strings.TrimSpace(username),
		PasswordHash: passwordHash,
		Role:         "user",
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	r.nextID++
	r.byID[created.ID] = created
	r.byEmail[email] = created.ID

	return created, nil
}

func (r *MemoryRepository) FindByEmail(email string) (user.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	id, ok := r.byEmail[normalizeEmail(email)]
	if !ok {
		return user.User{}, ErrUserNotFound
	}
	return r.byID[id], nil
}

func (r *MemoryRepository) FindByID(id string) (user.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	found, ok := r.byID[id]
	if !ok {
		return user.User{}, ErrUserNotFound
	}
	return found, nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func makeID(next int) string {
	return fmt.Sprintf("usr_%06d", next)
}
