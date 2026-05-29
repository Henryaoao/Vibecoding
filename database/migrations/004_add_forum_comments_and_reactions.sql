ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS forum_comments (
  comment_id VARCHAR(32) PRIMARY KEY,
  forum_post_id VARCHAR(32) NOT NULL,
  parent_comment_id VARCHAR(32) NULL,
  author_user_id VARCHAR(32) NULL,
  content_body TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  reply_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  visibility_status VARCHAR(32) NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_forum_comments_forum_post_id FOREIGN KEY (forum_post_id) REFERENCES forum_posts(forum_post_id),
  CONSTRAINT fk_forum_comments_parent_comment_id FOREIGN KEY (parent_comment_id) REFERENCES forum_comments(comment_id),
  CONSTRAINT fk_forum_comments_author_user_id FOREIGN KEY (author_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_forum_comments_counts CHECK (reply_count >= 0 AND like_count >= 0),
  CONSTRAINT chk_forum_comments_visibility_status CHECK (visibility_status IN ('visible', 'hidden', 'archived'))
);

CREATE TABLE IF NOT EXISTS forum_reactions (
  reaction_id VARCHAR(32) PRIMARY KEY,
  target_resource_type VARCHAR(32) NOT NULL,
  target_resource_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  reaction_type VARCHAR(32) NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_forum_reactions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT uq_forum_reactions_user_target UNIQUE (user_id, target_resource_type, target_resource_id, reaction_type),
  CONSTRAINT chk_forum_reactions_target_type CHECK (target_resource_type IN ('forum_post', 'forum_comment')),
  CONSTRAINT chk_forum_reactions_reaction_type CHECK (reaction_type IN ('like'))
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_visibility_hot_score_created_at ON forum_posts (visibility_status, hot_score, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_created_at ON forum_posts (author_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_status_created_at ON forum_comments (forum_post_id, visibility_status, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_created_at ON forum_comments (parent_comment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_created_at ON forum_comments (author_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_target ON forum_reactions (target_resource_type, target_resource_id);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_created_at ON forum_reactions (user_id, created_at);

INSERT INTO forum_comments
  (comment_id, forum_post_id, parent_comment_id, author_user_id, content_body, image_url, reply_count, like_count, visibility_status)
VALUES
  ('FCM_01JPM000000000000000001A', 'FPO_01JPM000000000000000001A', NULL, 'USR_01JPM000000000000000001A', '我推荐先把重复报表整理成模板，再考虑自动化工具。', '', 1, 6, 'visible'),
  ('FCM_01JPM000000000000000002A', 'FPO_01JPM000000000000000001A', 'FCM_01JPM000000000000000001A', 'USR_01JPM000000000000000002A', '这个方向很好，后续可以放到文档中心做成团队模板。', '', 0, 3, 'visible'),
  ('FCM_01JPM000000000000000003A', 'FPO_01JPM000000000000000002A', NULL, 'USR_01JPM000000000000000001A', '新人第一周建议先确认邮箱、门禁、VPN 和报销系统权限。', '', 0, 4, 'visible')
ON CONFLICT DO NOTHING;

INSERT INTO forum_reactions
  (reaction_id, target_resource_type, target_resource_id, user_id, reaction_type)
VALUES
  ('FRE_01JPM000000000000000001A', 'forum_post', 'FPO_01JPM000000000000000001A', 'USR_01JPM000000000000000001A', 'like'),
  ('FRE_01JPM000000000000000002A', 'forum_comment', 'FCM_01JPM000000000000000001A', 'USR_01JPM000000000000000002A', 'like')
ON CONFLICT DO NOTHING;
