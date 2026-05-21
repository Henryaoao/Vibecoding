package wallet

import (
	"context"
	"errors"
	"testing"
)

func TestService_CreditCreatesWalletAndLedger(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())

	result, details, err := service.Credit(
		ctx,
		"usr_000001",
		ResourceEnergy,
		10,
		"daily task reward",
		"task_claim",
		"claim_000001",
	)
	if err != nil {
		t.Fatalf("Credit error = %v, details = %v", err, details)
	}
	if result.Wallet.EnergyBalance != 10 {
		t.Fatalf("energy balance = %d, want 10", result.Wallet.EnergyBalance)
	}
	if result.Transaction.AmountDelta != 10 {
		t.Fatalf("transaction amount = %d, want 10", result.Transaction.AmountDelta)
	}
	if result.Transaction.BalanceAfter != 10 {
		t.Fatalf("balance after = %d, want 10", result.Transaction.BalanceAfter)
	}

	wallet, details, err := service.Wallet(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Wallet error = %v, details = %v", err, details)
	}
	if wallet.UserID != "usr_000001" {
		t.Fatalf("wallet.UserID = %q, want usr_000001", wallet.UserID)
	}
}

func TestService_DebitDecreasesBalanceAndWritesLedger(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())
	if _, _, err := service.Credit(
		ctx,
		"usr_000001",
		ResourceFeed,
		3,
		"daily report reward",
		"task_claim",
		"claim_000001",
	); err != nil {
		t.Fatalf("Credit error = %v", err)
	}

	result, details, err := service.Debit(
		ctx,
		"usr_000001",
		ResourceFeed,
		1,
		"feed team pet",
		"pet_feed",
		"pet_000001",
	)
	if err != nil {
		t.Fatalf("Debit error = %v, details = %v", err, details)
	}
	if result.Wallet.FeedBalance != 2 {
		t.Fatalf("feed balance = %d, want 2", result.Wallet.FeedBalance)
	}
	if result.Transaction.AmountDelta != -1 {
		t.Fatalf("transaction amount = %d, want -1", result.Transaction.AmountDelta)
	}
	if result.Transaction.Reason != "feed team pet" {
		t.Fatalf("transaction reason = %q, want feed team pet", result.Transaction.Reason)
	}

	transactions, details, err := service.Transactions(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Transactions error = %v, details = %v", err, details)
	}
	if len(transactions) != 2 {
		t.Fatalf("transactions = %d, want 2", len(transactions))
	}
}

func TestService_RejectsInsufficientBalance(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	service := NewService(NewMemoryRepository())
	if _, _, err := service.Credit(
		ctx,
		"usr_000001",
		ResourceEnergy,
		5,
		"daily task reward",
		"task_claim",
		"claim_000001",
	); err != nil {
		t.Fatalf("Credit error = %v", err)
	}

	_, details, err := service.Debit(
		ctx,
		"usr_000001",
		ResourceEnergy,
		6,
		"feed team pet",
		"pet_feed",
		"pet_000001",
	)
	if !errors.Is(err, ErrInsufficientBalance) {
		t.Fatalf("Debit error = %v, want %v; details = %v", err, ErrInsufficientBalance, details)
	}

	wallet, details, err := service.Wallet(ctx, "usr_000001")
	if err != nil {
		t.Fatalf("Wallet error = %v, details = %v", err, details)
	}
	if wallet.EnergyBalance != 5 {
		t.Fatalf("energy balance after failed debit = %d, want 5", wallet.EnergyBalance)
	}
}

func TestService_ValidatesChanges(t *testing.T) {
	t.Parallel()

	_, details, err := NewService(NewMemoryRepository()).Credit(
		context.Background(),
		"",
		"coins",
		0,
		"",
		"",
		"",
	)
	if !errors.Is(err, ErrInvalidChange) {
		t.Fatalf("Credit error = %v, want %v", err, ErrInvalidChange)
	}
	if len(details) != 4 {
		t.Fatalf("details = %v, want 4 validation issues", details)
	}
}
