package notification

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

var ErrInvalidEvent = errors.New("invalid notification event")

type Sender interface {
	Send(ctx context.Context, input EventInput) (Event, error)
}

type MemorySender struct {
	mu         sync.RWMutex
	events     []Event
	optedOut   map[string]bool
	nextEvent  int
	safeFields map[string]bool
}

func NewMemorySender() *MemorySender {
	return &MemorySender{
		events:    []Event{},
		optedOut:  map[string]bool{},
		nextEvent: 1,
		safeFields: map[string]bool{
			"pet_id":                true,
			"feed_amount":           true,
			"growth_delta":          true,
			"task_template_id":      true,
			"reward_type":           true,
			"reward_amount":         true,
			"wallet_transaction_id": true,
			"level":                 true,
			"skin_id":               true,
		},
	}
}

func (s *MemorySender) Send(ctx context.Context, input EventInput) (Event, error) {
	if err := ctx.Err(); err != nil {
		return Event{}, err
	}

	normalized, err := validate(input, s.safeFields)
	if err != nil {
		return Event{}, err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if normalized.NonCritical && s.optedOut[normalized.UserID] {
		return Event{}, nil
	}

	normalized.ID = fmt.Sprintf("notification_%06d", s.nextEvent)
	normalized.CreatedAt = time.Now().UTC()
	s.nextEvent++
	s.events = append([]Event{normalized}, s.events...)
	return normalized, nil
}

func (s *MemorySender) SetOptOut(userID string, optedOut bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.optedOut[strings.TrimSpace(userID)] = optedOut
}

func (s *MemorySender) Events() []Event {
	s.mu.RLock()
	defer s.mu.RUnlock()

	events := make([]Event, len(s.events))
	copy(events, s.events)
	return events
}

func validate(input EventInput, safeFields map[string]bool) (Event, error) {
	event := Event{
		EventType:   strings.TrimSpace(input.EventType),
		UserID:      strings.TrimSpace(input.UserID),
		Title:       strings.TrimSpace(input.Title),
		Message:     strings.TrimSpace(input.Message),
		NonCritical: input.NonCritical,
		Metadata:    map[string]string{},
	}

	if event.EventType == "" || event.Title == "" || event.Message == "" {
		return Event{}, ErrInvalidEvent
	}
	for key, value := range input.Metadata {
		key = strings.TrimSpace(key)
		if !safeFields[key] {
			continue
		}
		event.Metadata[key] = strings.TrimSpace(value)
	}
	return event, nil
}
