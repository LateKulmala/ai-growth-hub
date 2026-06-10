
-- projects
ALTER TABLE public.projects RENAME COLUMN problem TO problem_solved;
ALTER TABLE public.projects RENAME COLUMN tools TO tools_used;

-- agents
ALTER TABLE public.agents RENAME COLUMN input TO input_description;
ALTER TABLE public.agents RENAME COLUMN output TO output_description;
ALTER TABLE public.agents RENAME COLUMN tools TO tools_used;
ALTER TABLE public.agents RENAME COLUMN n8n_url TO n8n_workflow_url;
ALTER TABLE public.agents RENAME COLUMN last_run TO last_run_at;

-- agent_runs
ALTER TABLE public.agent_runs RENAME COLUMN input TO input_data;
ALTER TABLE public.agent_runs RENAME COLUMN output TO output_data;
ALTER TABLE public.agent_runs RENAME COLUMN error TO error_message;
ALTER TABLE public.agent_runs RENAME COLUMN ran_at TO started_at;
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS finished_at timestamptz;
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS score integer;
ALTER TABLE public.agent_runs ADD COLUMN IF NOT EXISTS duration_seconds integer;
UPDATE public.agent_runs SET duration_seconds = COALESCE(duration_seconds, (duration_ms/1000)::int);
ALTER TABLE public.agent_runs DROP COLUMN IF EXISTS duration_ms;

-- daily_briefings
ALTER TABLE public.daily_briefings RENAME COLUMN what_to_learn TO learning_recommendation;

-- experiments
ALTER TABLE public.experiments RENAME COLUMN estimated_time TO estimated_time_minutes;
ALTER TABLE public.experiments RENAME COLUMN background TO background_context;
ALTER TABLE public.experiments RENAME COLUMN task TO task_description;
ALTER TABLE public.experiments RENAME COLUMN instructions TO step_by_step_instructions;
ALTER TABLE public.experiments RENAME COLUMN score TO score_total;
ALTER TABLE public.experiments RENAME COLUMN learnings TO what_i_learned;
ALTER TABLE public.experiments RENAME COLUMN next_idea TO next_experiment_idea;
ALTER TABLE public.experiments ALTER COLUMN estimated_time_minutes DROP DEFAULT;
ALTER TABLE public.experiments ALTER COLUMN estimated_time_minutes TYPE integer USING NULLIF(regexp_replace(estimated_time_minutes::text, '\D', '', 'g'), '')::int;

-- social_insights
ALTER TABLE public.social_insights RENAME COLUMN response_idea TO suggested_response;
ALTER TABLE public.social_insights RENAME COLUMN content_idea TO suggested_content_idea;

-- learning_journal
ALTER TABLE public.learning_journal RENAME COLUMN learned TO what_i_learned;
ALTER TABLE public.learning_journal RENAME COLUMN built TO what_i_built;
ALTER TABLE public.learning_journal RENAME COLUMN difficult TO what_was_difficult;
ALTER TABLE public.learning_journal RENAME COLUMN surprised TO what_surprised_me;
ALTER TABLE public.learning_journal RENAME COLUMN improve_next TO next_improvement;
ALTER TABLE public.learning_journal ADD COLUMN IF NOT EXISTS energy_level integer;

-- score_events
ALTER TABLE public.score_events RENAME COLUMN event_type TO type;
ALTER TABLE public.score_events RENAME COLUMN delta TO points;
ALTER TABLE public.score_events RENAME COLUMN occurred_at TO event_date;
ALTER TABLE public.score_events ADD COLUMN IF NOT EXISTS related_experiment_id uuid REFERENCES public.experiments(id) ON DELETE SET NULL;
ALTER TABLE public.score_events ADD COLUMN IF NOT EXISTS related_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.score_events DROP COLUMN IF EXISTS source_id;

-- telegram_messages
ALTER TABLE public.telegram_messages RENAME COLUMN direction TO message_type;
ALTER TABLE public.telegram_messages RENAME COLUMN message TO content;
ALTER TABLE public.telegram_messages RENAME COLUMN status TO telegram_status;
ALTER TABLE public.telegram_messages ADD COLUMN IF NOT EXISTS message_date date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.telegram_messages ADD COLUMN IF NOT EXISTS related_experiment_id uuid REFERENCES public.experiments(id) ON DELETE SET NULL;
ALTER TABLE public.telegram_messages DROP COLUMN IF EXISTS chat_id;

DO $$ BEGIN
  ALTER TABLE public.ai_news ADD CONSTRAINT ai_news_related_briefing_fk FOREIGN KEY (related_briefing_id) REFERENCES public.daily_briefings(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.daily_briefings ADD CONSTRAINT daily_briefings_related_experiment_fk FOREIGN KEY (related_experiment_id) REFERENCES public.experiments(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.telegram_messages ADD CONSTRAINT telegram_messages_related_briefing_fk FOREIGN KEY (related_briefing_id) REFERENCES public.daily_briefings(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.agent_runs ADD CONSTRAINT agent_runs_agent_fk FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.experiment_reviews ADD CONSTRAINT experiment_reviews_experiment_fk FOREIGN KEY (experiment_id) REFERENCES public.experiments(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
