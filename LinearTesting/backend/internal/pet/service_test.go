package pet

import (
	"context"
	"errors"
	"testing"

	"aoa-user-mvp/backend/internal/audit"
	"aoa-user-mvp/backend/internal/notification"
	"aoa-user-mvp/backend/internal/wallet"
)

func TestService_FeedPetUpdatesPetWalletAndActivity(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewFeedService(petRepo, walletService)

	created, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"})
	if err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}
	if _, _, err := walletService.Credit(
		ctx,
		"usr_000001",
		wallet.ResourceFeed,
		2,
		"test reward",
		"test",
		"reward_000001",
	); err != nil {
		t.Fatalf("wallet Credit error = %v", err)
	}

	result, details, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 1})
	if err != nil {
		t.Fatalf("FeedPet error = %v, details = %v", err, details)
	}
	if result.Pet.ID != created.ID {
		t.Fatalf("pet ID = %q, want %q", result.Pet.ID, created.ID)
	}
	if result.Pet.GrowthValue != 20 {
		t.Fatalf("growth = %d, want 20", result.Pet.GrowthValue)
	}
	if result.Pet.Level != 1 {
		t.Fatalf("level = %d, want 1", result.Pet.Level)
	}
	if result.Pet.Mood != moodHappy {
		t.Fatalf("mood = %q, want %q", result.Pet.Mood, moodHappy)
	}
	if result.Wallet.FeedBalance != 1 {
		t.Fatalf("feed balance = %d, want 1", result.Wallet.FeedBalance)
	}
	if result.FeedEvent.WalletTransactionID != result.Transaction.ID {
		t.Fatalf("feed event wallet transaction = %q, want %q", result.FeedEvent.WalletTransactionID, result.Transaction.ID)
	}

	activity, err := service.Activity(ctx)
	if err != nil {
		t.Fatalf("Activity error = %v", err)
	}
	if len(activity) != 2 {
		t.Fatalf("activity events = %d, want 2", len(activity))
	}
	if activity[0].EventType != "pet_fed" || activity[0].ResourceID != result.FeedEvent.ID {
		t.Fatalf("activity event = %#v", activity[0])
	}
	if activity[1].EventType != "pet_created" || activity[1].ResourceID != created.ID {
		t.Fatalf("created activity event = %#v", activity[1])
	}
}

func TestService_FeedPetWritesAuditLog(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	auditRepo := audit.NewMemoryRepository()
	service := NewAuditedFeedService(petRepo, walletService, auditRepo)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}
	if _, _, err := walletService.Credit(
		ctx,
		"usr_000001",
		wallet.ResourceFeed,
		1,
		"test reward",
		"test",
		"reward_000001",
	); err != nil {
		t.Fatalf("wallet Credit error = %v", err)
	}

	result, details, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 1})
	if err != nil {
		t.Fatalf("FeedPet error = %v, details = %v", err, details)
	}

	entries, err := auditRepo.List(ctx, 10)
	if err != nil {
		t.Fatalf("audit List error = %v", err)
	}
	if len(entries) != 1 {
		t.Fatalf("audit entries = %d, want 1", len(entries))
	}
	if entries[0].Action != "pet_fed" {
		t.Fatalf("audit action = %q, want pet_fed", entries[0].Action)
	}
	if entries[0].ResourceID != result.FeedEvent.ID {
		t.Fatalf("audit resource = %q, want %q", entries[0].ResourceID, result.FeedEvent.ID)
	}
	if entries[0].Metadata["wallet_transaction_id"] != result.Transaction.ID {
		t.Fatalf("audit wallet transaction = %q, want %q", entries[0].Metadata["wallet_transaction_id"], result.Transaction.ID)
	}
}

func TestService_FeedPetCreatesUpgradeActivityOnce(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewFeedService(petRepo, walletService)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}
	if _, _, err := walletService.Credit(
		ctx,
		"usr_000001",
		wallet.ResourceFeed,
		6,
		"test reward",
		"test",
		"reward_000001",
	); err != nil {
		t.Fatalf("wallet Credit error = %v", err)
	}

	first, details, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 5})
	if err != nil {
		t.Fatalf("first FeedPet error = %v, details = %v", err, details)
	}
	if first.Pet.Level != 2 {
		t.Fatalf("first level = %d, want 2", first.Pet.Level)
	}
	if first.UpgradeActivity == nil {
		t.Fatal("first feed should return upgrade activity")
	}
	if first.UpgradeActivity.EventType != "pet_upgraded" {
		t.Fatalf("upgrade event type = %q, want pet_upgraded", first.UpgradeActivity.EventType)
	}

	second, details, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 1})
	if err != nil {
		t.Fatalf("second FeedPet error = %v, details = %v", err, details)
	}
	if second.Pet.Level != 2 {
		t.Fatalf("second level = %d, want 2", second.Pet.Level)
	}
	if second.UpgradeActivity != nil {
		t.Fatalf("second feed should not repeat upgrade activity: %#v", second.UpgradeActivity)
	}

	activity, err := service.Activity(ctx)
	if err != nil {
		t.Fatalf("Activity error = %v", err)
	}
	if countEvents(activity, "pet_upgraded") != 1 {
		t.Fatalf("upgrade event count = %d, want 1; activity = %#v", countEvents(activity, "pet_upgraded"), activity)
	}
}

