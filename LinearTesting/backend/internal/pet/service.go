package pet

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"aoa-user-mvp/backend/internal/audit"
	"aoa-user-mvp/backend/internal/notification"
	"aoa-user-mvp/backend/internal/wallet"
)

const (
	defaultTeamID   = "team_default"
	defaultTeamName = "AoAo Team"

	feedGrowth = 20

	moodHappy   = "happy"
	moodHungry  = "hungry"
	moodExcited = "excited"
	moodTired   = "tired"
)

var ErrInvalidFeedRequest = errors.New("invalid feed request")

type Service struct {
	repo   Repository
	wallet Wallet
	audit  Auditor
	notify Notifier
}

type Auditor interface {
	Record(ctx context.Context, input audit.EntryInput) (audit.Entry, error)
}

type Wallet interface {
	Debit(
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

type CreatePetRequest struct {
	TeamName string `json:"team_name"`
	Name     string `json:"name"`
	Template string `json:"template"`
}

type FeedPetRequest struct {
	Amount int `json:"amount"`
}

type FeedPetResult struct {
	Pet             Pet                `json:"pet"`
	Wallet          wallet.Wallet      `json:"wallet"`
	Transaction     wallet.Transaction `json:"transaction"`
	FeedEvent       FeedEvent          `json:"feed_event"`
	Activity        ActivityEvent      `json:"activity"`
	UpgradeActivity *ActivityEvent     `json:"upgrade_activity,omitempty"`
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func NewFeedService(repo Repository, wallet Wallet) *Service {
	return NewAuditedFeedService(repo, wallet, nil)
}

func NewAuditedFeedService(repo Repository, wallet Wallet, auditor Auditor) *Service {
	return NewObservedFeedService(repo, wallet, auditor, nil)
}

func NewObservedFeedService(
	repo Repository,
	wallet Wallet,
	auditor Auditor,
	notifier Notifier,
) *Service {
	return &Service{repo: repo, wallet: wallet, audit: auditor, notify: notifier}
}

func (s *Service) CurrentPet(ctx context.Context) (Pet, error) {
	if _, err := s.repo.EnsureTeam(ctx, defaultTeamID, defaultTeamName); err != nil {
		return Pet{}, err
	}

	found, err := s.repo.FindByTeamID(ctx, defaultTeamID)
	if err != nil {
		return Pet{}, err
	}

	activity, err := s.repo.ListActivity(ctx, defaultTeamID)
	if err != nil {
		return Pet{}, err
	}

	levels, err := s.repo.ListLevels(ctx)
	if err != nil {
		return Pet{}, err
	}

	return applyGrowthAndMoodRules(found, recentFeedCount(activity), levels), nil
}

func (s *Service) CreateDefaultPet(ctx context.Context, req CreatePetRequest) (Pet, []string, error) {
	teamName := normalizeName(req.TeamName, defaultTeamName)
	if _, err := s.repo.EnsureTeam(ctx, defaultTeamID, teamName); err != nil {
		return Pet{}, nil, err
	}

	created, err := s.repo.CreatePet(ctx, defaultTeamID, req.Name, req.Template)
	if errors.Is(err, ErrPetAlreadyExist) {
		return Pet{}, []string{"team already has a pet"}, ErrPetAlreadyExist
	}
	if err != nil {
		return Pet{}, nil, err
	}

	if _, err := s.repo.RecordActivity(ctx, ActivityEvent{
		TeamID:     defaultTeamID,
		UserID:     "",
		EventType:  "pet_created",
		ResourceID: created.ID,
		Message:    fmt.Sprintf("%s joined the team nest. Small wins can start feeding it now.", created.Name),
	}); err != nil {
		return Pet{}, nil, err
	}

	return created, nil, nil
}

func (s *Service) FeedPet(
	ctx context.Context,
	userID string,
	req FeedPetRequest,
) (FeedPetResult, []string, error) {
	if s.wallet == nil {
		return FeedPetResult{}, nil, errors.New("wallet service unavailable")
	}

	userID = strings.TrimSpace(userID)
	var details []string
	if userID == "" {
		details = append(details, "user id is required")
	}
	if req.Amount == 0 {
		req.Amount = 1
	}
	if req.Amount < 0 {
		details = append(details, "amount must be greater than zero")
	}
	if len(details) > 0 {
		return FeedPetResult{}, details, ErrInvalidFeedRequest
	}

	if _, err := s.repo.EnsureTeam(ctx, defaultTeamID, defaultTeamName); err != nil {
		return FeedPetResult{}, nil, err
	}
	current, err := s.repo.FindByTeamID(ctx, defaultTeamID)
	if err != nil {
		return FeedPetResult{}, nil, err
	}
	levels, err := s.repo.ListLevels(ctx)
	if err != nil {
		return FeedPetResult{}, nil, err
	}
	current = applyGrowthAndMoodRules(current, 0, levels)
	oldLevel := current.Level

	debit, debitDetails, err := s.wallet.Debit(
		ctx,
		userID,
		wallet.ResourceFeed,
		req.Amount,
		"feed team pet",
		"pet_feed",
		current.ID,
	)
	if err != nil {
		return FeedPetResult{}, debitDetails, err
	}

	growthDelta := req.Amount * feedGrowth
	current.GrowthValue += growthDelta
	current = applyGrowthAndMoodRules(current, 1, levels)
	updated, err := s.repo.UpdateState(ctx, current)
	if err != nil {
		return FeedPetResult{}, nil, err
	}

	feedEvent, activity, err := s.repo.RecordFeedEvent(ctx, FeedEvent{
		PetID:               updated.ID,
		UserID:              userID,
		FeedAmount:          req.Amount,
		GrowthDelta:         growthDelta,
		WalletTransactionID: debit.Transaction.ID,
	})
	if err != nil {
		return FeedPetResult{}, nil, err
	}

	var upgradeActivity *ActivityEvent
	if updated.Level > oldLevel {
		recorded, err := s.repo.RecordActivity(ctx, ActivityEvent{
			TeamID:     defaultTeamID,
			UserID:     userID,
			EventType:  "pet_upgraded",
			ResourceID: updated.ID,
			Message:    upgradeMessage(updated, levels),
		})
		if err != nil {
			return FeedPetResult{}, nil, err
		}
		upgradeActivity = &recorded
	}

	if s.audit != nil {
		if _, err := s.audit.Record(ctx, audit.EntryInput{
			ActorUserID:  userID,
			Action:       "pet_fed",
			ResourceType: "feed_event",
			ResourceID:   feedEvent.ID,
			Metadata: map[string]string{
				"pet_id":                updated.ID,
				"feed_amount":           strconv.Itoa(req.Amount),
				"growth_delta":          strconv.Itoa(growthDelta),
				"wallet_transaction_id": debit.Transaction.ID,
			},
		}); err != nil {
			return FeedPetResult{}, nil, err
		}
	}
	if err := s.notifyPetFed(ctx, userID, updated, req.Amount, growthDelta); err != nil {
		return FeedPetResult{}, nil, err
	}
	if upgradeActivity != nil {
		if err := s.notifyPetUpgraded(ctx, userID, updated); err != nil {
			return FeedPetResult{}, nil, err
		}
	}

	return FeedPetResult{
		Pet:             updated,
		Wallet:          debit.Wallet,
		Transaction:     debit.Transaction,
		FeedEvent:       feedEvent,
		Activity:        activity,
		UpgradeActivity: upgradeActivity,
	}, nil, nil
}

func (s *Service) Activity(ctx context.Context) ([]ActivityEvent, error) {
	return s.repo.ListActivity(ctx, defaultTeamID)
}

func (s *Service) TeamContributionSummary(ctx context.Context) (TeamContributionSummary, error) {
	pet, err := s.CurrentPet(ctx)
	if err != nil {
		return TeamContributionSummary{}, err
	}

	activity, err := s.repo.ListActivity(ctx, defaultTeamID)
	if err != nil {
		return TeamContributionSummary{}, err
	}

	return summarizeTeamContribution(pet, activity), nil
}

func (s *Service) AdminReportSummary(ctx context.Context) (AdminReportSummary, error) {
	pet, err := s.CurrentPet(ctx)
	empty := false
	if errors.Is(err, ErrPetNotFound) {
		empty = true
		pet = Pet{Level: 1, GrowthValue: 0}
	} else if err != nil {
		return AdminReportSummary{}, err
	}

	activity, err := s.repo.ListActivity(ctx, defaultTeamID)
	if err != nil {
		return AdminReportSummary{}, err
	}
	levels, err := s.repo.ListLevels(ctx)
	if err != nil {
		return AdminReportSummary{}, err
	}

	contribution := summarizeTeamContribution(pet, activity)
	rate := 0
	if contribution.ParticipantCount > 0 {
		rate = 100
	}

	return AdminReportSummary{
		DailyActiveUsers:       contribution.ParticipantCount,
		TaskCompletionCount:    contribution.TaskCompletionCount,
		FeedEventCount:         contribution.FeedEventCount,
		ParticipationRate:      rate,
		TotalGrowthContributed: contribution.TotalGrowthContributed,
		PetGrowthProgress:      resolveLevelProgress(pet.GrowthValue, levels),
		Empty:                  empty && len(activity) == 0,
	}, nil
}

func (s *Service) Skins(ctx context.Context) ([]PetSkinStatus, error) {
	pet, err := s.CurrentPet(ctx)
	if err != nil {
		return nil, err
	}

	skins, err := s.repo.ListSkins(ctx)
	if err != nil {
		return nil, err
	}

	statuses := make([]PetSkinStatus, 0, len(skins))
	for _, skin := range skins {
		statuses = append(statuses, skinStatus(pet, skin))
	}
	return statuses, nil
}

func (s *Service) CurrentLevelProgress(ctx context.Context) (LevelProgress, error) {
	pet, err := s.CurrentPet(ctx)
	if err != nil {
		return LevelProgress{}, err
	}

	levels, err := s.repo.ListLevels(ctx)
	if err != nil {
		return LevelProgress{}, err
	}
	return resolveLevelProgress(pet.GrowthValue, levels), nil
}

func applyGrowthAndMoodRules(pet Pet, recentFeeds int, levels []PetLevel) Pet {
	pet.GrowthValue = normalizeGrowth(pet.GrowthValue)
	pet.Level = levelForGrowth(pet.GrowthValue, levels)
	pet.Mood = moodForState(pet.GrowthValue, recentFeeds)
	return pet
}

func normalizeGrowth(growth int) int {
	if growth < 0 {
		return 0
	}
	return growth
}

func levelForGrowth(growth int, levels []PetLevel) int {
	return resolveLevelProgress(growth, levels).Current.LevelNumber
}

func resolveLevelProgress(growth int, levels []PetLevel) LevelProgress {
	growth = normalizeGrowth(growth)
	levels = normalizeLevels(levels)

	current := levels[0]
	var next *PetLevel
	for _, level := range levels {
		if growth >= level.RequiredGrowth {
			current = level
			continue
		}
		candidate := level
		next = &candidate
		break
	}

	progress := LevelProgress{
		Current:     current,
		Next:        next,
		GrowthValue: growth,
	}
	if next == nil {
		progress.ProgressPercent = 100
		return progress
	}

	needed := next.RequiredGrowth - current.RequiredGrowth
	earned := growth - current.RequiredGrowth
	progress.GrowthToNext = next.RequiredGrowth - growth
	if needed <= 0 {
		progress.ProgressPercent = 100
		return progress
	}

	progress.ProgressPercent = earned * 100 / needed
	if progress.ProgressPercent < 0 {
		progress.ProgressPercent = 0
	}
	if progress.ProgressPercent > 100 {
		progress.ProgressPercent = 100
	}
	return progress
}

func summarizeTeamContribution(pet Pet, events []ActivityEvent) TeamContributionSummary {
	participants := map[string]bool{}
	summary := TeamContributionSummary{
		TotalGrowthContributed: pet.GrowthValue,
		RankingDisplayEnabled:  false,
	}

	for _, event := range events {
		if event.UserID != "" {
			participants[event.UserID] = true
		}

		switch event.EventType {
		case "pet_fed":
			summary.FeedEventCount++
		case "task_reward_claimed":
			summary.TaskCompletionCount++
		}
	}

	summary.ParticipantCount = len(participants)
	return summary
}

func skinStatus(pet Pet, skin PetSkin) PetSkinStatus {
	unlocked := skinUnlocked(pet, skin)
	condition := ""
	if !unlocked {
		condition = skinUnlockCondition(skin)
	}

	return PetSkinStatus{
		ID:              skin.ID,
		Name:            skin.Name,
		Rarity:          skin.Rarity,
		AssetPath:       skin.AssetPath,
		Description:     skin.Description,
		Unlocked:        unlocked,
		Current:         skin.ID == pet.CurrentSkin,
		UnlockCondition: condition,
	}
}

func skinUnlocked(pet Pet, skin PetSkin) bool {
	levelUnlocked := skin.UnlockLevel <= 1 || pet.Level >= skin.UnlockLevel
	growthUnlocked := skin.UnlockGrowth <= 0 || pet.GrowthValue >= skin.UnlockGrowth
	return levelUnlocked || growthUnlocked
}

func skinUnlockCondition(skin PetSkin) string {
	switch {
	case skin.UnlockLevel > 1 && skin.UnlockGrowth > 0:
		return fmt.Sprintf("Reach level %d or %d growth", skin.UnlockLevel, skin.UnlockGrowth)
	case skin.UnlockLevel > 1:
		return fmt.Sprintf("Reach level %d", skin.UnlockLevel)
	case skin.UnlockGrowth > 0:
		return fmt.Sprintf("Reach %d growth", skin.UnlockGrowth)
	default:
		return "Unlocked by default"
	}
}

func upgradeMessage(pet Pet, levels []PetLevel) string {
	levelName := levelNameForNumber(pet.Level, levels)
	return fmt.Sprintf("%s reached level %d: %s", pet.Name, pet.Level, levelName)
}

func levelNameForNumber(levelNumber int, levels []PetLevel) string {
	for _, level := range normalizeLevels(levels) {
		if level.LevelNumber == levelNumber {
			return level.Name
		}
	}
	return fmt.Sprintf("Level %d", levelNumber)
}

func (s *Service) notifyPetFed(
	ctx context.Context,
	userID string,
	pet Pet,
	feedAmount int,
	growthDelta int,
) error {
	if s.notify == nil {
		return nil
	}

	_, err := s.notify.Send(ctx, notification.EventInput{
		EventType:   notification.EventPetFed,
		UserID:      userID,
		Title:       "Team pet fed",
		Message:     fmt.Sprintf("%s enjoyed %d feed and gained %d energy.", pet.Name, feedAmount, growthDelta),
		NonCritical: true,
		Metadata: map[string]string{
			"pet_id":       pet.ID,
			"feed_amount":  strconv.Itoa(feedAmount),
			"growth_delta": strconv.Itoa(growthDelta),
		},
	})
	return err
}

func (s *Service) notifyPetUpgraded(ctx context.Context, userID string, pet Pet) error {
	if s.notify == nil {
		return nil
	}

	_, err := s.notify.Send(ctx, notification.EventInput{
		EventType:   notification.EventPetUpgraded,
		UserID:      userID,
		Title:       "New mascot level unlocked",
		Message:     fmt.Sprintf("%s reached level %d. The team unlocked a new little milestone.", pet.Name, pet.Level),
		NonCritical: false,
		Metadata: map[string]string{
			"pet_id": pet.ID,
			"level":  strconv.Itoa(pet.Level),
		},
	})
	return err
}

func moodForState(growth int, recentFeeds int) string {
	switch {
	case recentFeeds < 0:
		return moodHappy
	case recentFeeds == 0 && normalizeGrowth(growth) == 0:
		return moodHappy
	case recentFeeds == 0:
		return moodHungry
	case recentFeeds == 1:
		return moodHappy
	case recentFeeds <= 4:
		return moodExcited
	default:
		return moodTired
	}
}

func recentFeedCount(events []ActivityEvent) int {
	count := 0
	for _, event := range events {
		if event.EventType == "pet_fed" {
			count++
		}
	}
	return count
}
