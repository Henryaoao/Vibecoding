package pet

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

var (
	ErrTeamNotFound    = errors.New("team not found")
	ErrPetNotFound     = errors.New("pet not found")
	ErrPetAlreadyExist = errors.New("team already has a pet")
)

type Repository interface {
	EnsureTeam(ctx context.Context, id string, name string) (Team, error)
	CreateTeam(ctx context.Context, name string) (Team, error)
	CreatePet(ctx context.Context, teamID string, name string, template string) (Pet, error)
	FindByTeamID(ctx context.Context, teamID string) (Pet, error)
	UpdateState(ctx context.Context, pet Pet) (Pet, error)
	ListLevels(ctx context.Context) ([]PetLevel, error)
	ReplaceLevels(ctx context.Context, levels []PetLevel) error
	ListSkins(ctx context.Context) ([]PetSkin, error)
	RecordFeedEvent(ctx context.Context, event FeedEvent) (FeedEvent, ActivityEvent, error)
	RecordActivity(ctx context.Context, event ActivityEvent) (ActivityEvent, error)
	ListActivity(ctx context.Context, teamID string) ([]ActivityEvent, error)
}

type MySQLRepository struct {
	db *sql.DB
}

func NewMySQLRepository(db *sql.DB) *MySQLRepository {
	return &MySQLRepository{db: db}
}

func (r *MySQLRepository) EnsureTeam(ctx context.Context, id string, name string) (Team, error) {
	now := time.Now().UTC()
	team := Team{
		ID:        normalizeName(id, "team_default"),
		Name:      normalizeName(name, "Default Team"),
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO teams (id, name, created_at, updated_at)
		 VALUES (?, ?, ?, ?)
		 ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = VALUES(updated_at)`,
		team.ID,
		team.Name,
		team.CreatedAt,
		team.UpdatedAt,
	)
	if err != nil {
		return Team{}, err
	}

	return r.findTeamByID(ctx, team.ID)
}

func (r *MySQLRepository) CreateTeam(ctx context.Context, name string) (Team, error) {
	now := time.Now().UTC()
	created := Team{
		ID:        makeRandomID("team"),
		Name:      normalizeName(name, "Default Team"),
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO teams (id, name, created_at, updated_at)
		 VALUES (?, ?, ?, ?)`,
		created.ID,
		created.Name,
		created.CreatedAt,
		created.UpdatedAt,
	)
	if err != nil {
		return Team{}, err
	}

	return created, nil
}

func (r *MySQLRepository) findTeamByID(ctx context.Context, id string) (Team, error) {
	return scanTeam(r.db.QueryRowContext(
		ctx,
		`SELECT id, name, created_at, updated_at
		 FROM teams
		 WHERE id = ?`,
		id,
	))
}

