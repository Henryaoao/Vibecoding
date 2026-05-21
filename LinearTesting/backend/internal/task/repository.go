package task

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
)

var (
	ErrTemplateNotFound = errors.New("task template not found")
	ErrDailyClaimLimit  = errors.New("daily claim limit reached")
)

type Repository interface {
	CreateTemplate(ctx context.Context, input TemplateInput) (Template, error)
	FindTemplate(ctx context.Context, id string) (Template, error)
	ListTemplates(ctx context.Context) ([]Template, error)
	ListActiveTemplates(ctx context.Context) ([]Template, error)
	UpdateTemplate(ctx context.Context, id string, input TemplateInput) (Template, error)
	DisableTemplate(ctx context.Context, id string) (Template, error)
}

type ClaimRepository interface {
	CreateClaim(ctx context.Context, input ClaimInput, dailyLimit int) (Claim, error)
}

type MySQLRepository struct {
	db *sql.DB
}

func NewMySQLRepository(db *sql.DB) *MySQLRepository {
	return &MySQLRepository{db: db}
}

func (r *MySQLRepository) CreateTemplate(ctx context.Context, input TemplateInput) (Template, error) {
	now := time.Now().UTC()
	created := normalizeTemplate(Template{
		ID:           makeRandomID("task_template"),
		Name:         input.Name,
		Description:  input.Description,
		RewardType:   input.RewardType,
		RewardAmount: input.RewardAmount,
		DailyLimit:   input.DailyLimit,
		Status:       input.Status,
		CreatedAt:    now,
		UpdatedAt:    now,
	})

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO task_templates
		 (id, name, description, reward_type, reward_amount, daily_limit, status, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		created.ID,
		created.Name,
		created.Description,
		created.RewardType,
		created.RewardAmount,
		created.DailyLimit,
		created.Status,
		created.CreatedAt,
		created.UpdatedAt,
	)
	if err != nil {
		return Template{}, err
	}

	return created, nil
}

func (r *MySQLRepository) FindTemplate(ctx context.Context, id string) (Template, error) {
	return r.findByID(ctx, id)
}

func (r *MySQLRepository) ListTemplates(ctx context.Context) ([]Template, error) {
	return r.listTemplates(ctx, "")
}

func (r *MySQLRepository) ListActiveTemplates(ctx context.Context) ([]Template, error) {
	return r.listTemplates(ctx, StatusActive)
}

