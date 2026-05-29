package repository

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"errors"
	"strings"

	"projectm/backend/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrUserNotFound = errors.New("user not found")

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (model.CurrentUser, error) {
	return r.findOne(ctx, "email = $1", email)
}

func (r *UserRepository) FindByID(ctx context.Context, userID string) (model.CurrentUser, error) {
	return r.findOne(ctx, "user_id = $1", userID)
}

func (r *UserRepository) FindOrCreateByTeamsIdentity(ctx context.Context, identity model.TeamsUserIdentity) (model.CurrentUser, error) {
	if strings.TrimSpace(identity.UserID) != "" {
		user, err := r.findOne(ctx, "teams_user_id = $1", strings.TrimSpace(identity.UserID))
		if err == nil {
			return user, nil
		}
		if !errors.Is(err, ErrUserNotFound) {
			return model.CurrentUser{}, err
		}
	}

	if strings.TrimSpace(identity.Email) != "" {
		user, err := r.FindByEmail(ctx, strings.ToLower(strings.TrimSpace(identity.Email)))
		if err == nil {
			return r.attachTeamsIdentity(ctx, user.UserID, identity)
		}
		if !errors.Is(err, ErrUserNotFound) {
			return model.CurrentUser{}, err
		}
	}

	return r.createTeamsUser(ctx, identity)
}

func (r *UserRepository) findOne(ctx context.Context, where string, arg string) (model.CurrentUser, error) {
	query := `
		SELECT user_id, email, display_name, role_code, department, title, account_status
		FROM users
		WHERE ` + where + `
		LIMIT 1`

	var user model.CurrentUser
	err := r.db.QueryRow(ctx, query, arg).Scan(
		&user.UserID,
		&user.Email,
		&user.DisplayName,
		&user.RoleCode,
		&user.Department,
		&user.Title,
		&user.AccountStatus,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return model.CurrentUser{}, ErrUserNotFound
	}
	return user, err
}

func (r *UserRepository) attachTeamsIdentity(ctx context.Context, userID string, identity model.TeamsUserIdentity) (model.CurrentUser, error) {
	_, err := r.db.Exec(ctx, `
		UPDATE users
		SET teams_user_id = NULLIF($2, ''),
			teams_tenant_id = NULLIF($3, ''),
			avatar_url = COALESCE(NULLIF($4, ''), avatar_url),
			last_login_at = CURRENT_TIMESTAMP,
			updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1`, userID, strings.TrimSpace(identity.UserID), strings.TrimSpace(identity.TenantID), strings.TrimSpace(identity.AvatarURL))
	if err != nil {
		return model.CurrentUser{}, err
	}
	return r.FindByID(ctx, userID)
}

func (r *UserRepository) createTeamsUser(ctx context.Context, identity model.TeamsUserIdentity) (model.CurrentUser, error) {
	userID, err := newUserID()
	if err != nil {
		return model.CurrentUser{}, err
	}

	email := strings.ToLower(strings.TrimSpace(identity.Email))
	if email == "" {
		email = userID + "@teams.projectm.local"
	}
	displayName := strings.TrimSpace(identity.DisplayName)
	if displayName == "" {
		displayName = email
	}

	_, err = r.db.Exec(ctx, `
		INSERT INTO users
			(user_id, email, display_name, avatar_url, role_code, account_status, teams_user_id, teams_tenant_id, last_login_at)
		VALUES
			($1, $2, $3, $4, 'user', 'active', NULLIF($5, ''), NULLIF($6, ''), CURRENT_TIMESTAMP)`,
		userID,
		email,
		displayName,
		strings.TrimSpace(identity.AvatarURL),
		strings.TrimSpace(identity.UserID),
		strings.TrimSpace(identity.TenantID),
	)
	if err != nil {
		return model.CurrentUser{}, err
	}

	return r.FindByID(ctx, userID)
}

func newUserID() (string, error) {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "", err
	}
	return "USR_" + strings.TrimRight(base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(bytes[:]), "="), nil
}
