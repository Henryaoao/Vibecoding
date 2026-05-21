package task

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"aoa-user-mvp/backend/internal/audit"
	"aoa-user-mvp/backend/internal/notification"
	"aoa-user-mvp/backend/internal/wallet"
)

func TestService_ListActiveTemplatesHidesDisabled(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())

	active, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Clock in",
		Description:  "Start the day on schedule.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate active error = %v", err)
	}
	disabled, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Legacy task",
		Description:  "No longer used.",
		RewardType:   RewardFeed,
		RewardAmount: 1,
		DailyLimit:   1,
		Status:       StatusDisabled,
	})
	if err != nil {
		t.Fatalf("CreateTemplate disabled error = %v", err)
	}

	templates, err := service.ListActiveTemplates(ctx)
	if err != nil {
		t.Fatalf("ListActiveTemplates error = %v", err)
	}

	if !containsTemplate(templates, active.ID) {
		t.Fatalf("active template %q was not listed", active.ID)
	}
	if containsTemplate(templates, disabled.ID) {
		t.Fatalf("disabled template %q should not be listed", disabled.ID)
	}
}

func TestService_DisableTemplateRemovesFromActiveList(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())
	created, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Submit daily report",
		Description:  "Share concise progress notes.",
		RewardType:   RewardFeed,
		RewardAmount: 1,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	disabled, _, err := service.DisableTemplate(ctx, created.ID)
	if err != nil {
		t.Fatalf("DisableTemplate error = %v", err)
	}
	if disabled.Status != StatusDisabled {
		t.Fatalf("disabled.Status = %q, want %q", disabled.Status, StatusDisabled)
	}

	templates, err := service.ListActiveTemplates(ctx)
	if err != nil {
		t.Fatalf("ListActiveTemplates error = %v", err)
	}
	if containsTemplate(templates, created.ID) {
		t.Fatalf("disabled template %q should not be listed", created.ID)
	}
}

func TestService_ValidatesRewardAndDailyLimit(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())

	_, details, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Broken task",
		Description:  "Invalid reward settings.",
		RewardType:   "coins",
		RewardAmount: 0,
		DailyLimit:   -1,
		Status:       StatusActive,
	})
	if !errors.Is(err, ErrInvalidTemplate) {
		t.Fatalf("CreateTemplate error = %v, want %v", err, ErrInvalidTemplate)
	}
	if len(details) != 3 {
		t.Fatalf("validation details = %v, want 3 issues", details)
	}
}

func TestService_RejectsExcessiveRewardRules(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())

	_, details, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Excessive task",
		Description:  "Unsafe reward settings.",
		RewardType:   RewardEnergy,
		RewardAmount: maxRewardAmount + 1,
		DailyLimit:   maxDailyLimit + 1,
		Status:       StatusActive,
	})
	if !errors.Is(err, ErrInvalidTemplate) {
		t.Fatalf("CreateTemplate error = %v, want %v", err, ErrInvalidTemplate)
	}
	if len(details) != 2 {
		t.Fatalf("validation details = %v, want 2 issues", details)
	}
}

func TestMemoryRepository_SeedsDemoTemplates(t *testing.T) {
	t.Parallel()

	templates, err := NewMemoryRepository().ListActiveTemplates(context.Background())
	if err != nil {
		t.Fatalf("ListActiveTemplates error = %v", err)
	}
	if len(templates) != len(DemoTemplateInputs()) {
		t.Fatalf("seeded templates = %d, want %d", len(templates), len(DemoTemplateInputs()))
	}
}

func TestService_ClaimRewardGrantsReward(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Clock in",
		Description:  "Start on schedule.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	result, details, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		template.ID,
		"claim-key-1",
		time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC),
	)
	if err != nil {
		t.Fatalf("ClaimRewardAt error = %v, details = %v", err, details)
	}
	if result.Wallet.EnergyBalance != 10 {
		t.Fatalf("energy balance = %d, want 10", result.Wallet.EnergyBalance)
	}
	if result.Transaction.ReferenceID != result.Claim.ID {
		t.Fatalf("transaction reference = %q, want claim id %q", result.Transaction.ReferenceID, result.Claim.ID)
	}
}

