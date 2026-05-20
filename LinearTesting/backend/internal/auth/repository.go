package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
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
	Create(ctx context.Context, email string, username string, passwordHash string) (user.User, error)
	FindByEmail(ctx context.Context, email string) (user.User, error)
	FindByID(ctx context.Context, id string) (user.User, error)
}

type MySQLRepository struct {
	db *sql.DB
}

func NewMySQLRepository(db *sql.DB) *MySQLRepository {
	return &MySQLRepository{db: db}
}

func (r *MySQLRepository) Create(
	ctx context.Context,
	email string,
	username string,
	passwordHash string,
) (user.User, error) {
	now := time.Now().UTC()
	created := user.User{
		ID:           makeRandomID(),
		Email:        normalizeEmail(email),
		Username:     strings.TrimSpace(username),
		PasswordHash: passwordHash,
		Role:         "user",
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		created.ID,
		created.Email,
		created.Username,
		created.PasswordHash,
		created.Role,
		created.CreatedAt,
		created.UpdatedAt,
	)
	if isDuplicateMySQLError(err) {
		return user.User{}, ErrDuplicateEmail
	}
	if err != nil {
		return user.User{}, err
	}

	return created, nil
}

func (r *MySQLRepository) FindByEmail(ctx context.Context, email string) (user.User, error) {
	return scanUser(r.db.QueryRowContext(
		ctx,
		`SELECT id, email, username, password_hash, role, created_at, updated_at
		 FROM users
		 WHERE email = ?`,
		normalizeEmail(email),
	))
}

func (r *MySQLRepository) FindByID(ctx context.Context, id string) (user.User, error) {
	return scanUser(r.db.QueryRowContext(
		ctx,
		`SELECT id, email, username, password_hash, role, created_at, updated_at
		 FROM users
		 WHERE id = ?`,
		id,
	))
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

func (r *MemoryRepository) Create(
	ctx context.Context,
	email string,
	username string,
	passwordHash string,
) (user.User, error) {
	if err := ctx.Err(); err != nil {
		return user.User{}, err
	}

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

func (r *MemoryRepository) FindByEmail(ctx context.Context, email string) (user.User, error) {
	if err := ctx.Err(); err != nil {
		return user.User{}, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	id, ok := r.byEmail[normalizeEmail(email)]
	if !ok {
		return user.User{}, ErrUserNotFound
	}
	return r.byID[id], nil
}

func (r *MemoryRepository) FindByID(ctx context.Context, id string) (user.User, error) {
	if err := ctx.Err(); err != nil {
		return user.User{}, err
	}

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

func makeRandomID() string {
	var bytes [8]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "usr_" + fmt.Sprint(time.Now().UTC().UnixNano())
	}
	return "usr_" + hex.EncodeToString(bytes[:])
}

func scanUser(row *sql.Row) (user.User, error) {
	var found user.User
	err := row.Scan(
		&found.ID,
		&found.Email,
		&found.Username,
		&found.PasswordHash,
		&found.Role,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return user.User{}, ErrUserNotFound
	}
	if err != nil {
		return user.User{}, err
	}
	return found, nil
}

func isDuplicateMySQLError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "Duplicate entry")
}
