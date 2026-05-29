ALTER TABLE users
  ADD COLUMN IF NOT EXISTS teams_user_id VARCHAR(128) NULL,
  ADD COLUMN IF NOT EXISTS teams_tenant_id VARCHAR(128) NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_teams_user_id ON users (teams_user_id) WHERE teams_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_teams_tenant_id ON users (teams_tenant_id) WHERE teams_tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users (last_login_at);
