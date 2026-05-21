package wallet

import "time"

const (
	ResourceEnergy = "energy"
	ResourceFeed   = "feed"
)

type Wallet struct {
	UserID        string    `json:"user_id"`
	EnergyBalance int       `json:"energy_balance"`
	FeedBalance   int       `json:"feed_balance"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Transaction struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	ResourceType  string    `json:"resource_type"`
	AmountDelta   int       `json:"amount_delta"`
	BalanceAfter  int       `json:"balance_after"`
	Reason        string    `json:"reason"`
	ReferenceType string    `json:"reference_type"`
	ReferenceID   string    `json:"reference_id"`
	CreatedAt     time.Time `json:"created_at"`
}

type Change struct {
	UserID        string
	ResourceType  string
	AmountDelta   int
	Reason        string
	ReferenceType string
	ReferenceID   string
}
