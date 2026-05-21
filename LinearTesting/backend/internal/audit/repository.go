package audit

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"
)

type Repository interface {
	Record(ctx context.Context, input EntryInput) (Entry, error)
	List(ctx context.Context, limit int) ([]Entry, error)
}

type MySQLRepository struct {
	db *sql.DB
}

func NewMySQLRepository(db *sql.DB) *MySQLRepository {
	return &MySQLRepository{db: db}
}

func (r *MySQLRepository) Record(ctx context.Context, input EntryInput) (Entry, error) {
	created := normalizeEntry(Entry{
		ID:           makeRandomID(),
		ActorUserID:  input.ActorUserID,
		Action:       input.Action,
		ResourceType: input.ResourceType,
		ResourceID:   input.ResourceID,
		Metadata:     input.Metadata,
		CreatedAt:    time.Now().UTC(),
	})
	metadata, err := encodeMetadata(created.Metadata)
	if err != nil {
		return Entry{}, err
	}

	_, err = r.db.ExecContext(
		ctx,
		`INSERT INTO audit_logs
		 (id, actor_user_id, action, resource_type, resource_id, metadata_json, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		created.ID,
		created.ActorUserID,
		created.Action,
		created.ResourceType,
		created.ResourceID,
		metadata,
		created.CreatedAt,
	)
	if err != nil {
		return Entry{}, err
	}

	return created, nil
}

func (r *MySQLRepository) List(ctx context.Context, limit int) ([]Entry, error) {
	if limit <= 0 || limit > 100 {
		limit = 100
	}

	rows, err := r.db.QueryContext(
		ctx,
		`SELECT id, actor_user_id, action, resource_type, resource_id, metadata_json, created_at
		 FROM audit_logs
		 ORDER BY created_at DESC, id DESC
		 LIMIT ?`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		found, err := scanEntry(rows)
		if err != nil {
			return nil, err
		}
		entries = append(entries, found)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return entries, nil
}

type MemoryRepository struct {
	mu      sync.RWMutex
	entries []Entry
	nextID  int
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{nextID: 1}
}

func (r *MemoryRepository) Record(ctx context.Context, input EntryInput) (Entry, error) {
	if err := ctx.Err(); err != nil {
		return Entry{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	created := normalizeEntry(Entry{
		ID:           makeSequentialID(r.nextID),
		ActorUserID:  input.ActorUserID,
		Action:       input.Action,
		ResourceType: input.ResourceType,
		ResourceID:   input.ResourceID,
		Metadata:     input.Metadata,
		CreatedAt:    time.Now().UTC(),
	})
	r.nextID++
	r.entries = append([]Entry{created}, r.entries...)
	return created, nil
}

func (r *MemoryRepository) List(ctx context.Context, limit int) ([]Entry, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if limit <= 0 || limit > 100 {
		limit = 100
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	if limit > len(r.entries) {
		limit = len(r.entries)
	}
	entries := make([]Entry, limit)
	copy(entries, r.entries[:limit])
	return entries, nil
}

func normalizeEntry(entry Entry) Entry {
	entry.ActorUserID = clean(entry.ActorUserID)
	entry.Action = clean(entry.Action)
	entry.ResourceType = clean(entry.ResourceType)
	entry.ResourceID = clean(entry.ResourceID)
	entry.Metadata = sanitizeMetadata(entry.Metadata)
	if entry.ActorUserID == "" {
		entry.ActorUserID = "system"
	}
	return entry
}

func sanitizeMetadata(metadata map[string]string) map[string]string {
	safe := map[string]string{}
	for key, value := range metadata {
		normalizedKey := clean(key)
		if normalizedKey == "" || isSensitiveKey(normalizedKey) {
			continue
		}
		safe[normalizedKey] = clean(value)
	}
	return safe
}

func isSensitiveKey(key string) bool {
	key = strings.ToLower(key)
	return strings.Contains(key, "password") ||
		strings.Contains(key, "token") ||
		strings.Contains(key, "secret") ||
		strings.Contains(key, "credential")
}

func encodeMetadata(metadata map[string]string) (string, error) {
	bytes, err := json.Marshal(metadata)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func decodeMetadata(raw string) (map[string]string, error) {
	if raw == "" {
		return map[string]string{}, nil
	}
	metadata := map[string]string{}
	if err := json.Unmarshal([]byte(raw), &metadata); err != nil {
		return nil, err
	}
	return metadata, nil
}

func scanEntry(rows *sql.Rows) (Entry, error) {
	var found Entry
	var metadataJSON string
	err := rows.Scan(
		&found.ID,
		&found.ActorUserID,
		&found.Action,
		&found.ResourceType,
		&found.ResourceID,
		&metadataJSON,
		&found.CreatedAt,
	)
	if err != nil {
		return Entry{}, err
	}
	metadata, err := decodeMetadata(metadataJSON)
	if err != nil {
		return Entry{}, err
	}
	found.Metadata = metadata
	return found, nil
}

func clean(value string) string {
	return strings.TrimSpace(value)
}

func makeSequentialID(next int) string {
	return fmt.Sprintf("audit_%06d", next)
}

func makeRandomID() string {
	var bytes [8]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "audit_" + fmt.Sprint(time.Now().UTC().UnixNano())
	}
	return "audit_" + hex.EncodeToString(bytes[:])
}
