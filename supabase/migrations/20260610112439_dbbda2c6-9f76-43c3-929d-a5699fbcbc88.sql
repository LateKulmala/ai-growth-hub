
-- Add integration settings columns to profile
ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS n8n_webhook_url text,
  ADD COLUMN IF NOT EXISTS telegram_bot_status text DEFAULT 'disconnected',
  ADD COLUMN IF NOT EXISTS telegram_chat_id text,
  ADD COLUMN IF NOT EXISTS daily_briefing_time time DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS daily_telegram_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS daily_experiment_enabled boolean NOT NULL DEFAULT false;

-- Automation logs table for future n8n runs
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text NOT NULL,
  source text NOT NULL DEFAULT 'n8n',
  status text NOT NULL DEFAULT 'pending',
  trigger_type text,
  payload jsonb,
  result jsonb,
  error_message text,
  duration_ms integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_logs TO authenticated;
GRANT ALL ON public.automation_logs TO service_role;

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "single user full access automation_logs"
  ON public.automation_logs FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE TRIGGER automation_logs_set_updated_at
  BEFORE UPDATE ON public.automation_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_automation_logs_started_at ON public.automation_logs (started_at DESC);
