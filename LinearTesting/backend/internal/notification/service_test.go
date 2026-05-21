package notification

import (
	"context"
	"errors"
	"testing"
)

func TestMemorySenderStoresSafePayloadOnly(t *testing.T) {
	t.Parallel()

	sender := NewMemorySender()
	event, err := sender.Send(context.Background(), EventInput{
		EventType: EventPetFed,
		UserID:    "usr_000001",
		Title:     "Pet fed",
		Message:   "The team pet was fed.",
		Metadata: map[string]string{
			"pet_id":     "pet_000001",
			"secret_key": "should-not-store",
		},
	})
	if err != nil {
		t.Fatalf("Send error = %v", err)
	}
	if event.Metadata["pet_id"] != "pet_000001" {
		t.Fatalf("pet id metadata = %q", event.Metadata["pet_id"])
	}
	if _, ok := event.Metadata["secret_key"]; ok {
		t.Fatalf("secret metadata should be dropped: %#v", event.Metadata)
	}
}

func TestMemorySenderSkipsNonCriticalOptOut(t *testing.T) {
	t.Parallel()

	sender := NewMemorySender()
	sender.SetOptOut("usr_000001", true)
	event, err := sender.Send(context.Background(), EventInput{
		EventType:   EventTaskCompleted,
		UserID:      "usr_000001",
		Title:       "Task complete",
		Message:     "A task was completed.",
		NonCritical: true,
	})
	if err != nil {
		t.Fatalf("Send error = %v", err)
	}
	if event.ID != "" {
		t.Fatalf("opted out non-critical event should not be stored: %#v", event)
	}
	if len(sender.Events()) != 0 {
		t.Fatalf("stored events = %d, want 0", len(sender.Events()))
	}
}

func TestMemorySenderValidatesEvent(t *testing.T) {
	t.Parallel()

	_, err := NewMemorySender().Send(context.Background(), EventInput{EventType: EventPetFed})
	if !errors.Is(err, ErrInvalidEvent) {
		t.Fatalf("Send error = %v, want %v", err, ErrInvalidEvent)
	}
}
