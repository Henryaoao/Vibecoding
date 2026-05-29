package repository

import (
	"context"
	"encoding/json"
	"fmt"

	"projectm/backend/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContentRepository struct {
	db *pgxpool.Pool
}

func NewContentRepository(db *pgxpool.Pool) *ContentRepository {
	return &ContentRepository{db: db}
}

func (r *ContentRepository) LoadHomeSections(ctx context.Context) (map[string][]model.ContentItem, error) {
	batch := &pgx.Batch{}
	for _, section := range model.SectionOrder {
		query, err := sectionQuery(section, 3)
		if err != nil {
			return nil, err
		}
		batch.Queue(query)
	}

	results := r.db.SendBatch(ctx, batch)
	defer results.Close()

	sections := make(map[string][]model.ContentItem, len(model.SectionOrder))
	for _, section := range model.SectionOrder {
		items, err := scanItems(results.QueryRow())
		if err != nil {
			return nil, fmt.Errorf("load %s: %w", section, err)
		}
		sections[section] = items
	}
	return sections, nil
}

func (r *ContentRepository) LoadSection(ctx context.Context, section string, limit int) ([]model.ContentItem, error) {
	query, err := sectionQuery(section, limit)
	if err != nil {
		return nil, err
	}

	return scanItems(r.db.QueryRow(ctx, query))
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanItems(row rowScanner) ([]model.ContentItem, error) {
	var raw []byte
	if err := row.Scan(&raw); err != nil {
		return nil, err
	}

	var items []model.ContentItem
	if err := json.Unmarshal(raw, &items); err != nil {
		return nil, err
	}
	return items, nil
}

func sectionQuery(section string, limit int) (string, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}

	wrap := func(inner string) string {
		return fmt.Sprintf("SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) FROM (%s LIMIT %d) row_data;", inner, limit)
	}

	switch section {
	case "briefs":
		return wrap(`
SELECT
  brief_id AS id,
  'briefs' AS section,
  title,
  summary,
  'daily' AS category,
  cover_image_url AS "imageUrl",
  concat_ws(E'\n', weather_note, finance_one_liner, birthday_note) AS body,
  publication_status AS status,
  false AS pinned,
  COALESCE(to_char(published_at AT TIME ZONE 'Asia/Hong_Kong', 'YYYY-MM-DD HH24:MI'), brief_date::text) AS "publishedAt",
  ARRAY[weather_note, finance_one_liner, birthday_note] AS meta
FROM company_briefs
WHERE publication_status = 'published' AND deleted_at IS NULL
ORDER BY brief_date DESC, created_at DESC`), nil
	case "announcements":
		return wrap(`
SELECT
  announcement_id AS id,
  'announcements' AS section,
  title,
  summary,
  announcement_category AS category,
  cover_image_url AS "imageUrl",
  content_body AS body,
  publication_status AS status,
  is_pinned AS pinned,
  COALESCE(to_char(published_at AT TIME ZONE 'Asia/Hong_Kong', 'YYYY-MM-DD HH24:MI'), '') AS "publishedAt",
  ARRAY[announcement_category, CASE WHEN is_pinned THEN '置顶' ELSE '普通' END] AS meta
FROM announcements
WHERE publication_status = 'published'
  AND deleted_at IS NULL
  AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
ORDER BY is_pinned DESC, published_at DESC NULLS LAST, created_at DESC`), nil
	case "forum":
		return wrap(`
SELECT
  forum_post_id AS id,
  'forum' AS section,
  title,
  content_body AS summary,
  forum_category AS category,
  image_url AS "imageUrl",
  content_body AS body,
  visibility_status AS status,
  hot_score >= 80 AS pinned,
  to_char(created_at AT TIME ZONE 'Asia/Hong_Kong', 'YYYY-MM-DD HH24:MI') AS "publishedAt",
  ARRAY[
    concat(reply_count::text, ' 回复'),
    concat(like_count::text, ' 赞'),
    concat(view_count::text, ' 浏览'),
    concat('热度 ', hot_score::text)
  ] AS meta
FROM forum_posts
WHERE visibility_status = 'visible' AND deleted_at IS NULL
ORDER BY hot_score DESC, created_at DESC`), nil
	case "newcomer":
		return wrap(`
SELECT
  newcomer_resource_id AS id,
  'newcomer' AS section,
  title,
  summary,
  newcomer_resource_type AS category,
  cover_image_url AS "imageUrl",
  newcomer_content AS body,
  publication_status AS status,
  sort_order <= 10 AS pinned,
  to_char(created_at AT TIME ZONE 'Asia/Hong_Kong', 'YYYY-MM-DD HH24:MI') AS "publishedAt",
  ARRAY[newcomer_resource_type, concat('排序 ', sort_order::text)] AS meta
FROM newcomer_resources
WHERE publication_status = 'published' AND deleted_at IS NULL
ORDER BY sort_order ASC, created_at DESC`), nil
	case "finance":
		return wrap(`
SELECT
  finance_news_id AS id,
  'finance' AS section,
  title,
  summary,
  source_name AS category,
  thumbnail_image_url AS "imageUrl",
  content_body AS body,
  publication_status AS status,
  false AS pinned,
  publish_date::text AS "publishedAt",
  ARRAY[source_name, '仅作财经知识与公开信息学习参考'] AS meta
FROM finance_news
WHERE publication_status = 'published' AND deleted_at IS NULL
ORDER BY publish_date DESC, created_at DESC`), nil
	case "documents":
		return wrap(`
SELECT
  document_id AS id,
  'documents' AS section,
  title,
  summary,
  document_category AS category,
  cover_image_url AS "imageUrl",
  document_content AS body,
  publication_status AS status,
  false AS pinned,
  to_char(created_at AT TIME ZONE 'Asia/Hong_Kong', 'YYYY-MM-DD HH24:MI') AS "publishedAt",
  ARRAY[document_category, concat(download_count::text, ' 次下载')] AS meta
FROM documents
WHERE publication_status = 'published' AND deleted_at IS NULL
ORDER BY created_at DESC`), nil
	case "training":
		return wrap(`
SELECT
  course_id AS id,
  'training' AS section,
  title,
  summary,
  course_category AS category,
  cover_image_url AS "imageUrl",
  course_content AS body,
  publication_status AS status,
  false AS pinned,
  to_char(created_at AT TIME ZONE 'Asia/Hong_Kong', 'YYYY-MM-DD HH24:MI') AS "publishedAt",
  ARRAY[course_category, concat(duration_minutes::text, ' 分钟')] AS meta
FROM training_courses
WHERE publication_status = 'published' AND deleted_at IS NULL
ORDER BY created_at DESC`), nil
	default:
		return "", fmt.Errorf("unknown section %q", section)
	}
}
