package task

import "time"

const (
	RewardEnergy = "energy"
	RewardFeed   = "feed"

	StatusActive   = "active"
	StatusDisabled = "disabled"
)

type Template struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	RewardType   string    `json:"reward_type"`
	RewardAmount int       `json:"reward_amount"`
	DailyLimit   int       `json:"daily_limit"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type TemplateInput struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	RewardType   string `json:"reward_type"`
	RewardAmount int    `json:"reward_amount"`
	DailyLimit   int    `json:"daily_limit"`
	Status       string `json:"status"`
}

type Claim struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	TaskTemplateID string    `json:"task_template_id"`
	ClaimDate      string    `json:"claim_date"`
	ClaimSlot      int       `json:"claim_slot"`
	IdempotencyKey string    `json:"idempotency_key"`
	CreatedAt      time.Time `json:"created_at"`
}

type ClaimInput struct {
	UserID         string
	TaskTemplateID string
	ClaimDate      string
	IdempotencyKey string
}

type ExternalTaskEventInput struct {
	UserID         string `json:"user_id"`
	TaskTemplateID string `json:"task_template_id"`
	SourceSystem   string `json:"source_system"`
	IdempotencyKey string `json:"idempotency_key"`
}

type ExternalTaskEventResult struct {
	SourceSystem string      `json:"source_system"`
	Claim        ClaimResult `json:"claim_result"`
}

type AttendanceCheckInInput struct {
	ExternalEmployeeID string `json:"external_employee_id"`
	UserID             string `json:"user_id"`
	TaskTemplateID     string `json:"task_template_id"`
	EventID            string `json:"event_id"`
}