func TestService_AdminRewardChangeAffectsFutureClaimsOnly(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	auditRepo := audit.NewMemoryRepository()
	service := NewAuditedRewardService(taskRepo, taskRepo, walletService, auditRepo)

	template, details, err := service.AdminCreateTemplate(ctx, "admin_000001", TemplateInput{
		Name:         "Daily focus task",
		Description:  "Reward focused completion.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("AdminCreateTemplate error = %v, details = %v", err, details)
	}

	first, details, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		template.ID,
		"claim-key-1",
		time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC),
	)
	if err != nil {
		t.Fatalf("first ClaimRewardAt error = %v, details = %v", err, details)
	}
	if first.Transaction.AmountDelta != 10 {
		t.Fatalf("first reward amount = %d, want 10", first.Transaction.AmountDelta)
	}

	changed, details, err := service.AdminUpdateTemplate(ctx, "admin_000001", template.ID, TemplateInput{
		Name:         template.Name,
		Description:  template.Description,
		RewardType:   RewardEnergy,
		RewardAmount: 25,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("AdminUpdateTemplate error = %v, details = %v", err, details)
	}
	if changed.RewardAmount != 25 {
		t.Fatalf("changed reward amount = %d, want 25", changed.RewardAmount)
	}

	second, details, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		template.ID,
		"claim-key-2",
		time.Date(2026, 5, 22, 9, 0, 0, 0, time.UTC),
	)
	if err != nil {
		t.Fatalf("second ClaimRewardAt error = %v, details = %v", err, details)
	}
	if second.Transaction.AmountDelta != 25 {
		t.Fatalf("second reward amount = %d, want 25", second.Transaction.AmountDelta)
	}
	if second.Wallet.EnergyBalance != 35 {
		t.Fatalf("energy balance = %d, want 35", second.Wallet.EnergyBalance)
	}

	transactions, details, err := walletService.Transactions(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Transactions error = %v, details = %v", err, details)
	}
	if len(transactions) != 2 {
		t.Fatalf("transactions = %d, want 2", len(transactions))
	}
	if transactions[0].AmountDelta != 10 {
		t.Fatalf("first stored transaction amount = %d, want 10", transactions[0].AmountDelta)
	}
	if transactions[1].AmountDelta != 25 {
		t.Fatalf("second stored transaction amount = %d, want 25", transactions[1].AmountDelta)
	}
}

func TestService_ClaimRewardWritesAuditLog(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	auditRepo := audit.NewMemoryRepository()
	service := NewAuditedRewardService(taskRepo, taskRepo, walletService, auditRepo)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Clock in",
		Description:  "Start on schedule.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	result, details, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		template.ID,
		"claim-key-1",
		time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC),
	)
	if err != nil {
		t.Fatalf("ClaimRewardAt error = %v, details = %v", err, details)
	}

	entries, err := auditRepo.List(ctx, 10)
	if err != nil {
		t.Fatalf("audit List error = %v", err)
	}
	if len(entries) != 1 {
		t.Fatalf("audit entries = %d, want 1", len(entries))
	}
	if entries[0].Action != "task_reward_claimed" {
		t.Fatalf("audit action = %q, want task_reward_claimed", entries[0].Action)
	}
	if entries[0].ActorUserID != "usr_000001" {
		t.Fatalf("audit actor = %q, want usr_000001", entries[0].ActorUserID)
	}
	if entries[0].ResourceID != result.Claim.ID {
		t.Fatalf("audit resource = %q, want %q", entries[0].ResourceID, result.Claim.ID)
	}
	if entries[0].Metadata["wallet_transaction_id"] != result.Transaction.ID {
		t.Fatalf("audit wallet transaction = %q, want %q", entries[0].Metadata["wallet_transaction_id"], result.Transaction.ID)
	}
}

func TestService_ClaimRewardSendsNotification(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	sender := notification.NewMemorySender()
	service := NewObservedRewardService(taskRepo, taskRepo, walletService, nil, sender)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Clock in",
		Description:  "Start on schedule.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	if _, _, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		template.ID,
		"claim-key-1",
		time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC),
	); err != nil {
		t.Fatalf("ClaimRewardAt error = %v", err)
	}

	events := sender.Events()
	if len(events) != 1 {
		t.Fatalf("notifications = %d, want 1", len(events))
	}
	if events[0].EventType != notification.EventTaskCompleted {
		t.Fatalf("event type = %q, want task_completed", events[0].EventType)
	}
	if _, ok := events[0].Metadata["wallet_transaction_id"]; !ok {
		t.Fatalf("notification metadata missing wallet transaction: %#v", events[0].Metadata)
	}
}

