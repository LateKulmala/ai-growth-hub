
-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================================
-- profile (singleton-ish; multiple allowed but app uses first row)
CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL DEFAULT 'AI Operator',
  bio text DEFAULT '',
  focus_areas text[] DEFAULT '{}',
  tools text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  strengths text[] DEFAULT '{}',
  development_goals text[] DEFAULT '{}',
  public_summary text DEFAULT '',
  learning_score integer NOT NULL DEFAULT 0,
  weekly_streak integer NOT NULL DEFAULT 0,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile TO anon, authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.profile FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  problem text DEFAULT '',
  tools text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  github_url text,
  demo_url text,
  learnings text DEFAULT '',
  next_improvements text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT '',
  description text DEFAULT '',
  trigger_type text DEFAULT 'manual',
  input text DEFAULT '',
  output text DEFAULT '',
  tools text[] DEFAULT '{}',
  n8n_url text,
  status text NOT NULL DEFAULT 'idle',
  last_run timestamptz,
  success_rate numeric DEFAULT 0,
  notes text DEFAULT '',
  improvement_ideas text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO anon, authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.agents FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'success',
  duration_ms integer,
  input jsonb,
  output jsonb,
  error text,
  ran_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_runs TO anon, authenticated;
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.agent_runs FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_agent_runs_updated_at BEFORE UPDATE ON public.agent_runs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.daily_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  executive_summary text DEFAULT '',
  hot_topics text[] DEFAULT '{}',
  recommended_articles jsonb DEFAULT '[]',
  key_links jsonb DEFAULT '[]',
  why_it_matters text DEFAULT '',
  what_to_learn text DEFAULT '',
  related_experiment_id uuid,
  telegram_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_briefings TO anon, authenticated;
GRANT ALL ON public.daily_briefings TO service_role;
ALTER TABLE public.daily_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.daily_briefings FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_daily_briefings_updated_at BEFORE UPDATE ON public.daily_briefings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  category text DEFAULT '',
  difficulty integer DEFAULT 5 CHECK (difficulty BETWEEN 1 AND 10),
  estimated_time text DEFAULT '',
  tools_needed text[] DEFAULT '{}',
  background text DEFAULT '',
  task text DEFAULT '',
  instructions text DEFAULT '',
  success_criteria text DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  result_summary text DEFAULT '',
  result_url text,
  self_reflection text DEFAULT '',
  ai_feedback text DEFAULT '',
  score integer CHECK (score BETWEEN 0 AND 100),
  learnings text DEFAULT '',
  next_idea text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiments TO anon, authenticated;
GRANT ALL ON public.experiments TO service_role;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.experiments FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.experiment_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE,
  reviewer text DEFAULT 'AI',
  feedback text DEFAULT '',
  score integer CHECK (score BETWEEN 0 AND 100),
  strengths text DEFAULT '',
  weaknesses text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiment_reviews TO anon, authenticated;
GRANT ALL ON public.experiment_reviews TO service_role;
ALTER TABLE public.experiment_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.experiment_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_experiment_reviews_updated_at BEFORE UPDATE ON public.experiment_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.ai_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text DEFAULT '',
  url text,
  summary text DEFAULT '',
  category text DEFAULT '',
  relevance_score integer DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  trend_score integer DEFAULT 5 CHECK (trend_score BETWEEN 1 AND 10),
  tags text[] DEFAULT '{}',
  discovered_at timestamptz NOT NULL DEFAULT now(),
  related_briefing_id uuid REFERENCES public.daily_briefings(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_news TO anon, authenticated;
GRANT ALL ON public.ai_news TO service_role;
ALTER TABLE public.ai_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.ai_news FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_ai_news_updated_at BEFORE UPDATE ON public.ai_news FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.social_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text DEFAULT 'LinkedIn',
  author text DEFAULT '',
  post_url text,
  topic text DEFAULT '',
  summary text DEFAULT '',
  main_arguments text DEFAULT '',
  comment_analysis text DEFAULT '',
  opportunity text DEFAULT '',
  response_idea text DEFAULT '',
  content_idea text DEFAULT '',
  relevance_score integer DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_insights TO anon, authenticated;
GRANT ALL ON public.social_insights TO service_role;
ALTER TABLE public.social_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.social_insights FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_social_insights_updated_at BEFORE UPDATE ON public.social_insights FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.learning_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  learned text DEFAULT '',
  built text DEFAULT '',
  difficult text DEFAULT '',
  surprised text DEFAULT '',
  improve_next text DEFAULT '',
  mood text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_journal TO anon, authenticated;
GRANT ALL ON public.learning_journal TO service_role;
ALTER TABLE public.learning_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.learning_journal FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_learning_journal_updated_at BEFORE UPDATE ON public.learning_journal FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT '',
  proficiency integer DEFAULT 1 CHECK (proficiency BETWEEN 1 AND 10),
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.skills FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.score_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  delta integer NOT NULL DEFAULT 0,
  reason text DEFAULT '',
  source_id uuid,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.score_events TO anon, authenticated;
GRANT ALL ON public.score_events TO service_role;
ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.score_events FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_score_events_updated_at BEFORE UPDATE ON public.score_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
CREATE TABLE public.telegram_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL DEFAULT 'outgoing',
  chat_id text,
  message text DEFAULT '',
  status text DEFAULT 'sent',
  related_briefing_id uuid REFERENCES public.daily_briefings(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_messages TO anon, authenticated;
GRANT ALL ON public.telegram_messages TO service_role;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open all" ON public.telegram_messages FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER set_telegram_messages_updated_at BEFORE UPDATE ON public.telegram_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