func TestService_FeedPetSendsNotifications(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	sender := notification.NewMemorySender()
	service := NewObservedFeedService(petRepo, walletService, nil, sender)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}
	if _, _, err := walletService.Credit(
		ctx,
		"usr_000001",
		wallet.ResourceFeed,
		5,
		"test reward",
		"test",
		"reward_000001",
	); err != nil {
		t.Fatalf("wallet Credit error = %v", err)
	}

	if _, _, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 5}); err != nil {
		t.Fatalf("FeedPet error = %v", err)
	}

	events := sender.Events()
	if len(events) != 2 {
		t.Fatalf("notifications = %d, want 2", len(events))
	}
	if events[0].EventType != notification.EventPetUpgraded {
		t.Fatalf("latest notification = %q, want pet_upgraded", events[0].EventType)
	}
	if events[1].EventType != notification.EventPetFed {
		t.Fatalf("first notification = %q, want pet_fed", events[1].EventType)
	}
}

func TestService_CreateDefaultPetRecordsActivity(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())
	created, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"})
	if err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}

	activity, err := service.Activity(ctx)
	if err != nil {
		t.Fatalf("Activity error = %v", err)
	}
	if len(activity) != 1 {
		t.Fatalf("activity events = %d, want 1", len(activity))
	}
	if activity[0].EventType != "pet_created" {
		t.Fatalf("event type = %q, want pet_created", activity[0].EventType)
	}
	if activity[0].ResourceID != created.ID {
		t.Fatalf("resource id = %q, want %q", activity[0].ResourceID, created.ID)
	}
	if activity[0].UserID != "" {
		t.Fatalf("activity user id = %q, want empty system event", activity[0].UserID)
	}
}

func TestLevelForGrowthThresholds(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		growth int
		want   int
	}{
		{name: "negative", growth: -1, want: 1},
		{name: "zero", growth: 0, want: 1},
		{name: "before_level_two", growth: 99, want: 1},
		{name: "at_level_two", growth: 100, want: 2},
		{name: "before_level_three", growth: 199, want: 2},
		{name: "at_level_three", growth: 200, want: 3},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if got := levelForGrowth(tt.growth, nil); got != tt.want {
				t.Fatalf("levelForGrowth(%d) = %d, want %d", tt.growth, got, tt.want)
			}
		})
	}
}

func TestService_UsesConfiguredLevelThresholds(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	repo := NewMemoryRepository()
	if err := repo.ReplaceLevels(ctx, []PetLevel{
		{LevelNumber: 1, Name: "Tiny", RequiredGrowth: 0},
		{LevelNumber: 2, Name: "Growing", RequiredGrowth: 50},
		{LevelNumber: 3, Name: "Big", RequiredGrowth: 150},
	}); err != nil {
		t.Fatalf("ReplaceLevels error = %v", err)
	}

	service := NewService(repo)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}

	pet, err := repo.FindByTeamID(ctx, defaultTeamID)
	if err != nil {
		t.Fatalf("FindByTeamID error = %v", err)
	}
	pet.GrowthValue = 50
	if _, err := repo.UpdateState(ctx, pet); err != nil {
		t.Fatalf("UpdateState error = %v", err)
	}

	current, err := service.CurrentPet(ctx)
	if err != nil {
		t.Fatalf("CurrentPet error = %v", err)
	}
	if current.Level != 2 {
		t.Fatalf("configured level = %d, want 2", current.Level)
	}
}

