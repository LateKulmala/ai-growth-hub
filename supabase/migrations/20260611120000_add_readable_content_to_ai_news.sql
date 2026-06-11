-- Add full readable content + kind (news | lesson) to ai_news so articles and
-- lessons can be read inside the app instead of only linking out.
ALTER TABLE ai_news
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'news';

COMMENT ON COLUMN ai_news.content IS 'Full readable body (markdown-lite) shown inside the app.';
COMMENT ON COLUMN ai_news.kind IS 'news | lesson';

CREATE INDEX IF NOT EXISTS ai_news_kind_idx ON ai_news (kind);
