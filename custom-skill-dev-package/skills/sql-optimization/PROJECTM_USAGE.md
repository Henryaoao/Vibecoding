# ProjectM SQL Optimization Skill Usage

This folder packages the `$sql-optimization` skill as a project-local portable
skill. Use it when a collaborator does not have the original local installation.

## When To Use

Use this skill for ProjectM when reviewing or changing:

- PostgreSQL table design.
- Foreign keys and relationship clarity.
- Index strategy for list, detail, admin, and audit queries.
- Migration safety and idempotency.
- Seed data shape.
- Query patterns for future Go REST API handlers.

## ProjectM Review Checklist

When reviewing database changes, check both design clarity and performance:

- Does every cached count have a source-of-truth table?
  Example: `forum_posts.reply_count` should be backed by `forum_comments`.
- Does every user action that needs auditability have an action table?
  Example: `document_downloads` records explicit document download actions.
- Are relationship fields readable and consistent?
  Example: use `created_by_user_id`, `author_user_id`, `parent_comment_id`.
- Are list queries covered by indexes?
  Example: published content lists should index status/category/date fields.
- Are detail-page child records indexed?
  Example: comments should index `(forum_post_id, visibility_status, created_at)`.
- Are user-specific views supported?
  Example: training progress should use unique `(user_id, course_id)`.
- Are migrations safe for existing local and Railway databases?
  Use `CREATE TABLE IF NOT EXISTS`, `INSERT ... ON CONFLICT DO NOTHING`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, and idempotent `CREATE INDEX IF NOT EXISTS`.
- Does the diagram match the SQL?
  Update `docs/diagrams.md` and the PostgreSQL SQL/migration together.

## Files To Review Together

```text
docs/diagrams.md
docs/ProjectMprd.md
ProjectM-source-code/database/init/001_projectm_schema.sql
ProjectM-source-code/database/migrations/
```

## Expected Output

For a useful review, report:

- Schema issues found.
- Missing relationship/source-of-truth tables.
- Index or query risks.
- Migration risks.
- Recommended SQL changes.
- Diagram or PRD sections that must be updated with the SQL.