func TestService_CurrentLevelProgressReturnsNextLevel(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	repo := NewMemoryRepository()
	service := NewService(repo)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}

	pet, err := repo.FindByTeamID(ctx, defaultTeamID)
	if err != nil {
		t.Fatalf("FindByTeamID error = %v", err)
	}
	pet.GrowthValue = 120
	if _, err := repo.UpdateState(ctx, pet); err != nil {
		t.Fatalf("UpdateState error = %v", err)
	}

	progress, err := service.CurrentLevelProgress(ctx)
	if err != nil {
		t.Fatalf("CurrentLevelProgress error = %v", err)
	}
	if progress.Current.LevelNumber != 2 {
		t.Fatalf("current level = %d, want 2", progress.Current.LevelNumber)
	}
	if progress.Next == nil || progress.Next.LevelNumber != 3 {
		t.Fatalf("next level = %#v, want level 3", progress.Next)
	}
	if progress.GrowthToNext != 80 {
		t.Fatalf("growth to next = %d, want 80", progress.GrowthToNext)
	}
	if progress.ProgressPercent != 20 {
		t.Fatalf("progress percent = %d, want 20", progress.ProgressPercent)
	}
}

func TestService_SkinsResolveUnlockedAndLockedStatus(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	repo := NewMemoryRepository()
	service := NewService(repo)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}

	pet, err := repo.FindByTeamID(ctx, defaultTeamID)
	if err != nil {
		t.Fatalf("FindByTeamID error = %v", err)
	}
	pet.GrowthValue = 120
	if _, err := repo.UpdateState(ctx, pet); err != nil {
		t.Fatalf("UpdateState error = %v", err)
	}

	skins, err := service.Skins(ctx)
	if err != nil {
		t.Fatalf("Skins error = %v", err)
	}

	defaultSkin := findSkinStatus(t, skins, "default")
	if !defaultSkin.Unlocked {
		t.Fatalf("default skin should be unlocked: %#v", defaultSkin)
	}
	if !defaultSkin.Current {
		t.Fatalf("default skin should be current: %#v", defaultSkin)
	}
	if defaultSkin.AssetPath == "" || defaultSkin.Name == "" || defaultSkin.Rarity == "" {
		t.Fatalf("default skin should include display fields: %#v", defaultSkin)
	}

	sunnyCape := findSkinStatus(t, skins, "sunny-cape")
	if !sunnyCape.Unlocked {
		t.Fatalf("sunny cape should be unlocked at growth 120: %#v", sunnyCape)
	}

	rocketPack := findSkinStatus(t, skins, "rocket-pack")
	if rocketPack.Unlocked {
		t.Fatalf("rocket pack should still be locked: %#v", rocketPack)
	}
	if rocketPack.UnlockCondition != "Reach level 3 or 200 growth" {
		t.Fatalf("rocket condition = %q", rocketPack.UnlockCondition)
	}
}

func TestService_TeamContributionSummaryUsesAggregateMetrics(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewFeedService(petRepo, walletService)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}
	if _, _, err := walletService.Credit(
		ctx,
		"usr_000001",
		wallet.ResourceFeed,
		1,
		"test reward",
		"test",
		"reward_000001",
	); err != nil {
		t.Fatalf("wallet Credit error = %v", err)
	}
	if _, _, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 1}); err != nil {
		t.Fatalf("FeedPet error = %v", err)
	}
	if _, err := petRepo.RecordActivity(ctx, ActivityEvent{
		TeamID:     defaultTeamID,
		UserID:     "usr_000002",
		EventType:  "task_reward_claimed",
		ResourceID: "claim_000001",
		Message:    "Completed a team task",
	}); err != nil {
		t.Fatalf("RecordActivity error = %v", err)
	}

	summary, err := service.TeamContributionSummary(ctx)
	if err != nil {
		t.Fatalf("TeamContributionSummary error = %v", err)
	}
	if summary.TotalGrowthContributed != 20 {
		t.Fatalf("total growth = %d, want 20", summary.TotalGrowthContributed)
	}
	if summary.FeedEventCount != 1 {
		t.Fatalf("feed events = %d, want 1", summary.FeedEventCount)
	}
	if summary.TaskCompletionCount != 1 {
		t.Fatalf("task completions = %d, want 1", summary.TaskCompletionCount)
	}
	if summary.ParticipantCount != 2 {
		t.Fatalf("participants = %d, want 2", summary.ParticipantCount)
	}
	if summary.RankingDisplayEnabled {
		t.Fatal("ranking display should be disabled by default")
	}
}

func TestService_AdminReportSummaryWorksBeforeActivityExists(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())

	report, err := service.AdminReportSummary(ctx)
	if err != nil {
		t.Fatalf("AdminReportSummary error = %v", err)
	}
	if !report.Empty {
		t.Fatal("empty report should be marked empty")
	}
	if report.DailyActiveUsers != 0 || report.FeedEventCount != 0 || report.TaskCompletionCount != 0 {
		t.Fatalf("empty report should have zero metrics: %#v", report)
	}
	if report.PetGrowthProgress.Current.LevelNumber != 1 {
		t.Fatalf("empty progress current level = %d, want 1", report.PetGrowthProgress.Current.LevelNumber)
	}
}

