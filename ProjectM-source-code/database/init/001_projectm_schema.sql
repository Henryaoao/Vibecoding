CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(32) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(120) NOT NULL,
  avatar_url VARCHAR(500) NOT NULL DEFAULT '',
  teams_user_id VARCHAR(128) NULL,
  teams_tenant_id VARCHAR(128) NULL,
  role_code VARCHAR(32) NOT NULL DEFAULT 'user',
  department VARCHAR(120) NOT NULL DEFAULT '',
  title VARCHAR(120) NOT NULL DEFAULT '',
  account_status VARCHAR(32) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_role_code CHECK (role_code IN ('user', 'super_user')),
  CONSTRAINT chk_users_account_status CHECK (account_status IN ('active', 'disabled'))
);

CREATE TABLE IF NOT EXISTS company_briefs (
  brief_id VARCHAR(32) PRIMARY KEY,
  brief_date DATE NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL DEFAULT '',
  weather_note VARCHAR(255) NOT NULL DEFAULT '',
  finance_one_liner VARCHAR(255) NOT NULL DEFAULT '',
  birthday_note VARCHAR(255) NOT NULL DEFAULT '',
  publication_status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by_user_id VARCHAR(32) NULL,
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_company_briefs_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT uq_company_briefs_date UNIQUE (brief_date),
  CONSTRAINT chk_company_briefs_publication_status CHECK (publication_status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  announcement_category VARCHAR(32) NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL DEFAULT '',
  attachment_image_url VARCHAR(500) NOT NULL DEFAULT '',
  content_body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  publication_status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by_user_id VARCHAR(32) NULL,
  published_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_announcements_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_announcements_category CHECK (announcement_category IN ('holiday', 'schedule', 'office', 'benefit', 'event', 'general')),
  CONSTRAINT chk_announcements_publication_status CHECK (publication_status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS forum_posts (
  forum_post_id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  author_user_id VARCHAR(32) NULL,
  forum_category VARCHAR(80) NOT NULL DEFAULT 'general',
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  content_body TEXT NOT NULL,
  reply_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  hot_score NUMERIC(10,2) NOT NULL DEFAULT 0,
  visibility_status VARCHAR(32) NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_forum_posts_author_user_id FOREIGN KEY (author_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_forum_posts_counts CHECK (reply_count >= 0 AND view_count >= 0 AND like_count >= 0),
  CONSTRAINT chk_forum_posts_visibility_status CHECK (visibility_status IN ('visible', 'hidden', 'archived'))
);

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

CREATE TABLE IF NOT EXISTS newcomer_resources (
  newcomer_resource_id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  newcomer_resource_type VARCHAR(32) NOT NULL,
  summary TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL DEFAULT '',
  newcomer_content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  publication_status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by_user_id VARCHAR(32) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_newcomer_resources_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_newcomer_resources_type CHECK (newcomer_resource_type IN ('guide', 'map', 'system', 'food', 'faq', 'intro_wall')),
  CONSTRAINT chk_newcomer_resources_publication_status CHECK (publication_status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS finance_news (
  finance_news_id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  source_name VARCHAR(120) NOT NULL DEFAULT 'internal',
  tag_names_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT NOT NULL,
  thumbnail_image_url VARCHAR(500) NOT NULL DEFAULT '',
  content_body TEXT NOT NULL,
  publish_date DATE NOT NULL,
  publication_status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by_user_id VARCHAR(32) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_finance_news_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_finance_news_publication_status CHECK (publication_status IN ('draft', 'published', 'archived')),
  CONSTRAINT chk_finance_news_tag_names_json_array CHECK (jsonb_typeof(tag_names_json) = 'array')
);

CREATE TABLE IF NOT EXISTS documents (
  document_id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  document_category VARCHAR(80) NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL DEFAULT '',
  file_url VARCHAR(500) NOT NULL DEFAULT '',
  document_content TEXT NOT NULL,
  publication_status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by_user_id VARCHAR(32) NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_documents_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_documents_download_count CHECK (download_count >= 0),
  CONSTRAINT chk_documents_publication_status CHECK (publication_status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS training_courses (
  course_id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  course_category VARCHAR(80) NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL,
  cover_image_url VARCHAR(500) NOT NULL DEFAULT '',
  course_content TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  publication_status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by_user_id VARCHAR(32) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  CONSTRAINT fk_training_courses_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_training_courses_duration CHECK (duration_minutes >= 0),
  CONSTRAINT chk_training_courses_publication_status CHECK (publication_status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS document_downloads (
  download_id VARCHAR(32) PRIMARY KEY,
  document_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_document_downloads_document_id FOREIGN KEY (document_id) REFERENCES documents(document_id),
  CONSTRAINT fk_document_downloads_user_id FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS training_course_progress (
  progress_id VARCHAR(32) PRIMARY KEY,
  course_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  progress_percent SMALLINT NOT NULL DEFAULT 0,
  progress_status VARCHAR(32) NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_training_course_progress_course_id FOREIGN KEY (course_id) REFERENCES training_courses(course_id),
  CONSTRAINT fk_training_course_progress_user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
  CONSTRAINT uq_training_course_progress_user_course UNIQUE (user_id, course_id),
  CONSTRAINT chk_training_course_progress_percent CHECK (progress_percent >= 0 AND progress_percent <= 100),
  CONSTRAINT chk_training_course_progress_status CHECK (progress_status IN ('not_started', 'in_progress', 'completed'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_log_id VARCHAR(32) PRIMARY KEY,
  actor_user_id VARCHAR(32) NULL,
  action_name VARCHAR(100) NOT NULL,
  target_resource_type VARCHAR(100) NOT NULL,
  target_resource_id VARCHAR(32) NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_actor_user_id FOREIGN KEY (actor_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_audit_logs_metadata_json_object CHECK (jsonb_typeof(metadata_json) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_users_lower_email ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_teams_user_id ON users (teams_user_id) WHERE teams_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_teams_tenant_id ON users (teams_tenant_id) WHERE teams_tenant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users (last_login_at);
CREATE INDEX IF NOT EXISTS idx_company_briefs_created_by_user_id ON company_briefs (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by_user_id ON announcements (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_publication_status_published_at ON announcements (publication_status, published_at);
CREATE INDEX IF NOT EXISTS idx_announcements_published_active ON announcements (is_pinned, published_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forum_posts_visibility_hot_score_created_at ON forum_posts (visibility_status, hot_score, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_created_at ON forum_posts (author_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post_status_created_at ON forum_comments (forum_post_id, visibility_status, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_created_at ON forum_comments (parent_comment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_created_at ON forum_comments (author_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_reactions_target ON forum_reactions (target_resource_type, target_resource_id);
CREATE INDEX IF NOT EXISTS idx_newcomer_resources_created_by_user_id ON newcomer_resources (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_newcomer_resources_published_order ON newcomer_resources (sort_order, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_news_created_by_user_id ON finance_news (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_finance_news_publication_publish_date ON finance_news (publication_status, publish_date);
CREATE INDEX IF NOT EXISTS idx_finance_news_tags_gin ON finance_news USING GIN (tag_names_json);
CREATE INDEX IF NOT EXISTS idx_finance_news_published_active ON finance_news (publish_date DESC, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_created_by_user_id ON documents (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_publication_category_created_at ON documents (publication_status, document_category, created_at);
CREATE INDEX IF NOT EXISTS idx_documents_published_active ON documents (document_category, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_courses_created_by_user_id ON training_courses (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_training_courses_publication_category_created_at ON training_courses (publication_status, course_category, created_at);
CREATE INDEX IF NOT EXISTS idx_training_courses_published_active ON training_courses (course_category, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_document_downloads_document_downloaded_at ON document_downloads (document_id, downloaded_at);
CREATE INDEX IF NOT EXISTS idx_document_downloads_user_downloaded_at ON document_downloads (user_id, downloaded_at);
CREATE INDEX IF NOT EXISTS idx_training_course_progress_course_status ON training_course_progress (course_id, progress_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at ON audit_logs (actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_resource ON audit_logs (target_resource_type, target_resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata_json);

INSERT INTO users
  (user_id, email, display_name, role_code, department, title, account_status)
VALUES
  ('USR_01JPM000000000000000001A', 'admin@projectm.local', 'ProjectM Super User', 'super_user', 'Admin', 'System Administrator', 'active'),
  ('USR_01JPM000000000000000002A', 'user@projectm.local', 'ProjectM Demo User', 'user', 'Operations', 'Employee', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO announcements
  (announcement_id, title, announcement_category, summary, content_body, is_pinned, publication_status, created_by_user_id, published_at)
VALUES
  (
    'ANN_01JPM000000000000000000A',
    'ProjectM database environment is ready',
    'general',
    'Initial Docker and PostgreSQL environment for ProjectM.',
    'This seed announcement confirms that the ProjectM PostgreSQL schema can be initialized through Docker Compose.',
    TRUE,
    'published',
    'USR_01JPM000000000000000001A',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (announcement_id) DO UPDATE SET
  title = EXCLUDED.title,
  announcement_category = EXCLUDED.announcement_category,
  summary = EXCLUDED.summary,
  content_body = EXCLUDED.content_body,
  is_pinned = EXCLUDED.is_pinned,
  publication_status = EXCLUDED.publication_status,
  created_by_user_id = EXCLUDED.created_by_user_id,
  published_at = EXCLUDED.published_at,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO company_briefs
  (brief_id, brief_date, title, summary, cover_image_url, weather_note, finance_one_liner, birthday_note, publication_status, created_by_user_id, published_at)
VALUES
  (
    'BRF_01JPM000000000000000001A',
    CURRENT_DATE,
    '今日公司简报',
    '今日重点：上午系统维护提醒，下午新人培训，文档中心新增两份制度模板。',
    'https://images.example.com/projectm/briefs/daily-office.jpg',
    '今日有阵雨，外出拜访同事请预留交通时间。',
    '财经一句话：市场关注本周主要经济数据发布，内部资讯仅作学习参考。',
    '生日提醒：祝本月生日同事工作顺利，天天开心。',
    'published',
    'USR_01JPM000000000000000001A',
    CURRENT_TIMESTAMP
  )
ON CONFLICT DO NOTHING;

INSERT INTO announcements
  (announcement_id, title, announcement_category, summary, cover_image_url, attachment_image_url, content_body, is_pinned, publication_status, created_by_user_id, published_at)
VALUES
  (
    'ANN_01JPM000000000000000001A',
    '端午节假期与调休安排aaa',
    'holiday',
    '请各部门提前完成节前工作交接，并确认值班联系人。',
    'https://images.example.com/projectm/announcements/holiday-cover.jpg',
    'https://images.example.com/projectm/announcements/holiday-calendar.png',
    '端午节期间请留意办公区开放时间。需要加班或使用会议室的同事，请提前向行政登记。',
    TRUE,
    'published',
    'USR_01JPM000000000000000001A',
    CURRENT_TIMESTAMP
  ),
  (
    'ANN_01JPM000000000000000002A',
    '办公区空调维护通知',
    'office',
    '本周五 19:00 后将进行办公区空调例行维护。',
    'https://images.example.com/projectm/announcements/office-maintenance.jpg',
    '',
    '维护期间部分区域温度可能不稳定，请需要留办公室的同事提前安排座位。',
    FALSE,
    'published',
    'USR_01JPM000000000000000001A',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (announcement_id) DO UPDATE SET
  title = EXCLUDED.title,
  announcement_category = EXCLUDED.announcement_category,
  summary = EXCLUDED.summary,
  cover_image_url = EXCLUDED.cover_image_url,
  attachment_image_url = EXCLUDED.attachment_image_url,
  content_body = EXCLUDED.content_body,
  is_pinned = EXCLUDED.is_pinned,
  publication_status = EXCLUDED.publication_status,
  created_by_user_id = EXCLUDED.created_by_user_id,
  published_at = EXCLUDED.published_at,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO forum_posts
  (forum_post_id, title, author_user_id, forum_category, image_url, content_body, reply_count, view_count, like_count, hot_score, visibility_status)
VALUES
  (
    'FPO_01JPM000000000000000001A',
    '大家最近最常用的效率工具是什么？',
    'USR_01JPM000000000000000002A',
    'weekly-topic',
    'https://images.example.com/projectm/forum/productivity-tools.jpg',
    '本周讨论话题：分享一个你觉得能减少重复工作的工具或方法。',
    18,
    236,
    24,
    92.50,
    'visible'
  ),
  (
    'FPO_01JPM000000000000000002A',
    '新人入职第一周最容易遗漏的事项',
    'USR_01JPM000000000000000002A',
    'newcomer',
    'https://images.example.com/projectm/forum/newcomer-checklist.jpg',
    '整理了几条新人同事经常问的问题，欢迎大家继续补充。',
    11,
    168,
    15,
    76.20,
    'visible'
  )
ON CONFLICT DO NOTHING;

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

INSERT INTO newcomer_resources
  (newcomer_resource_id, title, newcomer_resource_type, summary, cover_image_url, newcomer_content, sort_order, publication_status, created_by_user_id)
VALUES
  ('NWR_01JPM000000000000000001A', '新人入职第一天指南', 'guide', '账号、门禁、工位、沟通群和常用系统的第一天清单。', 'https://images.example.com/projectm/newcomer/day-one-guide.jpg', '请先确认公司邮箱、即时通讯、VPN、考勤系统和文档中心权限是否可用。', 10, 'published', 'USR_01JPM000000000000000001A'),
  ('NWR_01JPM000000000000000002A', '办公区地图与会议室说明', 'map', '快速找到会议室、茶水间、打印区和行政支持位置。', 'https://images.example.com/projectm/newcomer/office-map.png', '会议室使用前请在日历系统预订；临时会议优先选择开放协作区。', 20, 'published', 'USR_01JPM000000000000000001A')
ON CONFLICT DO NOTHING;

INSERT INTO finance_news
  (finance_news_id, title, source_name, tag_names_json, summary, thumbnail_image_url, content_body, publish_date, publication_status, created_by_user_id)
VALUES
  ('FIN_01JPM000000000000000001A', '财经早知道：本周重点经济日历', 'internal editorial', '["市场", "财经日历"]'::jsonb, '整理本周主要公开经济数据发布日期，供员工了解市场信息节奏。', 'https://images.example.com/projectm/finance/economic-calendar.jpg', '本文仅作财经知识与公开信息学习参考，不作为任何行动依据或结果承诺。', CURRENT_DATE, 'published', 'USR_01JPM000000000000000001A'),
  ('FIN_01JPM000000000000000002A', '金融小知识：什么是基准利率', 'internal editorial', '["金融小知识", "政策"]'::jsonb, '用通俗语言解释基准利率及其对企业融资环境的影响。', 'https://images.example.com/projectm/finance/interest-rate.jpg', '基准利率通常被市场用作观察融资成本变化的参考指标。本文只做概念介绍。', CURRENT_DATE, 'published', 'USR_01JPM000000000000000001A')
ON CONFLICT DO NOTHING;

INSERT INTO documents
  (document_id, title, document_category, summary, cover_image_url, file_url, document_content, publication_status, created_by_user_id)
VALUES
  ('DOC_01JPM000000000000000001A', '员工报销流程模板', 'finance', '说明常见报销类型、提交材料和审批路径。', 'https://images.example.com/projectm/documents/expense-cover.jpg', 'https://files.example.com/projectm/documents/expense-policy.pdf', '适用于差旅、办公采购和业务招待等常见报销场景。', 'published', 'USR_01JPM000000000000000001A'),
  ('DOC_01JPM000000000000000002A', '会议室使用规范', 'office', '会议室预订、释放和设备使用说明。', 'https://images.example.com/projectm/documents/meeting-room-cover.jpg', 'https://files.example.com/projectm/documents/meeting-room-guide.pdf', '请按需预订会议室，并在会议结束后关闭屏幕和灯光。', 'published', 'USR_01JPM000000000000000001A')
ON CONFLICT DO NOTHING;

INSERT INTO training_courses
  (course_id, title, course_category, summary, cover_image_url, course_content, duration_minutes, publication_status, created_by_user_id)
VALUES
  ('TRN_01JPM000000000000000001A', '信息安全入门培训', 'security', '账号安全、钓鱼邮件识别和资料保护基础课程。', 'https://images.example.com/projectm/training/security-basics.jpg', '课程包含密码管理、双因素认证、敏感资料处理和常见攻击识别。', 45, 'published', 'USR_01JPM000000000000000001A'),
  ('TRN_01JPM000000000000000002A', '新人系统使用培训', 'newcomer', '介绍公司常用系统入口、权限申请和支持渠道。', 'https://images.example.com/projectm/training/internal-systems.jpg', '适合入职一周内的新同事完成，用于熟悉日常协作系统。', 35, 'published', 'USR_01JPM000000000000000001A')
ON CONFLICT DO NOTHING;

INSERT INTO document_downloads
  (download_id, document_id, user_id)
VALUES
  ('DLD_01JPM000000000000000001A', 'DOC_01JPM000000000000000001A', 'USR_01JPM000000000000000002A')
ON CONFLICT DO NOTHING;

INSERT INTO training_course_progress
  (progress_id, course_id, user_id, progress_percent, progress_status, started_at, completed_at)
VALUES
  ('TCP_01JPM000000000000000001A', 'TRN_01JPM000000000000000001A', 'USR_01JPM000000000000000002A', 100, 'completed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('TCP_01JPM000000000000000002A', 'TRN_01JPM000000000000000002A', 'USR_01JPM000000000000000002A', 30, 'in_progress', CURRENT_TIMESTAMP, NULL)
ON CONFLICT DO NOTHING;
