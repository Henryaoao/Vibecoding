ALTER TABLE company_briefs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE forum_comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE newcomer_resources ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE finance_news ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE training_courses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

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

CREATE INDEX IF NOT EXISTS idx_documents_publication_category_created_at ON documents (publication_status, document_category, created_at);
CREATE INDEX IF NOT EXISTS idx_documents_published_active ON documents (document_category, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_courses_publication_category_created_at ON training_courses (publication_status, course_category, created_at);
CREATE INDEX IF NOT EXISTS idx_training_courses_published_active ON training_courses (course_category, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_document_downloads_document_downloaded_at ON document_downloads (document_id, downloaded_at);
CREATE INDEX IF NOT EXISTS idx_document_downloads_user_downloaded_at ON document_downloads (user_id, downloaded_at);
CREATE INDEX IF NOT EXISTS idx_training_course_progress_course_status ON training_course_progress (course_id, progress_status);

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