func TestService_ExternalTaskEventUsesIdempotencyAndRecordsSource(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	auditRepo := audit.NewMemoryRepository()
	service := NewAuditedRewardService(taskRepo, taskRepo, walletService, auditRepo)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "External check-in",
		Description:  "Attendance event reward.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	result, details, err := service.ClaimExternalTaskEvent(ctx, ExternalTaskEventInput{
		UserID:         "usr_000001",
		TaskTemplateID: template.ID,
		SourceSystem:   "attendance",
		IdempotencyKey: "event-000001",
	})
	if err != nil {
		t.Fatalf("ClaimExternalTaskEvent error = %v, details = %v", err, details)
	}
	if result.SourceSystem != "attendance" {
		t.Fatalf("source system = %q, want attendance", result.SourceSystem)
	}

	_, details, err = service.ClaimExternalTaskEvent(ctx, ExternalTaskEventInput{
		UserID:         "usr_000001",
		TaskTemplateID: template.ID,
		SourceSystem:   "attendance",
		IdempotencyKey: "event-000001",
	})
	if !errors.Is(err, ErrDailyClaimLimit) {
		t.Fatalf("duplicate ClaimExternalTaskEvent error = %v, want %v; details = %v", err, ErrDailyClaimLimit, details)
	}

	transactions, details, err := walletService.Transactions(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Transactions error = %v, details = %v", err, details)
	}
	if len(transactions) != 1 {
		t.Fatalf("transactions = %d, want 1", len(transactions))
	}

	entries, err := auditRepo.List(ctx, 10)
	if err != nil {
		t.Fatalf("audit List error = %v", err)
	}
	if entries[0].Action != "external_task_event_received" {
		t.Fatalf("latest audit action = %q, want external_task_event_received", entries[0].Action)
	}
	if entries[0].Metadata["source_system"] != "attendance" {
		t.Fatalf("audit source system = %q, want attendance", entries[0].Metadata["source_system"])
	}
}

func TestService_AttendanceCheckInCompletesTask(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Clock in",
		Description:  "Attendance event reward.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	result, details, err := service.ProcessAttendanceCheckIn(ctx, AttendanceCheckInInput{
		ExternalEmployeeID: "employee_001",
		UserID:             "usr_000001",
		TaskTemplateID:     template.ID,
		EventID:            "checkin_000001",
	})
	if err != nil {
		t.Fatalf("ProcessAttendanceCheckIn error = %v, details = %v", err, details)
	}
	if result.SourceSystem != "attendance" {
		t.Fatalf("source system = %q, want attendance", result.SourceSystem)
	}
	if result.Claim.Wallet.EnergyBalance != 10 {
		t.Fatalf("energy balance = %d, want 10", result.Claim.Wallet.EnergyBalance)
	}
}

func TestService_AttendanceMissingMappingDoesNotBlockManualClaim(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Clock in",
		Description:  "Attendance event reward.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	_, details, err := service.ProcessAttendanceCheckIn(ctx, AttendanceCheckInInput{
		ExternalEmployeeID: "employee_001",
		TaskTemplateID:     template.ID,
		EventID:            "checkin_000001",
	})
	if !errors.Is(err, ErrInvalidTemplate) {
		t.Fatalf("ProcessAttendanceCheckIn error = %v, want %v; details = %v", err, ErrInvalidTemplate, details)
	}

	manual, details, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		template.ID,
		"manual-claim-1",
		time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC),
	)
	if err != nil {
		t.Fatalf("manual ClaimRewardAt error = %v, details = %v", err, details)
	}
	if manual.Wallet.EnergyBalance != 10 {
		t.Fatalf("manual energy balance = %d, want 10", manual.Wallet.EnergyBalance)
	}
}

