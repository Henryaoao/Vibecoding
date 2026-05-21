package wallet

import (
	"context"
	"errors"
)

var ErrInvalidChange = errors.New("invalid wallet change")

type Service struct {
	repo Repository
}

type Result struct {
	Wallet      Wallet      `json:"wallet"`
	Transaction Transaction `json:"transaction"`
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Credit(
	ctx context.Context,
	userID string,
	resourceType string,
	amount int,
	reason string,
	referenceType string,
	referenceID string,
) (Result, []string, error) {
	return s.apply(ctx, Change{
		UserID:        userID,
		ResourceType:  resourceType,
		AmountDelta:   amount,
		Reason:        reason,
		ReferenceType: referenceType,
		ReferenceID:   referenceID,
	})
}

func (s *Service) Debit(
	ctx context.Context,
	userID string,
	resourceType string,
	amount int,
	reason string,
	referenceType string,
	referenceID string,
) (Result, []string, error) {
	return s.apply(ctx, Change{
		UserID:        userID,
		ResourceType:  resourceType,
		AmountDelta:   -amount,
		Reason:        reason,
		ReferenceType: referenceType,
		ReferenceID:   referenceID,
	})
}

func (s *Service) Wallet(ctx context.Context, userID string) (Wallet, []string, error) {
	userID = clean(userID)
	if userID == "" {
		return Wallet{}, []string{"user id is required"}, ErrInvalidChange
	}

	found, err := s.repo.FindWallet(ctx, userID)
	return found, nil, err
}

func (s *Service) Transactions(ctx context.Context, userID string) ([]Transaction, []string, error) {
	userID = clean(userID)
	if userID == "" {
		return nil, []string{"user id is required"}, ErrInvalidChange
	}

	transactions, err := s.repo.ListTransactions(ctx, userID)
	return transactions, nil, err
}

func (s *Service) apply(ctx context.Context, change Change) (Result, []string, error) {
	normalized, details := validateChange(change)
	if len(details) > 0 {
		return Result{}, details, ErrInvalidChange
	}

	wallet, transaction, err := s.repo.ApplyChange(ctx, normalized)
	if err != nil {
		return Result{}, nil, err
	}
	return Result{Wallet: wallet, Transaction: transaction}, nil, nil
}

func validateChange(change Change) (Change, []string) {
	normalized := Change{
		UserID:        clean(change.UserID),
		ResourceType:  clean(change.ResourceType),
		AmountDelta:   change.AmountDelta,
		Reason:        clean(change.Reason),
		ReferenceType: clean(change.ReferenceType),
		ReferenceID:   clean(change.ReferenceID),
	}

	var details []string
	if normalized.UserID == "" {
		details = append(details, "user id is required")
	}
	if normalized.ResourceType != ResourceEnergy && normalized.ResourceType != ResourceFeed {
		details = append(details, "resource type must be energy or feed")
	}
	if normalized.AmountDelta == 0 {
		details = append(details, "amount must not be zero")
	}
	if normalized.Reason == "" {
		details = append(details, "reason is required")
	}

	return normalized, details
}
