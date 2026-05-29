DO $$
DECLARE
  target_table text;
  target_column text;
BEGIN
  FOR target_table, target_column IN
    SELECT *
    FROM (VALUES
      ('users', 'created_at'),
      ('users', 'updated_at'),
      ('company_briefs', 'published_at'),
      ('company_briefs', 'created_at'),
      ('company_briefs', 'updated_at'),
      ('company_briefs', 'deleted_at'),
      ('announcements', 'published_at'),
      ('announcements', 'expires_at'),
      ('announcements', 'created_at'),
      ('announcements', 'updated_at'),
      ('announcements', 'deleted_at'),
      ('forum_posts', 'created_at'),
      ('forum_posts', 'updated_at'),
      ('forum_posts', 'deleted_at'),
      ('forum_comments', 'created_at'),
      ('forum_comments', 'updated_at'),
      ('forum_comments', 'deleted_at'),
      ('forum_reactions', 'created_at'),
      ('newcomer_resources', 'created_at'),
      ('newcomer_resources', 'updated_at'),
      ('newcomer_resources', 'deleted_at'),
      ('finance_news', 'created_at'),
      ('finance_news', 'updated_at'),
      ('finance_news', 'deleted_at'),
      ('documents', 'created_at'),
      ('documents', 'updated_at'),
      ('documents', 'deleted_at'),
      ('training_courses', 'created_at'),
      ('training_courses', 'updated_at'),
      ('training_courses', 'deleted_at'),
      ('document_downloads', 'downloaded_at'),
      ('training_course_progress', 'started_at'),
      ('training_course_progress', 'completed_at'),
      ('training_course_progress', 'created_at'),
      ('training_course_progress', 'updated_at'),
      ('audit_logs', 'created_at')
    ) AS columns_to_convert(table_name, column_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = target_table
        AND column_name = target_column
        AND data_type = 'timestamp without time zone'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN %I TYPE TIMESTAMPTZ USING %I AT TIME ZONE ''UTC''',
        target_table,
        target_column,
        target_column
      );
    END IF;
  END LOOP;
END $$;

ALTER TABLE finance_news ALTER COLUMN tag_names_json SET DEFAULT '[]'::jsonb;
ALTER TABLE audit_logs ALTER COLUMN metadata_json SET DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_finance_news_tag_names_json_array'
  ) THEN
    ALTER TABLE finance_news
      ADD CONSTRAINT chk_finance_news_tag_names_json_array
      CHECK (jsonb_typeof(tag_names_json) = 'array');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_audit_logs_metadata_json_object'
  ) THEN
    ALTER TABLE audit_logs
      ADD CONSTRAINT chk_audit_logs_metadata_json_object
      CHECK (jsonb_typeof(metadata_json) = 'object');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_lower_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_company_briefs_created_by_user_id ON company_briefs (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by_user_id ON announcements (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published_active ON announcements (is_pinned, published_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forum_reactions_user_created_at ON forum_reactions (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_newcomer_resources_created_by_user_id ON newcomer_resources (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_newcomer_resources_published_order ON newcomer_resources (sort_order, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_finance_news_created_by_user_id ON finance_news (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_finance_news_tags_gin ON finance_news USING GIN (tag_names_json);
CREATE INDEX IF NOT EXISTS idx_finance_news_published_active ON finance_news (publish_date DESC, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_created_by_user_id ON documents (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_published_active ON documents (document_category, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_training_courses_created_by_user_id ON training_courses (created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_training_courses_published_active ON training_courses (course_category, created_at DESC) WHERE publication_status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created_at ON audit_logs (actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata_json);
