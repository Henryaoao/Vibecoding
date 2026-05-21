package wallet

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

var (
	ErrWalletNotFound      = errors.New("wallet not found")
	ErrInsufficientBalance = errors.New("insufficient balance")
)

type Repository interface {
	ApplyChange(ctx context.Context, change Change) (Wallet, Transaction, error)
	FindWallet(ctx context.Context, userID string) (Wallet, error)
	ListTransactions(ctx context.Context, userID string) ([]Transaction, error)
}

type MySQLRepository struct {
	db *sql.DB
}

func NewMySQLRepository(db *sql.DB) *MySQLRepository {
	return &MySQLRepository{db: db}
}

func (r *MySQLRepository) ApplyChange(
	ctx context.Context,
	change Change,
) (Wallet, Transaction, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return Wallet{}, Transaction{}, err
	}
	defer rollback(tx)

	if err := ensureWallet(ctx, tx, change.UserID); err != nil {
		return Wallet{}, Transaction{}, err
	}

	current, err := scanWallet(tx.QueryRowContext(
		ctx,
		`SELECT user_id, energy_balance, feed_balance, created_at, updated_at
		 FROM user_wallets
		 WHERE user_id = ?
		 FOR UPDATE`,
		change.UserID,
	))
	if err != nil {
		return Wallet{}, Transaction{}, err
	}

	changed, balanceAfter, err := applyDelta(current, change)
	if err != nil {
		return Wallet{}, Transaction{}, err
	}
	changed.UpdatedAt = time.Now().UTC()

	if err := updateWallet(ctx, tx, changed); err != nil {
		return Wallet{}, Transaction{}, err
	}

	transaction := Transaction{
		ID:            makeRandomID("reward_txn"),
		UserID:        change.UserID,
		ResourceType:  change.ResourceType,
		AmountDelta:   change.AmountDelta,
		BalanceAfter:  balanceAfter,
		Reason:        change.Reason,
		ReferenceType: change.ReferenceType,
		ReferenceID:   change.ReferenceID,
		CreatedAt:     time.Now().UTC(),
	}
	if err := insertTransaction(ctx, tx, transaction); err != nil {
		return Wallet{}, Transaction{}, err
	}

	if err := tx.Commit(); err != nil {
		return Wallet{}, Transaction{}, err
	}
	return changed, transaction, nil
}

func (r *MySQLRepository) FindWallet(ctx context.Context, userID string) (Wallet, error) {
	return scanWallet(r.db.QueryRowContext(
		ctx,
		`SELECT user_id, energy_balance, feed_balance, created_at, updated_at
		 FROM user_wallets
		 WHERE user_id = ?`,
		userID,
	))
}

func (r *MySQLRepository) ListTransactions(ctx context.Context, userID string) ([]Transaction, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT id, user_id, resource_type, amount_delta, balance_after, reason,
		        reference_type, reference_id, created_at
		 FROM reward_transactions
		 WHERE user_id = ?
		 ORDER BY created_at DESC, id DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []Transaction
	for rows.Next() {
		found, err := scanTransaction(rows)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, found)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return transactions, nil
}

type MemoryRepository struct {
	mu           sync.Mutex
	wallets      map[string]Wallet
	transactions map[string][]Transaction
	nextID       int
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		wallets:      map[string]Wallet{},
		transactions: map[string][]Transaction{},
		nextID:       1,
	}
}

