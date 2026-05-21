CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(32) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
  id VARCHAR(32) PRIMARY KEY,
  team_id VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  template VARCHAR(80) NOT NULL,
  level INT NOT NULL DEFAULT 1,
  growth_value INT NOT NULL DEFAULT 0,
  mood VARCHAR(40) NOT NULL DEFAULT 'happy',
  current_skin VARCHAR(80) NOT NULL DEFAULT 'default',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_team_id FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT chk_pets_level CHECK (level >= 1),
  CONSTRAINT chk_pets_growth_value CHECK (growth_value >= 0)
);

CREATE TABLE IF NOT EXISTS pet_levels (
  level_number INT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  required_growth INT NOT NULL,
  unlock_metadata VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_pet_levels_level_number CHECK (level_number >= 1),
  CONSTRAINT chk_pet_levels_required_growth CHECK (required_growth >= 0),
  CONSTRAINT uq_pet_levels_required_growth UNIQUE (required_growth)
);

INSERT IGNORE INTO pet_levels
  (level_number, name, required_growth, unlock_metadata)
VALUES
  (1, 'Quiet Sprout', 0, 'default_skin'),
  (2, 'Snack Scout', 100, 'sunny_cape_skin'),
  (3, 'Team Buddy', 200, 'rocket_pack_skin'),
  (4, 'Office Star', 300, 'star_crown_skin');

CREATE TABLE IF NOT EXISTS pet_skins (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  rarity VARCHAR(40) NOT NULL,
  asset_path VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  unlock_level INT NOT NULL DEFAULT 1,
  unlock_growth INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_pet_skins_unlock_level CHECK (unlock_level >= 1),
  CONSTRAINT chk_pet_skins_unlock_growth CHECK (unlock_growth >= 0)
);

INSERT IGNORE INTO pet_skins
  (id, name, rarity, asset_path, description, unlock_level, unlock_growth)
VALUES
  (
    'default',
    'Mint Bean',
    'common',
    'skins/mint-bean.svg',
    'A soft mint mascot for the first pilot day. Calm, friendly, and ready for small wins.',
    1,
    0
  ),
  (
    'sunny-cape',
    'Sunny Cape',
    'rare',
    'skins/sunny-cape.svg',
    'A bright little cape for a team that kept showing up together.',
    2,
    100
  ),
  (
    'rocket-pack',
    'Rocket Pack',
    'epic',
    'skins/rocket-pack.svg',
    'A playful booster look for steady task momentum and shared care.',
    3,
    200
  ),
  (
    'star-crown',
    'Star Crown',
    'legendary',
    'skins/star-crown.svg',
    'A celebration crown for a thriving pilot team. No leaderboard required.',
    4,
    300
  );

CREATE TABLE IF NOT EXISTS task_templates (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  reward_type VARCHAR(32) NOT NULL DEFAULT 'energy',
  reward_amount INT NOT NULL,
  daily_limit INT NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_task_templates_reward_type CHECK (reward_type IN ('energy', 'feed')),
  CONSTRAINT chk_task_templates_reward_amount CHECK (reward_amount > 0),
  CONSTRAINT chk_task_templates_daily_limit CHECK (daily_limit > 0),
  CONSTRAINT chk_task_templates_status CHECK (status IN ('active', 'disabled'))
);

INSERT IGNORE INTO task_templates
  (id, name, description, reward_type, reward_amount, daily_limit, status)
VALUES
  (
    'task_template_clock_in',
    'Clock in on time',
    'Reward employees for starting the day on schedule.',
    'energy',
    10,
    1,
    'active'
  ),
  (
    'task_template_daily_report',
    'Submit daily report',
    'Reward a concise daily progress report.',
    'feed',
    1,
    1,
    'active'
  ),
  (
    'task_template_training',
    'Complete training course',
    'Reward employees for finishing assigned training.',
    'energy',
    25,
    1,
    'active'
  );

CREATE TABLE IF NOT EXISTS task_reward_claims (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  task_template_id VARCHAR(32) NOT NULL,
  claim_date DATE NOT NULL,
  claim_slot INT NOT NULL,
  idempotency_key VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_reward_claims_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_task_reward_claims_template_id FOREIGN KEY (task_template_id) REFERENCES task_templates(id),
  CONSTRAINT chk_task_reward_claims_claim_slot CHECK (claim_slot > 0),
  CONSTRAINT uq_task_reward_claim_daily_slot UNIQUE (user_id, task_template_id, claim_date, claim_slot)
);

CREATE TABLE IF NOT EXISTS user_wallets (
  user_id VARCHAR(32) PRIMARY KEY,
  energy_balance INT NOT NULL DEFAULT 0,
  feed_balance INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_wallets_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_user_wallets_energy_balance CHECK (energy_balance >= 0),
  CONSTRAINT chk_user_wallets_feed_balance CHECK (feed_balance >= 0)
);

CREATE TABLE IF NOT EXISTS reward_transactions (
  id VARCHAR(32) PRIMARY KEY,
  user_id VARCHAR(32) NOT NULL,
  resource_type VARCHAR(32) NOT NULL,
  amount_delta INT NOT NULL,
  balance_after INT NOT NULL,
  reason VARCHAR(160) NOT NULL,
  reference_type VARCHAR(64) NOT NULL DEFAULT '',
  reference_id VARCHAR(64) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reward_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT chk_reward_transactions_resource_type CHECK (resource_type IN ('energy', 'feed')),
  CONSTRAINT chk_reward_transactions_amount_delta CHECK (amount_delta <> 0),
  CONSTRAINT chk_reward_transactions_balance_after CHECK (balance_after >= 0)
);

CREATE INDEX idx_reward_transactions_user_created_at
  ON reward_transactions (user_id, created_at);

CREATE TABLE IF NOT EXISTS pet_feed_events (
  id VARCHAR(32) PRIMARY KEY,
  pet_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  feed_amount INT NOT NULL,
  growth_delta INT NOT NULL,
  wallet_transaction_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pet_feed_events_pet_id FOREIGN KEY (pet_id) REFERENCES pets(id),
  CONSTRAINT fk_pet_feed_events_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_pet_feed_events_wallet_transaction_id FOREIGN KEY (wallet_transaction_id)
    REFERENCES reward_transactions(id),
  CONSTRAINT chk_pet_feed_events_feed_amount CHECK (feed_amount > 0),
  CONSTRAINT chk_pet_feed_events_growth_delta CHECK (growth_delta > 0)
);

CREATE TABLE IF NOT EXISTS team_activity_events (
  id VARCHAR(32) PRIMARY KEY,
  team_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  resource_id VARCHAR(32) NOT NULL,
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_team_activity_events_team_id FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT fk_team_activity_events_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_team_activity_events_team_created_at
  ON team_activity_events (team_id, created_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(32) PRIMARY KEY,
  actor_user_id VARCHAR(32) NOT NULL,
  action VARCHAR(80) NOT NULL,
  resource_type VARCHAR(80) NOT NULL,
  resource_id VARCHAR(80) NOT NULL,
  metadata_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at
  ON audit_logs (created_at);

CREATE INDEX idx_audit_logs_resource
  ON audit_logs (resource_type, resource_id);