func TestService_AdminReportSummaryUsesAggregateMetrics(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewFeedService(petRepo, walletService)
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}
	if _, _, err := walletService.Credit(
		ctx,
		"usr_000001",
		wallet.ResourceFeed,
		1,
		"test reward",
		"test",
		"reward_000001",
	); err != nil {
		t.Fatalf("wallet Credit error = %v", err)
	}
	if _, _, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 1}); err != nil {
		t.Fatalf("FeedPet error = %v", err)
	}

	report, err := service.AdminReportSummary(ctx)
	if err != nil {
		t.Fatalf("AdminReportSummary error = %v", err)
	}
	if report.Empty {
		t.Fatal("report should not be empty after activity")
	}
	if report.DailyActiveUsers != 1 {
		t.Fatalf("daily active users = %d, want 1", report.DailyActiveUsers)
	}
	if report.FeedEventCount != 1 {
		t.Fatalf("feed events = %d, want 1", report.FeedEventCount)
	}
	if report.ParticipationRate != 100 {
		t.Fatalf("participation rate = %d, want 100", report.ParticipationRate)
	}
}

func TestApplyGrowthAndMoodRules(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		growth      int
		recentFeeds int
		wantGrowth  int
		wantLevel   int
		wantMood    string
	}{
		{name: "new_pet_default_happy", growth: 0, recentFeeds: 0, wantGrowth: 0, wantLevel: 1, wantMood: moodHappy},
		{name: "negative_growth_is_safe", growth: -20, recentFeeds: 0, wantGrowth: 0, wantLevel: 1, wantMood: moodHappy},
		{name: "no_recent_feed_after_growth", growth: 100, recentFeeds: 0, wantGrowth: 100, wantLevel: 2, wantMood: moodHungry},
		{name: "one_recent_feed", growth: 120, recentFeeds: 1, wantGrowth: 120, wantLevel: 2, wantMood: moodHappy},
		{name: "several_recent_feeds", growth: 240, recentFeeds: 3, wantGrowth: 240, wantLevel: 3, wantMood: moodExcited},
		{name: "too_many_recent_feeds", growth: 300, recentFeeds: 5, wantGrowth: 300, wantLevel: 4, wantMood: moodTired},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := applyGrowthAndMoodRules(Pet{GrowthValue: tt.growth}, tt.recentFeeds, nil)
			if got.GrowthValue != tt.wantGrowth {
				t.Fatalf("growth = %d, want %d", got.GrowthValue, tt.wantGrowth)
			}
			if got.Level != tt.wantLevel {
				t.Fatalf("level = %d, want %d", got.Level, tt.wantLevel)
			}
			if got.Mood != tt.wantMood {
				t.Fatalf("mood = %q, want %q", got.Mood, tt.wantMood)
			}
		})
	}
}

func findSkinStatus(t *testing.T, skins []PetSkinStatus, id string) PetSkinStatus {
	t.Helper()

	for _, skin := range skins {
		if skin.ID == id {
			return skin
		}
	}
	t.Fatalf("skin %q not found in %#v", id, skins)
	return PetSkinStatus{}
}

func countEvents(events []ActivityEvent, eventType string) int {
	var count int
	for _, event := range events {
		if event.EventType == eventType {
			count++
		}
	}
	return count
}

func TestService_FeedPetRejectsInsufficientBalance(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	petRepo := NewMemoryRepository()
	service := NewFeedService(petRepo, wallet.NewService(wallet.NewMemoryRepository()))
	if _, _, err := service.CreateDefaultPet(ctx, CreatePetRequest{Name: "Sprout", Template: "mint-bean"}); err != nil {
		t.Fatalf("CreateDefaultPet error = %v", err)
	}

	_, details, err := service.FeedPet(ctx, "usr_000001", FeedPetRequest{Amount: 1})
	if !errors.Is(err, wallet.ErrInsufficientBalance) {
		t.Fatalf("FeedPet error = %v, want %v; details = %v", err, wallet.ErrInsufficientBalance, details)
	}

	found, err := service.CurrentPet(ctx)
	if err != nil {
		t.Fatalf("CurrentPet error = %v", err)
	}
	if found.GrowthValue != 0 {
		t.Fatalf("growth after failed feed = %d, want 0", found.GrowthValue)
	}
}