func (r *MySQLRepository) listTemplates(ctx context.Context, status string) ([]Template, error) {
	query := `SELECT id, name, description, reward_type, reward_amount, daily_limit, status, created_at, updated_at
		 FROM task_templates`
	args := []any{}
	if status != "" {
		query += ` WHERE status = ?`
		args = append(args, status)
	}
	query += ` ORDER BY created_at ASC`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var templates []Template
	for rows.Next() {
		found, err := scanTemplate(rows)
		if err != nil {
			return nil, err
		}
		templates = append(templates, found)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return templates, nil
}

func (r *MySQLRepository) CreateClaim(
	ctx context.Context,
	input ClaimInput,
	dailyLimit int,
) (Claim, error) {
	for slot := 1; slot <= dailyLimit; slot++ {
		created := Claim{
			ID:             makeRandomID("task_claim"),
			UserID:         input.UserID,
			TaskTemplateID: input.TaskTemplateID,
			ClaimDate:      input.ClaimDate,
			ClaimSlot:      slot,
			IdempotencyKey: input.IdempotencyKey,
			CreatedAt:      time.Now().UTC(),
		}

		_, err := r.db.ExecContext(
			ctx,
			`INSERT INTO task_reward_claims
			 (id, user_id, task_template_id, claim_date, claim_slot, idempotency_key, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			created.ID,
			created.UserID,
			created.TaskTemplateID,
			created.ClaimDate,
			created.ClaimSlot,
			created.IdempotencyKey,
			created.CreatedAt,
		)
		if isDuplicateMySQLError(err) {
			continue
		}
		if err != nil {
			return Claim{}, err
		}

		return created, nil
	}

	return Claim{}, ErrDailyClaimLimit
}

func (r *MySQLRepository) UpdateTemplate(
	ctx context.Context,
	id string,
	input TemplateInput,
) (Template, error) {
	changed := normalizeTemplate(Template{
		ID:           id,
		Name:         input.Name,
		Description:  input.Description,
		RewardType:   input.RewardType,
		RewardAmount: input.RewardAmount,
		DailyLimit:   input.DailyLimit,
		Status:       input.Status,
		UpdatedAt:    time.Now().UTC(),
	})

	result, err := r.db.ExecContext(
		ctx,
		`UPDATE task_templates
		 SET name = ?, description = ?, reward_type = ?, reward_amount = ?, daily_limit = ?, status = ?, updated_at = ?
		 WHERE id = ?`,
		changed.Name,
		changed.Description,
		changed.RewardType,
		changed.RewardAmount,
		changed.DailyLimit,
		changed.Status,
		changed.UpdatedAt,
		changed.ID,
	)
	if err != nil {
		return Template{}, err
	}

	return r.changedTemplate(ctx, result, id)
}

func (r *MySQLRepository) DisableTemplate(ctx context.Context, id string) (Template, error) {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE task_templates SET status = ?, updated_at = ? WHERE id = ?`,
		StatusDisabled,
		time.Now().UTC(),
		id,
	)
	if err != nil {
		return Template{}, err
	}

	return r.changedTemplate(ctx, result, id)
}

func (r *MySQLRepository) changedTemplate(
	ctx context.Context,
	result sql.Result,
	id string,
) (Template, error) {
	affected, err := result.RowsAffected()
	if err != nil {
		return Template{}, err
	}
	if affected == 0 {
		return Template{}, ErrTemplateNotFound
	}

	return r.findByID(ctx, id)
}

func (r *MySQLRepository) findByID(ctx context.Context, id string) (Template, error) {
	var found Template
	err := r.db.QueryRowContext(
		ctx,
		`SELECT id, name, description, reward_type, reward_amount, daily_limit, status, created_at, updated_at
		 FROM task_templates
		 WHERE id = ?`,
		id,
	).Scan(
		&found.ID,
		&found.Name,
		&found.Description,
		&found.RewardType,
		&found.RewardAmount,
		&found.DailyLimit,
		&found.Status,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Template{}, ErrTemplateNotFound
	}
	if err != nil {
		return Template{}, err
	}

	return found, nil
}

type MemoryRepository struct {
	mu          sync.RWMutex
	byID        map[string]Template
	claims      map[string]Claim
	nextID      int
	nextClaimID int
	seeded      bool
	seedInput   []TemplateInput
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		byID:        map[string]Template{},
		claims:      map[string]Claim{},
		nextID:      1,
		nextClaimID: 1,
		seedInput:   DemoTemplateInputs(),
	}
}

func (r *MemoryRepository) CreateTemplate(ctx context.Context, input TemplateInput) (Template, error) {
	if err := ctx.Err(); err != nil {
		return Template{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	return r.createTemplateLocked(input), nil
}

func (r *MemoryRepository) FindTemplate(ctx context.Context, id string) (Template, error) {
	if err := ctx.Err(); err != nil {
		return Template{}, err
	}

	r.mu.Lock()
	r.seedLocked()
	defer r.mu.Unlock()

	found, ok := r.byID[id]
	if !ok {
		return Template{}, ErrTemplateNotFound
	}
	return found, nil
}

func (r *MemoryRepository) ListTemplates(ctx context.Context) ([]Template, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.Lock()
	r.seedLocked()
	templates := make([]Template, 0, len(r.byID))
	for _, template := range r.byID {
		templates = append(templates, template)
	}
	r.mu.Unlock()

	return templates, nil
}

func (r *MemoryRepository) ListActiveTemplates(ctx context.Context) ([]Template, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.Lock()
	r.seedLocked()
	templates := make([]Template, 0, len(r.byID))
	for _, template := range r.byID {
		if template.Status == StatusActive {
			templates = append(templates, template)
		}
	}
	r.mu.Unlock()

	return templates, nil
}

func (r *MemoryRepository) CreateClaim(
	ctx context.Context,
	input ClaimInput,
	dailyLimit int,
) (Claim, error) {
	if err := ctx.Err(); err != nil {
		return Claim{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	for slot := 1; slot <= dailyLimit; slot++ {
		key := claimKey(input.UserID, input.TaskTemplateID, input.ClaimDate, slot)
		if _, ok := r.claims[key]; ok {
			continue
		}

		created := Claim{
			ID:             makeSequentialClaimID(r.nextClaimID),
			UserID:         input.UserID,
			TaskTemplateID: input.TaskTemplateID,
			ClaimDate:      input.ClaimDate,
			ClaimSlot:      slot,
			IdempotencyKey: input.IdempotencyKey,
			CreatedAt:      time.Now().UTC(),
		}
		r.nextClaimID++
		r.claims[key] = created

		return created, nil
	}

	return Claim{}, ErrDailyClaimLimit
}

func (r *MemoryRepository) UpdateTemplate(
	ctx context.Context,
	id string,
	input TemplateInput,
) (Template, error) {
	if err := ctx.Err(); err != nil {
		return Template{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	current, ok := r.byID[id]
	if !ok {
		return Template{}, ErrTemplateNotFound
	}

	changed := normalizeTemplate(Template{
		ID:           id,
		Name:         input.Name,
		Description:  input.Description,
		RewardType:   input.RewardType,
		RewardAmount: input.RewardAmount,
		DailyLimit:   input.DailyLimit,
		Status:       input.Status,
		CreatedAt:    current.CreatedAt,
		UpdatedAt:    time.Now().UTC(),
	})
	r.byID[id] = changed

	return changed, nil
}

func (r *MemoryRepository) DisableTemplate(ctx context.Context, id string) (Template, error) {
	if err := ctx.Err(); err != nil {
		return Template{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	current, ok := r.byID[id]
	if !ok {
		return Template{}, ErrTemplateNotFound
	}

	current.Status = StatusDisabled
	current.UpdatedAt = time.Now().UTC()
	r.byID[id] = current

	return current, nil
}

func (r *MemoryRepository) seedLocked() {
	if r.seeded {
		return
	}
	for _, input := range r.seedInput {
		r.createTemplateLocked(input)
	}
	r.seeded = true
}

func (r *MemoryRepository) createTemplateLocked(input TemplateInput) Template {
	now := time.Now().UTC()
	created := normalizeTemplate(Template{
		ID:           makeSequentialTemplateID(r.nextID),
		Name:         input.Name,
		Description:  input.Description,
		RewardType:   input.RewardType,
		RewardAmount: input.RewardAmount,
		DailyLimit:   input.DailyLimit,
		Status:       input.Status,
		CreatedAt:    now,
		UpdatedAt:    now,
	})
	r.nextID++
	r.byID[created.ID] = created

	return created
}

func normalizeTemplate(template Template) Template {
	template.Name = strings.TrimSpace(template.Name)
	template.Description = strings.TrimSpace(template.Description)
	template.RewardType = strings.TrimSpace(template.RewardType)
	template.Status = strings.TrimSpace(template.Status)

	if template.RewardType == "" {
		template.RewardType = RewardEnergy
	}
	if template.Status == "" {
		template.Status = StatusActive
	}

	return template
}

func makeSequentialTemplateID(next int) string {
	return fmt.Sprintf("task_template_%06d", next)
}

func makeSequentialClaimID(next int) string {
	return fmt.Sprintf("task_claim_%06d", next)
}

func makeRandomID(prefix string) string {
	var bytes [8]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return prefix + "_" + fmt.Sprint(time.Now().UTC().UnixNano())
	}
	return prefix + "_" + hex.EncodeToString(bytes[:])
}

func claimKey(userID string, taskTemplateID string, claimDate string, slot int) string {
	return fmt.Sprintf("%s:%s:%s:%d", userID, taskTemplateID, claimDate, slot)
}

func isDuplicateMySQLError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "Duplicate entry")
}

func scanTemplate(rows *sql.Rows) (Template, error) {
	var found Template
	err := rows.Scan(
		&found.ID,
		&found.Name,
		&found.Description,
		&found.RewardType,
		&found.RewardAmount,
		&found.DailyLimit,
		&found.Status,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if err != nil {
		return Template{}, err
	}
	return found, nil
}
