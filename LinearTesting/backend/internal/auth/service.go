package auth

import (
	"errors"
	"net/mail"
	"strings"
	"sync"

	"aoa-user-mvp/backend/internal/user"
)

var (
	ErrValidation         = errors.New("validation failed")
	ErrInvalidCredential  = errors.New("invalid credentials")
	ErrAuthenticationNeed = errors.New("authentication required")
)

type Service struct {
	repo    Repository
	tokens  TokenConfig
	mu      sync.RWMutex
	revoked map[string]struct{}
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResult struct {
	User  user.User `json:"user"`
	Token string    `json:"token"`
}

func NewService(repo Repository, tokens TokenConfig) *Service {
	return &Service{repo: repo, tokens: tokens, revoked: map[string]struct{}{}}
}

func (s *Service) Register(req RegisterRequest) (AuthResult, []string, error) {
	if details := validateRegister(req); len(details) > 0 {
		return AuthResult{}, details, ErrValidation
	}

	passwordHash, err := HashPassword(req.Password)
	if err != nil {
		return AuthResult{}, []string{err.Error()}, ErrValidation
	}

	created, err := s.repo.Create(req.Email, req.Username, passwordHash)
	if errors.Is(err, ErrDuplicateEmail) {
		return AuthResult{}, []string{"email already exists"}, ErrDuplicateEmail
	}
	if err != nil {
		return AuthResult{}, nil, err
	}

	return AuthResult{
		User:  created,
		Token: CreateToken(created.ID, s.tokens.Secret),
	}, nil, nil
}

func (s *Service) Login(req LoginRequest) (AuthResult, []string, error) {
	if details := validateLogin(req); len(details) > 0 {
		return AuthResult{}, details, ErrValidation
	}

	found, err := s.repo.FindByEmail(req.Email)
	if err != nil || !CheckPassword(req.Password, found.PasswordHash) {
		return AuthResult{}, nil, ErrInvalidCredential
	}

	return AuthResult{
		User:  found,
		Token: CreateToken(found.ID, s.tokens.Secret),
	}, nil, nil
}

func (s *Service) CurrentUser(token string) (user.User, error) {
	if s.isRevoked(token) {
		return user.User{}, ErrAuthenticationNeed
	}

	userID, err := ParseToken(token, s.tokens.Secret)
	if err != nil {
		return user.User{}, ErrAuthenticationNeed
	}

	found, err := s.repo.FindByID(userID)
	if err != nil {
		return user.User{}, ErrAuthenticationNeed
	}

	return found, nil
}

func (s *Service) Logout(token string) error {
	if _, err := s.CurrentUser(token); err != nil {
		return err
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.revoked[token] = struct{}{}
	return nil
}

func (s *Service) isRevoked(token string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.revoked[token]
	return ok
}

func validateRegister(req RegisterRequest) []string {
	var details []string
	if _, err := mail.ParseAddress(strings.TrimSpace(req.Email)); err != nil {
		details = append(details, "valid email is required")
	}
	if strings.TrimSpace(req.Username) == "" {
		details = append(details, "username is required")
	}
	if len(req.Password) < 8 {
		details = append(details, "password must be at least 8 characters")
	}
	return details
}

func validateLogin(req LoginRequest) []string {
	var details []string
	if _, err := mail.ParseAddress(strings.TrimSpace(req.Email)); err != nil {
		details = append(details, "valid email is required")
	}
	if req.Password == "" {
		details = append(details, "password is required")
	}
	return details
}
