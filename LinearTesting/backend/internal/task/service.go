package task

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"aoa-user-mvp/backend/internal/audit"
	"aoa-user-mvp/backend/internal/notification"
	"aoa-user-mvp/backend/internal/wallet"
)

var (
	ErrInvalidTemplate  = errors.New("invalid task template")
	ErrClaimUnavailable = errors.New("task reward claim unavailable")
)

const (
	maxRewardAmount = 500
	maxDailyLimit   = 5
)

type Service struct {
	repo    Repository
	claims  ClaimRepository
	rewards RewardWallet
	audit   Auditor
	notify  Notifier
}

type Auditor interface {
	Record(ctx context.Context, input audit.EntryInput) (audit.Entry, error)
}

type RewardWallet interface {
	Credit(
		ctx context.Context,
		userID string,
		resourceType string,
		amount int,
		reason string,
		referenceType string,
		referenceID string,
	) (wallet.Result, []string, error)
}

type Notifier interface {
	Send(ctx context.Context, input notification.EventInput) (notification.Event, error)
}

type ClaimResult struct {
	Claim       Claim              `json:"claim"`
	Template    Template           `json:"task_template"`
	Wallet      wallet.Wallet      `json:"wallet"`
	Transaction wallet.Transaction `json:"transaction"`
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func NewRewardService(repo Repository, claims ClaimRepository, rewards RewardWallet) *Service {
	return NewAuditedRewardService(repo, claims, rewards, nil)
}

func NewAuditedRewardService(
	repo Repository,
	claims ClaimRepository,
	rewards RewardWallet,
	auditor Auditor,
) *Service {
	return NewObservedRewardService(repo, claims, rewards, auditor, nil)
}

func NewObservedRewardService(
	repo Repository,
	claims ClaimRepository,
	rewards RewardWallet,
	auditor Auditor,
	notifier Notifier,
) *Service {
	return &Service{repo: repo, claims: claims, rewards: rewards, audit: auditor, notify: notifier}
}

func (s *Service) CreateTemplate(ctx context.Context, input TemplateInput) (Template, []string, error) {
	normalized, details := validateTemplateInput(input)
	if len(details) > 0 {
		return Template{}, details, ErrInvalidTemplate
	}

	created, err := s.repo.CreateTemplate(ctx, normalized)
	return created, nil, err
}

func (s *Service) AdminCreateTemplate(
	ctx context.Context,
	actorUserID string,
	input TemplateInput,
) (Template, []string, error) {
	created, details, err := s.CreateTemplate(ctx, input)
	if err != nil {
		return Template{}, details, err
	}

	if err := s.recordAdminAudit(ctx, actorUserID, "task_template_created", created); err != nil {
		return Template{}, nil, err
	}
	return created, nil, nil
}

func (s *Service) ListTemplates(ctx context.Context) ([]Template, error) {
	return s.repo.ListTemplates(ctx)
}

func (s *Service) ListActiveTemplates(ctx context.Context) ([]Template, error) {
	return s.repo.ListActiveTemplates(ctx)
}

func (s *Service) ClaimReward(
	ctx context.Context,
	userID string,
	taskID string,
	idempotencyKey string,
) (ClaimResult, []string, error) {
	return s.ClaimRewardAt(ctx, userID, taskID, idempotencyKey, time.Now().UTC())
}

func (s *Service) ClaimExternalTaskEvent(
	ctx context.Context,
	input ExternalTaskEventInput,
) (ExternalTaskEventResult, []string, error) {
	normalized, details := validateExternalTaskEvent(input)
	if len(details) > 0 {
		return ExternalTaskEventResult{}, details, ErrInvalidTemplate
	}

	claim, details, err := s.ClaimReward(
		ctx,
		normalized.UserID,
		normalized.TaskTemplateID,
		externalIdempotencyKey(normalized),
	)
	if err != nil {
		return ExternalTaskEventResult{}, details, err
	}

	if s.audit != nil {
		if _, err := s.audit.Record(ctx, audit.EntryInput{
			ActorUserID:  normalized.UserID,
			Action:       "external_task_event_received",
			ResourceType: "task_claim",
			ResourceID:   claim.Claim.ID,
			Metadata: map[string]string{
				"source_system":    normalized.SourceSystem,
				"idempotency_key":  normalized.IdempotencyKey,
				"task_template_id": normalized.TaskTemplateID,
			},
		}); err != nil {
			return ExternalTaskEventResult{}, nil, err
		}
	}

	return ExternalTaskEventResult{
		SourceSystem: normalized.SourceSystem,
		Claim:        claim,
	}, nil, nil
}

func (s *Service) ProcessAttendanceCheckIn(
	ctx context.Context,
	input AttendanceCheckInInput,
) (ExternalTaskEventResult, []string, error) {
	normalized := AttendanceCheckInInput{
		ExternalEmployeeID: strings.TrimSpace(input.ExternalEmployeeID),
		UserID:             strings.TrimSpace(input.UserID),
		TaskTemplateID:     strings.TrimSpace(input.TaskTemplateID),
		EventID:            strings.TrimSpace(input.EventID),
	}

	var details []string
	if normalized.ExternalEmployeeID == "" {
		details = append(details, "external employee id is required")
	}
	if normalized.UserID == "" {
		details = append(details, "mapped user id is required")
	}
	if normalized.TaskTemplateID == "" {
		details = append(details, "task template id is required")
	}
	if normalized.EventID == "" {
		details = append(details, "event id is required")
	}
	if len(details) > 0 {
		return ExternalTaskEventResult{}, details, ErrInvalidTemplate
	}

	return s.ClaimExternalTaskEvent(ctx, ExternalTaskEventInput{
		UserID:         normalized.UserID,
		TaskTemplateID: normalized.TaskTemplateID,
		SourceSystem:   "attendance",
		IdempotencyKey: normalized.EventID,
	})
}

func (s *Service) ClaimRewardAt(
	ctx context.Context,
	userID string,
	taskID string,
	idempotencyKey string,
	now time.Time,
) (ClaimResult, []string, error) {
	if s.claims == nil || s.rewards == nil {
		return ClaimResult{}, nil, ErrClaimUnavailable
	}

	userID = strings.TrimSpace(userID)
	taskID = strings.TrimSpace(taskID)
	var details []string
	if userID == "" {
		details = append(details, "user id is required")
	}
	if taskID == "" {
		details = append(details, "task id is required")
	}
	if len(details) > 0 {
		return ClaimResult{}, details, ErrInvalidTemplate
	}

	template, err := s.repo.FindTemplate(ctx, taskID)
	if errors.Is(err, ErrTemplateNotFound) {
		return ClaimResult{}, []string{"task template was not found"}, ErrTemplateNotFound
	}
	if err != nil {
		return ClaimResult{}, nil, err
	}
	if template.Status != StatusActive {
		return ClaimResult{}, []string{"task template is disabled"}, ErrTemplateNotFound
	}

	claim, err := s.claims.CreateClaim(ctx, ClaimInput{
		UserID:         userID,
		TaskTemplateID: template.ID,
		ClaimDate:      now.UTC().Format("2006-01-02"),
		IdempotencyKey: strings.TrimSpace(idempotencyKey),
	}, template.DailyLimit)
	if errors.Is(err, ErrDailyClaimLimit) {
		return ClaimResult{}, []string{"daily claim limit reached"}, ErrDailyClaimLimit
	}
	if err != nil {
		return ClaimResult{}, nil, err
	}

	reward, rewardDetails, err := s.rewards.Credit(
		ctx,
		userID,
		template.RewardType,
		template.RewardAmount,
		"task reward claim",
		"task_claim",
		claim.ID,
	)
	if err != nil {
		return ClaimResult{}, rewardDetails, err
	}

	if s.audit != nil {
		if _, err := s.audit.Record(ctx, audit.EntryInput{
			ActorUserID:  userID,
			Action:       "task_reward_claimed",
			ResourceType: "task_claim",
			ResourceID:   claim.ID,
			Metadata: map[string]string{
				"task_template_id":      template.ID,
				"reward_type":           template.RewardType,
				"reward_amount":         strconv.Itoa(template.RewardAmount),
				"wallet_transaction_id": reward.Transaction.ID,
			},
		}); err != nil {
			return ClaimResult{}, nil, err
		}
	}
	if err := s.notifyTaskCompleted(ctx, userID, template, reward.Transaction.ID); err != nil {
		return ClaimResult{}, nil, err
	}

	return ClaimResult{
		Claim:       claim,
		Template:    template,
		Wallet:      reward.Wallet,
		Transaction: reward.Transaction,
	}, nil, nil
}

func (s *Service) UpdateTemplate(
	ctx context.Context,
	id string,
	input TemplateInput,
) (Template, []string, error) {
	normalized, details := validateTemplateInput(input)
	if strings.TrimSpace(id) == "" {
		details = append(details, "template id is required")
	}
	if len(details) > 0 {
		return Template{}, details, ErrInvalidTemplate
	}

	changed, err := s.repo.UpdateTemplate(ctx, id, normalized)
	return changed, nil, err
}

func (s *Service) AdminUpdateTemplate(
	ctx context.Context,
	actorUserID string,
	id string,
	input TemplateInput,
) (Template, []string, error) {
	changed, details, err := s.UpdateTemplate(ctx, id, input)
	if err != nil {
		return Template{}, details, err
	}

	if err := s.recordAdminAudit(ctx, actorUserID, "task_template_updated", changed); err != nil {
		return Template{}, nil, err
	}
	return changed, nil, nil
}

func (s *Service) DisableTemplate(ctx context.Context, id string) (Template, []string, error) {
	if strings.TrimSpace(id) == "" {
		return Template{}, []string{"template id is required"}, ErrInvalidTemplate
	}

	disabled, err := s.repo.DisableTemplate(ctx, id)
	return disabled, nil, err
}

func (s *Service) AdminDisableTemplate(
	ctx context.Context,
	actorUserID string,
	id string,
) (Template, []string, error) {
	disabled, details, err := s.DisableTemplate(ctx, id)
	if err != nil {
		return Template{}, details, err
	}

	if err := s.recordAdminAudit(ctx, actorUserID, "task_template_disabled", disabled); err != nil {
		return Template{}, nil, err
	}
	return disabled, nil, nil
}

func DemoTemplateInputs() []TemplateInput {
	return []TemplateInput{
		{
			Name:         "Clock in on time",
			Description:  "Reward employees for starting the day on schedule.",
			RewardType:   RewardEnergy,
			RewardAmount: 10,
			DailyLimit:   1,
			Status:       StatusActive,
		},
		{
			Name:         "Submit daily report",
			Description:  "Reward a concise daily progress report.",
			RewardType:   RewardFeed,
			RewardAmount: 1,
			DailyLimit:   1,
			Status:       StatusActive,
		},
		{
			Name:         "Complete training course",
			Description:  "Reward employees for finishing assigned training.",
			RewardType:   RewardEnergy,
			RewardAmount: 25,
			DailyLimit:   1,
			Status:       StatusActive,
		},
	}
}

func validateTemplateInput(input TemplateInput) (TemplateInput, []string) {
	normalized := TemplateInput{
		Name:         strings.TrimSpace(input.Name),
		Description:  strings.TrimSpace(input.Description),
		RewardType:   strings.TrimSpace(input.RewardType),
		RewardAmount: input.RewardAmount,
		DailyLimit:   input.DailyLimit,
		Status:       strings.TrimSpace(input.Status),
	}
	if normalized.RewardType == "" {
		normalized.RewardType = RewardEnergy
	}
	if normalized.Status == "" {
		normalized.Status = StatusActive
	}

	var details []string
	if normalized.Name == "" {
		details = append(details, "name is required")
	}
	if normalized.Description == "" {
		details = append(details, "description is required")
	}
	if normalized.RewardType != RewardEnergy && normalized.RewardType != RewardFeed {
		details = append(details, "reward type must be energy or feed")
	}
	if normalized.RewardAmount <= 0 {
		details = append(details, "reward amount must be greater than zero")
	}
	if normalized.RewardAmount > maxRewardAmount {
		details = append(details, "reward amount must be 500 or less")
	}
	if normalized.DailyLimit <= 0 {
		details = append(details, "daily limit must be greater than zero")
	}
	if normalized.DailyLimit > maxDailyLimit {
		details = append(details, "daily limit must be 5 or less")
	}
	if normalized.Status != StatusActive && normalized.Status != StatusDisabled {
		details = append(details, "status must be active or disabled")
	}

	return normalized, details
}

func validateExternalTaskEvent(input ExternalTaskEventInput) (ExternalTaskEventInput, []string) {
	normalized := ExternalTaskEventInput{
		UserID:         strings.TrimSpace(input.UserID),
		TaskTemplateID: strings.TrimSpace(input.TaskTemplateID),
		SourceSystem:   strings.TrimSpace(input.SourceSystem),
		IdempotencyKey: strings.TrimSpace(input.IdempotencyKey),
	}

	var details []string
	if normalized.UserID == "" {
		details = append(details, "user id is required")
	}
	if normalized.TaskTemplateID == "" {
		details = append(details, "task template id is required")
	}
	if normalized.SourceSystem == "" {
		details = append(details, "source system is required")
	}
	if normalized.IdempotencyKey == "" {
		details = append(details, "idempotency key is required")
	}
	return normalized, details
}

func externalIdempotencyKey(input ExternalTaskEventInput) string {
	return input.SourceSystem + ":" + input.IdempotencyKey
}

func (s *Service) notifyTaskCompleted(
	ctx context.Context,
	userID string,
	template Template,
	transactionID string,
) error {
	if s.notify == nil {
		return nil
	}

	_, err := s.notify.Send(ctx, notification.EventInput{
		EventType:   notification.EventTaskCompleted,
		UserID:      userID,
		Title:       "Task completed",
		Message:     template.Name + " reward was claimed.",
		NonCritical: true,
		Metadata: map[string]string{
			"task_template_id":      template.ID,
			"reward_type":           template.RewardType,
			"reward_amount":         strconv.Itoa(template.RewardAmount),
			"wallet_transaction_id": transactionID,
		},
	})
	return err
}

func (s *Service) recordAdminAudit(
	ctx context.Context,
	actorUserID string,
	action string,
	template Template,
) error {
	if s.audit == nil {
		return nil
	}

	_, err := s.audit.Record(ctx, audit.EntryInput{
		ActorUserID:  actorUserID,
		Action:       action,
		ResourceType: "task_template",
		ResourceID:   template.ID,
		Metadata: map[string]string{
			"reward_type":   template.RewardType,
			"reward_amount": strconv.Itoa(template.RewardAmount),
			"daily_limit":   strconv.Itoa(template.DailyLimit),
			"status":        template.Status,
		},
	})
	return err
}
