package audit

import (
	"context"
	"testing"
)

func TestMemoryRepository_RecordSanitizesMetadata(t *testing.T) {
	t.Parallel()

	repo := NewMemoryRepository()
	entry, err := repo.Record(context.Background(), EntryInput{
		ActorUserID:  " usr_000001 ",
		Action:       " task_reward_claimed ",
		ResourceType: " task_claim ",
		ResourceID:   " claim_000001 ",
		Metadata: map[string]string{
			"reward_type": "feed",
			"token":       "should-not-store",
			"password":    "should-not-store",
		},
	})
	if err != nil {
		t.Fatalf("Record error = %v", err)
	}
	if entry.ActorUserID != "usr_000001" {
		t.Fatalf("ActorUserID = %q, want usr_000001", entry.ActorUserID)
	}
	if entry.Metadata["reward_type"] != "feed" {
		t.Fatalf("reward_type metadata = %q, want feed", entry.Metadata["reward_type"])
	}
	if _, ok := entry.Metadata["token"]; ok {
		t.Fatal("token metadata should not be stored")
	}
	if _, ok := entry.Metadata["password"]; ok {
		t.Fatal("password metadata should not be stored")
	}
}

func TestMemoryRepository_ListNewestFirst(t *testing.T) {
	t.Parallel()

	repo := NewMemoryRepository()
	if _, err := repo.Record(context.Background(), EntryInput{Action: "first"}); err != nil {
		t.Fatalf("first Record error = %v", err)
	}
	if _, err := repo.Record(context.Background(), EntryInput{Action: "second"}); err != nil {
		t.Fatalf("second Record error = %v", err)
	}

	entries, err := repo.List(context.Background(), 10)
	if err != nil {
		t.Fatalf("List error = %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("entries = %d, want 2", len(entries))
	}
	if entries[0].Action != "second" {
		t.Fatalf("newest action = %q, want second", entries[0].Action)
	}
}