func (r *MySQLRepository) CreatePet(
	ctx context.Context,
	teamID string,
	name string,
	template string,
) (Pet, error) {
	now := time.Now().UTC()
	created := Pet{
		ID:          makeRandomID("pet"),
		TeamID:      teamID,
		Name:        normalizeName(name, "Sprout"),
		Template:    normalizeName(template, "mint-bean"),
		Level:       1,
		GrowthValue: 0,
		Mood:        "happy",
		CurrentSkin: "default",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO pets
		 (id, team_id, name, template, level, growth_value, mood, current_skin, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		created.ID,
		created.TeamID,
		created.Name,
		created.Template,
		created.Level,
		created.GrowthValue,
		created.Mood,
		created.CurrentSkin,
		created.CreatedAt,
		created.UpdatedAt,
	)
	if isDuplicateMySQLError(err) {
		return Pet{}, ErrPetAlreadyExist
	}
	if err != nil {
		return Pet{}, err
	}

	return created, nil
}

func (r *MySQLRepository) FindByTeamID(ctx context.Context, teamID string) (Pet, error) {
	return scanPet(r.db.QueryRowContext(
		ctx,
		`SELECT id, team_id, name, template, level, growth_value, mood, current_skin, created_at, updated_at
		 FROM pets
		 WHERE team_id = ?`,
		teamID,
	))
}

func (r *MySQLRepository) UpdateState(ctx context.Context, changed Pet) (Pet, error) {
	changed = normalizePet(changed)
	changed.UpdatedAt = time.Now().UTC()

	result, err := r.db.ExecContext(
		ctx,
		`UPDATE pets
		 SET name = ?, template = ?, level = ?, growth_value = ?, mood = ?, current_skin = ?, updated_at = ?
		 WHERE id = ?`,
		changed.Name,
		changed.Template,
		changed.Level,
		changed.GrowthValue,
		changed.Mood,
		changed.CurrentSkin,
		changed.UpdatedAt,
		changed.ID,
	)
	if err != nil {
		return Pet{}, err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return Pet{}, err
	}
	if affected == 0 {
		return Pet{}, ErrPetNotFound
	}

	return r.findByID(ctx, changed.ID)
}

func (r *MySQLRepository) ListLevels(ctx context.Context) ([]PetLevel, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT level_number, name, required_growth, unlock_metadata, created_at, updated_at
		 FROM pet_levels
		 ORDER BY required_growth ASC, level_number ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	levels := []PetLevel{}
	for rows.Next() {
		found, err := scanLevel(rows)
		if err != nil {
			return nil, err
		}
		levels = append(levels, found)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return levels, nil
}

func (r *MySQLRepository) ReplaceLevels(ctx context.Context, levels []PetLevel) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer rollback(tx)

	if _, err := tx.ExecContext(ctx, `DELETE FROM pet_levels`); err != nil {
		return err
	}

	now := time.Now().UTC()
	for _, level := range normalizeLevels(levels) {
		_, err := tx.ExecContext(
			ctx,
			`INSERT INTO pet_levels
			 (level_number, name, required_growth, unlock_metadata, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			level.LevelNumber,
			level.Name,
			level.RequiredGrowth,
			level.UnlockMetadata,
			now,
			now,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *MySQLRepository) ListSkins(ctx context.Context) ([]PetSkin, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT id, name, rarity, asset_path, description, unlock_level, unlock_growth, created_at, updated_at
		 FROM pet_skins
		 ORDER BY unlock_level ASC, unlock_growth ASC, id ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	skins := []PetSkin{}
	for rows.Next() {
		found, err := scanSkin(rows)
		if err != nil {
			return nil, err
		}
		skins = append(skins, found)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return skins, nil
}

func (r *MySQLRepository) RecordFeedEvent(
	ctx context.Context,
	event FeedEvent,
) (FeedEvent, ActivityEvent, error) {
	event.ID = makeRandomID("feed_event")
	event.CreatedAt = time.Now().UTC()
	activity := ActivityEvent{
		ID:         makeRandomID("activity"),
		TeamID:     defaultTeamID,
		UserID:     event.UserID,
		EventType:  "pet_fed",
		ResourceID: event.ID,
		Message:    fmt.Sprintf("Fed the team pet with %d feed", event.FeedAmount),
		CreatedAt:  event.CreatedAt,
	}

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO pet_feed_events
		 (id, pet_id, user_id, feed_amount, growth_delta, wallet_transaction_id, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		event.ID,
		event.PetID,
		event.UserID,
		event.FeedAmount,
		event.GrowthDelta,
		event.WalletTransactionID,
		event.CreatedAt,
	)
	if err != nil {
		return FeedEvent{}, ActivityEvent{}, err
	}

	_, err = r.db.ExecContext(
		ctx,
		`INSERT INTO team_activity_events
		 (id, team_id, user_id, event_type, resource_id, message, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		activity.ID,
		activity.TeamID,
		activity.UserID,
		activity.EventType,
		activity.ResourceID,
		activity.Message,
		activity.CreatedAt,
	)
	if err != nil {
		return FeedEvent{}, ActivityEvent{}, err
	}

	return event, activity, nil
}

func (r *MySQLRepository) RecordActivity(ctx context.Context, event ActivityEvent) (ActivityEvent, error) {
	event.ID = makeRandomID("activity")
	event.TeamID = normalizeName(event.TeamID, defaultTeamID)
	event.CreatedAt = time.Now().UTC()

	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO team_activity_events
		 (id, team_id, user_id, event_type, resource_id, message, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		event.ID,
		event.TeamID,
		event.UserID,
		event.EventType,
		event.ResourceID,
		event.Message,
		event.CreatedAt,
	)
	if err != nil {
		return ActivityEvent{}, err
	}

	return event, nil
}

func (r *MySQLRepository) ListActivity(ctx context.Context, teamID string) ([]ActivityEvent, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT id, team_id, user_id, event_type, resource_id, message, created_at
		 FROM team_activity_events
		 WHERE team_id = ?
		 ORDER BY created_at DESC, id DESC
		 LIMIT 20`,
		teamID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []ActivityEvent
	for rows.Next() {
		found, err := scanActivity(rows)
		if err != nil {
			return nil, err
		}
		events = append(events, found)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func (r *MySQLRepository) findByID(ctx context.Context, id string) (Pet, error) {
	return scanPet(r.db.QueryRowContext(
		ctx,
		`SELECT id, team_id, name, template, level, growth_value, mood, current_skin, created_at, updated_at
		 FROM pets
		 WHERE id = ?`,
		id,
	))
}

type MemoryRepository struct {
	mu             sync.RWMutex
	teams          map[string]Team
	petsByID       map[string]Pet
	petIDByTeamID  map[string]string
	levels         []PetLevel
	skins          []PetSkin
	activity       []ActivityEvent
	nextTeamID     int
	nextPetID      int
	nextFeedID     int
	nextActivityID int
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		teams:          map[string]Team{},
		petsByID:       map[string]Pet{},
		petIDByTeamID:  map[string]string{},
		levels:         defaultLevels(time.Now().UTC()),
		skins:          defaultSkins(time.Now().UTC()),
		nextTeamID:     1,
		nextPetID:      1,
		nextFeedID:     1,
		nextActivityID: 1,
	}
}

func (r *MemoryRepository) EnsureTeam(ctx context.Context, id string, name string) (Team, error) {
	if err := ctx.Err(); err != nil {
		return Team{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	id = normalizeName(id, "team_default")
	now := time.Now().UTC()
	if existing, ok := r.teams[id]; ok {
		existing.Name = normalizeName(name, "Default Team")
		existing.UpdatedAt = now
		r.teams[id] = existing
		return existing, nil
	}

	created := Team{
		ID:        id,
		Name:      normalizeName(name, "Default Team"),
		CreatedAt: now,
		UpdatedAt: now,
	}
	r.teams[created.ID] = created

	return created, nil
}

func (r *MemoryRepository) CreateTeam(ctx context.Context, name string) (Team, error) {
	if err := ctx.Err(); err != nil {
		return Team{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now().UTC()
	created := Team{
		ID:        makeSequentialID("team", r.nextTeamID),
		Name:      normalizeName(name, "Default Team"),
		CreatedAt: now,
		UpdatedAt: now,
	}
	r.nextTeamID++
	r.teams[created.ID] = created

	return created, nil
}

func (r *MemoryRepository) CreatePet(
	ctx context.Context,
	teamID string,
	name string,
	template string,
) (Pet, error) {
	if err := ctx.Err(); err != nil {
		return Pet{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.teams[teamID]; !ok {
		return Pet{}, ErrTeamNotFound
	}
	if _, ok := r.petIDByTeamID[teamID]; ok {
		return Pet{}, ErrPetAlreadyExist
	}

	now := time.Now().UTC()
	created := Pet{
		ID:          makeSequentialID("pet", r.nextPetID),
		TeamID:      teamID,
		Name:        normalizeName(name, "Sprout"),
		Template:    normalizeName(template, "mint-bean"),
		Level:       1,
		GrowthValue: 0,
		Mood:        "happy",
		CurrentSkin: "default",
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	r.nextPetID++
	r.petsByID[created.ID] = created
	r.petIDByTeamID[created.TeamID] = created.ID

	return created, nil
}

func (r *MemoryRepository) FindByTeamID(ctx context.Context, teamID string) (Pet, error) {
	if err := ctx.Err(); err != nil {
		return Pet{}, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	id, ok := r.petIDByTeamID[teamID]
	if !ok {
		return Pet{}, ErrPetNotFound
	}
	return r.petsByID[id], nil
}

func (r *MemoryRepository) UpdateState(ctx context.Context, changed Pet) (Pet, error) {
	if err := ctx.Err(); err != nil {
		return Pet{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	current, ok := r.petsByID[changed.ID]
	if !ok {
		return Pet{}, ErrPetNotFound
	}

	changed.TeamID = current.TeamID
	changed.CreatedAt = current.CreatedAt
	changed.UpdatedAt = time.Now().UTC()
	changed = normalizePet(changed)
	r.petsByID[changed.ID] = changed

	return changed, nil
}

func (r *MemoryRepository) ListLevels(ctx context.Context) ([]PetLevel, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	levels := make([]PetLevel, len(r.levels))
	copy(levels, r.levels)
	return levels, nil
}

func (r *MemoryRepository) ReplaceLevels(ctx context.Context, levels []PetLevel) error {
	if err := ctx.Err(); err != nil {
		return err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.levels = normalizeLevels(levels)
	return nil
}

func (r *MemoryRepository) ListSkins(ctx context.Context) ([]PetSkin, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	skins := make([]PetSkin, len(r.skins))
	copy(skins, r.skins)
	return skins, nil
}

func (r *MemoryRepository) RecordFeedEvent(
	ctx context.Context,
	event FeedEvent,
) (FeedEvent, ActivityEvent, error) {
	if err := ctx.Err(); err != nil {
		return FeedEvent{}, ActivityEvent{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	event.ID = makeSequentialID("feed_event", r.nextFeedID)
	event.CreatedAt = time.Now().UTC()
	r.nextFeedID++

	activity := ActivityEvent{
		ID:         makeSequentialID("activity", r.nextActivityID),
		TeamID:     defaultTeamID,
		UserID:     event.UserID,
		EventType:  "pet_fed",
		ResourceID: event.ID,
		Message:    fmt.Sprintf("Fed the team pet with %d feed", event.FeedAmount),
		CreatedAt:  event.CreatedAt,
	}
	r.nextActivityID++
	r.activity = append([]ActivityEvent{activity}, r.activity...)

	return event, activity, nil
}

func (r *MemoryRepository) RecordActivity(ctx context.Context, event ActivityEvent) (ActivityEvent, error) {
	if err := ctx.Err(); err != nil {
		return ActivityEvent{}, err
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	event.ID = makeSequentialID("activity", r.nextActivityID)
	event.TeamID = normalizeName(event.TeamID, defaultTeamID)
	event.CreatedAt = time.Now().UTC()
	r.nextActivityID++
	r.activity = append([]ActivityEvent{event}, r.activity...)

	return event, nil
}

func (r *MemoryRepository) ListActivity(ctx context.Context, teamID string) ([]ActivityEvent, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}

	r.mu.RLock()
	defer r.mu.RUnlock()

	events := make([]ActivityEvent, 0, len(r.activity))
	for _, event := range r.activity {
		if event.TeamID == teamID {
			events = append(events, event)
		}
	}
	return events, nil
}

func normalizePet(found Pet) Pet {
	found.Name = normalizeName(found.Name, "Sprout")
	found.Template = normalizeName(found.Template, "mint-bean")
	found.Mood = normalizeName(found.Mood, "happy")
	found.CurrentSkin = normalizeName(found.CurrentSkin, "default")
	found.GrowthValue = normalizeGrowth(found.GrowthValue)
	if found.Level < 1 {
		found.Level = 1
	}
	return found
}

func normalizeLevels(levels []PetLevel) []PetLevel {
	if len(levels) == 0 {
		return defaultLevels(time.Now().UTC())
	}

	normalized := make([]PetLevel, 0, len(levels))
	for _, level := range levels {
		if level.LevelNumber < 1 || level.RequiredGrowth < 0 {
			continue
		}
		level.Name = normalizeName(level.Name, fmt.Sprintf("Level %d", level.LevelNumber))
		level.UnlockMetadata = strings.TrimSpace(level.UnlockMetadata)
		normalized = append(normalized, level)
	}
	if len(normalized) == 0 {
		return defaultLevels(time.Now().UTC())
	}

	sort.Slice(normalized, func(i int, j int) bool {
		if normalized[i].RequiredGrowth == normalized[j].RequiredGrowth {
			return normalized[i].LevelNumber < normalized[j].LevelNumber
		}
		return normalized[i].RequiredGrowth < normalized[j].RequiredGrowth
	})

	first := normalized[0]
	if first.RequiredGrowth != 0 || first.LevelNumber != 1 {
		base := PetLevel{
			LevelNumber:    1,
			Name:           "Quiet Sprout",
			RequiredGrowth: 0,
			UnlockMetadata: "default_skin",
		}
		normalized = append([]PetLevel{base}, normalized...)
	}
	return normalized
}

func defaultLevels(now time.Time) []PetLevel {
	return []PetLevel{
		{
			LevelNumber:    1,
			Name:           "Quiet Sprout",
			RequiredGrowth: 0,
			UnlockMetadata: "default_skin",
			CreatedAt:      now,
			UpdatedAt:      now,
		},
		{
			LevelNumber:    2,
			Name:           "Snack Scout",
			RequiredGrowth: 100,
			UnlockMetadata: "sunny_cape_skin",
			CreatedAt:      now,
			UpdatedAt:      now,
		},
		{
			LevelNumber:    3,
			Name:           "Team Buddy",
			RequiredGrowth: 200,
			UnlockMetadata: "rocket_pack_skin",
			CreatedAt:      now,
			UpdatedAt:      now,
		},
		{
			LevelNumber:    4,
			Name:           "Office Star",
			RequiredGrowth: 300,
			UnlockMetadata: "star_crown_skin",
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}
}

func defaultSkins(now time.Time) []PetSkin {
	return []PetSkin{
		{
			ID:           "default",
			Name:         "Mint Bean",
			Rarity:       "common",
			AssetPath:    "skins/mint-bean.svg",
			Description:  "A soft mint mascot for the first pilot day. Calm, friendly, and ready for small wins.",
			UnlockLevel:  1,
			UnlockGrowth: 0,
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			ID:           "sunny-cape",
			Name:         "Sunny Cape",
			Rarity:       "rare",
			AssetPath:    "skins/sunny-cape.svg",
			Description:  "A bright little cape for a team that kept showing up together.",
			UnlockLevel:  2,
			UnlockGrowth: 100,
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			ID:           "rocket-pack",
			Name:         "Rocket Pack",
			Rarity:       "epic",
			AssetPath:    "skins/rocket-pack.svg",
			Description:  "A playful booster look for steady task momentum and shared care.",
			UnlockLevel:  3,
			UnlockGrowth: 200,
			CreatedAt:    now,
			UpdatedAt:    now,
		},
		{
			ID:           "star-crown",
			Name:         "Star Crown",
			Rarity:       "legendary",
			AssetPath:    "skins/star-crown.svg",
			Description:  "A celebration crown for a thriving pilot team. No leaderboard required.",
			UnlockLevel:  4,
			UnlockGrowth: 300,
			CreatedAt:    now,
			UpdatedAt:    now,
		},
	}
}

func normalizeName(value string, fallback string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	return value
}

func makeSequentialID(prefix string, next int) string {
	return fmt.Sprintf("%s_%06d", prefix, next)
}

func makeRandomID(prefix string) string {
	var bytes [8]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return prefix + "_" + fmt.Sprint(time.Now().UTC().UnixNano())
	}
	return prefix + "_" + hex.EncodeToString(bytes[:])
}

func scanPet(row *sql.Row) (Pet, error) {
	var found Pet
	err := row.Scan(
		&found.ID,
		&found.TeamID,
		&found.Name,
		&found.Template,
		&found.Level,
		&found.GrowthValue,
		&found.Mood,
		&found.CurrentSkin,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Pet{}, ErrPetNotFound
	}
	if err != nil {
		return Pet{}, err
	}
	return found, nil
}

func scanTeam(row *sql.Row) (Team, error) {
	var found Team
	err := row.Scan(
		&found.ID,
		&found.Name,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Team{}, ErrTeamNotFound
	}
	if err != nil {
		return Team{}, err
	}
	return found, nil
}

func scanActivity(rows *sql.Rows) (ActivityEvent, error) {
	var found ActivityEvent
	err := rows.Scan(
		&found.ID,
		&found.TeamID,
		&found.UserID,
		&found.EventType,
		&found.ResourceID,
		&found.Message,
		&found.CreatedAt,
	)
	if err != nil {
		return ActivityEvent{}, err
	}
	return found, nil
}

func scanLevel(rows *sql.Rows) (PetLevel, error) {
	var found PetLevel
	err := rows.Scan(
		&found.LevelNumber,
		&found.Name,
		&found.RequiredGrowth,
		&found.UnlockMetadata,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if err != nil {
		return PetLevel{}, err
	}
	return found, nil
}

func scanSkin(rows *sql.Rows) (PetSkin, error) {
	var found PetSkin
	err := rows.Scan(
		&found.ID,
		&found.Name,
		&found.Rarity,
		&found.AssetPath,
		&found.Description,
		&found.UnlockLevel,
		&found.UnlockGrowth,
		&found.CreatedAt,
		&found.UpdatedAt,
	)
	if err != nil {
		return PetSkin{}, err
	}
	return found, nil
}

func isDuplicateMySQLError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "Duplicate entry")
}

func rollback(tx *sql.Tx) {
	_ = tx.Rollback()
}
