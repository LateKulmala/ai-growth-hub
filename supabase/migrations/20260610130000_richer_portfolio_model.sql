-- Richer portfolio / documentation model
-- Link projects <-> agents <-> experiments, add project links & files, richer project fields.

-- ===== projects: richer documentation fields =====
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS purpose text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS future_ideas text DEFAULT '',
  ADD COLUMN IF NOT EXISTS value_created text DEFAULT '',
  ADD COLUMN IF NOT EXISTS technologies text[] DEFAULT '{}';

-- ===== agents: belong to a project =====
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_agents_project_id ON public.agents (project_id);

-- ===== experiments: optionally tied to a project =====
ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_experiments_project_id ON public.experiments (project_id);

-- ===== project_links: GitHub / Lovable / Replit / Supabase / n8n / demo / docs ... =====
CREATE TABLE IF NOT EXISTS public.project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'other',
  label text DEFAULT '',
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_links TO anon, authenticated;
GRANT ALL ON public.project_links TO service_role;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open all" ON public.project_links;
CREATE POLICY "open all" ON public.project_links FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_project_links_updated_at BEFORE UPDATE ON public.project_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_project_links_project_id ON public.project_links (project_id);

-- ===== project_files: docs / specs / images / resources per project =====
CREATE TABLE IF NOT EXISTS public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'doc',
  url text,
  storage_path text,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_files TO anon, authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "open all" ON public.project_files;
CREATE POLICY "open all" ON public.project_files FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_project_files_updated_at BEFORE UPDATE ON public.project_files FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files (project_id);

-- ===== ai_news dedup for future n8n ingestion =====
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_news_url ON public.ai_news (url) WHERE url IS NOT NULL;