func (r *MemoryRepository) ApplyChange(
	ctx context.Context,
	change Change,
) (Wallet, Transaction, error) {
	if err := ctx.Err(); err != nil {
		return Wallet{}, Transaction{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	current := r.wallets[change.UserID]
	if current.UserID == "" {
		now := time.Now().UTC()
		current = Wallet{
			UserID:    change.UserID,
			CreatedAt: now,
			UpdatedAt: now,
		}
	}

	changed, balanceAfter, err := applyDelta(current, change)
	if err != nil {
		return Wallet{}, Transaction{}, err
	}
	changed.UpdatedAt = time.Now().UTC()
	r.wallets[change.UserID] = changed

	transaction := Transaction{
		ID:            makeSequentialID(r.nextID),
		UserID:        change.UserID,
		ResourceType:  change.ResourceType,
		AmountDelta:   change.AmountDelta,
		BalanceAfter:  balanceAfter,
		Reason:        change.Reason,
		ReferenceType: change.ReferenceType,
		ReferenceID:   change.ReferenceID,
		CreatedAt:     time.Now().UTC(),
	}
	r.nextID++
	r.transactions[change.UserID] = append(r.transactions[change.UserID], transaction)

	return changed, transaction, nil
}

func (r *MemoryRepository) FindWallet(ctx context.Context, userID string) (Wallet, error) {
	if err := ctx.Err(); err != nil {
		return Wallet{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	found, ok := r.wallets[userID]
	if !ok {
		return Wallet{}, ErrWalletNotFound
	}
	return found, nil
}

func (r *MemoryRepository) ListTransactions(ctx context.Context, userID string) ([]Transaction, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	found := r.transactions[userID]
	transactions := make([]Transaction, len(found))
	copy(transactions, found)
	return transactions, nil
}

func ensureWallet(ctx context.Context, tx *sql.Tx, userID string) error {
	now := time.Now().UTC()
	_, err := tx.ExecContext(
		ctx,
		`INSERT INTO user_wallets (user_id, energy_balance, feed_balance, created_at, updated_at)
		 VALUES (?, 0, 0, ?, ?)
		 ON DUPLICATE KEY UPDATE updated_at = updated_at`,
		userID,
		now,
		now,
	)
	return err
}

func updateWallet(ctx context.Context, tx *sql.Tx, wallet Wallet) error {
	_, err := tx.ExecContext(
		ctx,
		`UPDATE user_wallets
		 SET energy_balance = ?, feed_balance = ?, updated_at = ?
		 WHERE user_id = ?`,
		wallet.EnergyBalance,
		wallet.FeedBalance,
		wallet.UpdatedAt,
		wallet.UserID,
	)
	return err
}

func insertTransaction(ctx context.Context, tx *sql.Tx, transaction Transaction) error {
	_, err := tx.ExecContext(
		ctx,
		`INSERT INTO reward_transactions
		 (id, user_id, resource_type, amount_delta, balance_after, reason,
		  reference_type, reference_id, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		transaction.ID,
		transaction.UserID,
		transaction.ResourceType,
		transaction.AmountDelta,
		transaction.BalanceAfter,
		transaction.Reason,
		transaction.ReferenceType,
		transaction.ReferenceID,
		transaction.CreatedAt,
	)
	return err
}

func applyDelta(current Wallet, change Change) (Wallet, int, error) {
	changed := current
	switch change.ResourceType {
	case ResourceEnergy:
		next := current.EnergyBalance + change.AmountDelta
		if next < 0 {
			return Wallet{}, 0, ErrInsufficientBalance
		}
		changed.EnergyBalance = next
		return changed, next, nil
	case ResourceFeed:
		next := current.FeedBalance + change.AmountDelta
		if next < 0 {
			return Wallet{}, 0, ErrInsufficientBalance
		}
		changed.FeedBalance = next
		return changed, next, nil
	default:
		return Wallet{}, 0, ErrWalletNotFound
	}
}

func rollback(tx *sql.Tx) {
	if err := tx.Rollback(); err != nil && !errors.Is(err, sql.ErrTxDone) {
		return
	}
}

func scanWallet(row *sql.Row) (Wallet, error) {
	var found Wallet
	err := row.Scan(
		&found.UserID,
		&found.EnergyBalance,
		&found.FeedBalance,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Wallet{}, ErrWalletNotFound
	}
	if err != nil {
		return Wallet{}, err
	}
	return found, nil
}

func scanTransaction(rows *sql.Rows) (Transaction, error) {
	var found Transaction
	err := rows.Scan(
		&found.ID,
		&found.UserID,
		&found.ResourceType,
		&found.AmountDelta,
		&found.BalanceAfter,
		&found.Reason,
		&found.ReferenceType,
		&found.ReferenceID,
		&found.CreatedAt,
	)
	if err != nil {
		return Transaction{}, err
	}
	return found, nil
}

func makeSequentialID(next int) string {
	return fmt.Sprintf("reward_txn_%06d", next)
}

func makeRandomID(prefix string) string {
	var bytes [8]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return prefix + "_" + fmt.Sprint(time.Now().UTC().UnixNano())
	}
	return prefix + "_" + hex.EncodeToString(bytes[:])
}

func clean(value string) string {
	return strings.TrimSpace(value)
}