func TestService_AdminTemplateChangesWriteAuditLogs(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	auditRepo := audit.NewMemoryRepository()
	service := NewAuditedRewardService(
		taskRepo,
		taskRepo,
		wallet.NewService(wallet.NewMemoryRepository()),
		auditRepo,
	)

	created, details, err := service.AdminCreateTemplate(ctx, "admin_000001", TemplateInput{
		Name:         "Admin task",
		Description:  "Created by admin.",
		RewardType:   RewardEnergy,
		RewardAmount: 10,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("AdminCreateTemplate error = %v, details = %v", err, details)
	}
	disabled, details, err := service.AdminDisableTemplate(ctx, "admin_000001", created.ID)
	if err != nil {
		t.Fatalf("AdminDisableTemplate error = %v, details = %v", err, details)
	}
	if disabled.Status != StatusDisabled {
		t.Fatalf("disabled.Status = %q, want %q", disabled.Status, StatusDisabled)
	}

	entries, err := auditRepo.List(ctx, 10)
	if err != nil {
		t.Fatalf("audit List error = %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("audit entries = %d, want 2", len(entries))
	}
	if entries[0].Action != "task_template_disabled" {
		t.Fatalf("latest audit action = %q, want task_template_disabled", entries[0].Action)
	}
	if entries[1].Action != "task_template_created" {
		t.Fatalf("first audit action = %q, want task_template_created", entries[1].Action)
	}
}

func TestService_ClaimRewardRejectsDuplicateClaim(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Daily report",
		Description:  "Share progress notes.",
		RewardType:   RewardFeed,
		RewardAmount: 1,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}
	claimDate := time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC)
	if _, _, err := service.ClaimRewardAt(ctx, "usr_000001", template.ID, "claim-key-1", claimDate); err != nil {
		t.Fatalf("first ClaimRewardAt error = %v", err)
	}

	_, details, err := service.ClaimRewardAt(ctx, "usr_000001", template.ID, "claim-key-2", claimDate)
	if !errors.Is(err, ErrDailyClaimLimit) {
		t.Fatalf("second ClaimRewardAt error = %v, want %v; details = %v", err, ErrDailyClaimLimit, details)
	}

	found, _, err := walletService.Wallet(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Wallet error = %v", err)
	}
	if found.FeedBalance != 1 {
		t.Fatalf("feed balance after duplicate = %d, want 1", found.FeedBalance)
	}
}

func TestService_ClaimRewardRejectsInvalidTask(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	service := NewRewardService(taskRepo, taskRepo, wallet.NewService(wallet.NewMemoryRepository()))

	_, details, err := service.ClaimRewardAt(
		ctx,
		"usr_000001",
		"missing",
		"claim-key-1",
		time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC),
	)
	if !errors.Is(err, ErrTemplateNotFound) {
		t.Fatalf("ClaimRewardAt error = %v, want %v; details = %v", err, ErrTemplateNotFound, details)
	}
}

func TestService_ConcurrentClaimRewardOnlyGrantsOnce(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	taskRepo := NewMemoryRepository()
	walletService := wallet.NewService(wallet.NewMemoryRepository())
	service := NewRewardService(taskRepo, taskRepo, walletService)
	template, _, err := service.CreateTemplate(ctx, TemplateInput{
		Name:         "Training",
		Description:  "Finish assigned training.",
		RewardType:   RewardEnergy,
		RewardAmount: 25,
		DailyLimit:   1,
		Status:       StatusActive,
	})
	if err != nil {
		t.Fatalf("CreateTemplate error = %v", err)
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	successes := 0
	failures := 0
	claimDate := time.Date(2026, 5, 21, 9, 0, 0, 0, time.UTC)
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_, _, err := service.ClaimRewardAt(ctx, "usr_000001", template.ID, "", claimDate)
			mu.Lock()
			defer mu.Unlock()
			if err == nil {
				successes++
				return
			}
			if errors.Is(err, ErrDailyClaimLimit) {
				failures++
			}
		}()
	}
	wg.Wait()

	if successes != 1 {
		t.Fatalf("successful claims = %d, want 1", successes)
	}
	if failures != 9 {
		t.Fatalf("duplicate failures = %d, want 9", failures)
	}
	found, _, err := walletService.Wallet(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Wallet error = %v", err)
	}
	if found.EnergyBalance != 25 {
		t.Fatalf("energy balance after concurrent claims = %d, want 25", found.EnergyBalance)
	}
}

func containsTemplate(templates []Template, id string) bool {
	for _, template := range templates {
		if template.ID == id {
			return true
		}
	}
	return false
}
