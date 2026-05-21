package pet

import "time"

type Team struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Pet struct {
	ID          string    `json:"id"`
	TeamID      string    `json:"team_id"`
	Name        string    `json:"name"`
	Template    string    `json:"template"`
	Level       int       `json:"level"`
	GrowthValue int       `json:"growth_value"`
	Mood        string    `json:"mood"`
	CurrentSkin string    `json:"current_skin"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PetLevel struct {
	LevelNumber    int       `json:"level_number"`
	Name           string    `json:"name"`
	RequiredGrowth int       `json:"required_growth"`
	UnlockMetadata string    `json:"unlock_metadata"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type LevelProgress struct {
	Current         PetLevel  `json:"current"`
	Next            *PetLevel `json:"next,omitempty"`
	GrowthValue     int       `json:"growth_value"`
	GrowthToNext    int       `json:"growth_to_next"`
	ProgressPercent int       `json:"progress_percent"`
}

type PetSkin struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Rarity       string    `json:"rarity"`
	AssetPath    string    `json:"asset_path"`
	Description  string    `json:"description"`
	UnlockLevel  int       `json:"unlock_level"`
	UnlockGrowth int       `json:"unlock_growth"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type PetSkinStatus struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Rarity          string `json:"rarity"`
	AssetPath       string `json:"asset_path"`
	Description     string `json:"description"`
	Unlocked        bool   `json:"unlocked"`
	Current         bool   `json:"current"`
	UnlockCondition string `json:"unlock_condition"`
}

type TeamContributionSummary struct {
	TotalGrowthContributed int  `json:"total_growth_contributed"`
	FeedEventCount         int  `json:"feed_event_count"`
	TaskCompletionCount    int  `json:"task_completion_count"`
	ParticipantCount       int  `json:"participant_count"`
	RankingDisplayEnabled  bool `json:"ranking_display_enabled"`
}

type AdminReportSummary struct {
	DailyActiveUsers       int           `json:"daily_active_users"`
	TaskCompletionCount    int           `json:"task_completion_count"`
	FeedEventCount         int           `json:"feed_event_count"`
	ParticipationRate      int           `json:"participation_rate"`
	TotalGrowthContributed int           `json:"total_growth_contributed"`
	PetGrowthProgress      LevelProgress `json:"pet_growth_progress"`
	Empty                  bool          `json:"empty"`
}

type FeedEvent struct {
	ID                  string    `json:"id"`
	PetID               string    `json:"pet_id"`
	UserID              string    `json:"user_id"`
	FeedAmount          int       `json:"feed_amount"`
	GrowthDelta         int       `json:"growth_delta"`
	WalletTransactionID string    `json:"wallet_transaction_id"`
	CreatedAt           time.Time `json:"created_at"`
}

type ActivityEvent struct {
	ID         string    `json:"id"`
	TeamID     string    `json:"team_id"`
	UserID     string    `json:"-"`
	EventType  string    `json:"event_type"`
	ResourceID string    `json:"resource_id"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}
