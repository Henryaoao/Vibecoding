package audit

import "time"

type Entry struct {
	ID           string            `json:"id"`
	ActorUserID  string            `json:"actor_user_id"`
	Action       string            `json:"action"`
	ResourceType string            `json:"resource_type"`
	ResourceID   string            `json:"resource_id"`
	Metadata     map[string]string `json:"metadata"`
	CreatedAt    time.Time         `json:"created_at"`
}

type EntryInput struct {
	ActorUserID  string
	Action       string
	ResourceType string
	ResourceID   string
	Metadata     map[string]string
}
