package notification

import "time"

const (
	EventTaskCompleted = "task_completed"
	EventPetFed        = "pet_fed"
	EventPetUpgraded   = "pet_upgraded"
	EventSkinUnlocked  = "skin_unlocked"
)

type Event struct {
	ID          string            `json:"id"`
	EventType   string            `json:"event_type"`
	UserID      string            `json:"user_id"`
	Title       string            `json:"title"`
	Message     string            `json:"message"`
	NonCritical bool              `json:"non_critical"`
	Metadata    map[string]string `json:"metadata"`
	CreatedAt   time.Time         `json:"created_at"`
}

type EventInput struct {
	EventType   string
	UserID      string
	Title       string
	Message     string
	NonCritical bool
	Metadata    map[string]string
}
