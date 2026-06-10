import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Send, Webhook, KeyRound, Save, Bot, Clock, Zap, BookOpen, ListChecks } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function SettingsPage() {
  const profile = useSuspenseQuery(listQuery<any>("profile")).data[0];
  const upsert = useUpsert("profile");
  const [f, setF] = useState<any>(null);
  const v = f ?? profile ?? {};

  function update(patch: any) {
    setF({ ...v, ...patch });
  }

  function save() {
    upsert.mutate(v, {
      onSuccess: () => toast.success("Settings saved"),
    });
  }

  async function exportAll() {
    const tables = ["profile", "projects", "agents", "agent_runs", "daily_briefings", "experiments", "experiment_reviews", "ai_news", "social_insights", "learning_journal", "skills", "score_events", "telegram_messages", "automation_logs"];
    const out: Record<string, any> = {};
    for (const t of tables) {
      const { data } = await supabase.from(t as any).select("*");
      out[t] = data ?? [];
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-growth-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  const tgStatus = v.telegram_bot_status || "disconnected";
  const tgVariant = tgStatus === "connected" ? "default" : tgStatus === "pending" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Profile, integrations, automation, data"
        actions={<Button onClick={save}><Save className="h-4 w-4 mr-1" />Save changes</Button>}
      />

      {/* Profile */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Display name"><Input value={v.display_name || ""} onChange={(e) => update({ display_name: e.target.value })} /></F>
          <F label="Focus areas (csv)"><Input value={arrayToCsv(v.focus_areas)} onChange={(e) => update({ focus_areas: csvToArray(e.target.value) })} /></F>
        </div>
        <F label="Bio"><Textarea rows={3} value={v.bio || ""} onChange={(e) => update({ bio: e.target.value })} /></F>
      </div>

      {/* Integrations */}
      <div className="surface-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Integrations
            </h3>
            <p className="text-sm text-muted-foreground">Connect n8n and Telegram to power your daily automations.</p>
          </div>
          <Link to="/automation" className="text-xs text-primary hover:underline">View automation logs →</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* n8n */}
          <div className="surface-card p-5 space-y-3 bg-card/40">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-8 w-8 rounded-md bg-primary/15 text-primary"><Webhook className="h-4 w-4" /></div>
              <div>
                <div className="font-display font-semibold">n8n</div>
                <div className="text-xs text-muted-foreground">Inbound webhook URL for your workflows.</div>
              </div>
            </div>
            <F label="Webhook URL">
              <Input
                placeholder="https://your-n8n.example.com/webhook/ai-growth"
                value={v.n8n_webhook_url || ""}
                onChange={(e) => update({ n8n_webhook_url: e.target.value })}
              />
            </F>
            <p className="text-xs text-muted-foreground">n8n will POST briefings, news and experiments to this app via Supabase.</p>
          </div>

          {/* Telegram */}
          <div className="surface-card p-5 space-y-3 bg-card/40">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-8 w-8 rounded-md bg-primary/15 text-primary"><Send className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="font-display font-semibold flex items-center gap-2">
                  Telegram
                  <Badge variant={tgVariant as any} className="text-[10px] uppercase">{tgStatus}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Receive daily briefings in your Telegram chat.</div>
              </div>
            </div>
            <F label="Bot status">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={v.telegram_bot_status || "disconnected"}
                onChange={(e) => update({ telegram_bot_status: e.target.value })}
              >
                <option value="disconnected">Disconnected</option>
                <option value="pending">Pending setup</option>
                <option value="connected">Connected</option>
              </select>
            </F>
            <F label="Chat ID">
              <Input
                placeholder="e.g. 123456789"
                value={v.telegram_chat_id || ""}
                onChange={(e) => update({ telegram_chat_id: e.target.value })}
              />
            </F>
          </div>
        </div>

        {/* Schedule + toggles */}
        <div className="surface-card p-5 space-y-4 bg-card/40">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div className="font-display font-semibold">Daily automation</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <F label="Daily briefing time">
              <Input
                type="time"
                value={(v.daily_briefing_time || "08:00").toString().slice(0, 5)}
                onChange={(e) => update({ daily_briefing_time: e.target.value })}
              />
            </F>
            <ToggleRow
              icon={<Send className="h-4 w-4" />}
              title="Daily Telegram briefing"
              description="Send the 5-minute briefing to Telegram."
              checked={!!v.daily_telegram_enabled}
              onChange={(c: boolean) => update({ daily_telegram_enabled: c })}
            />
            <ToggleRow
              icon={<Bot className="h-4 w-4" />}
              title="Daily experiment generation"
              description="Auto-create today's AI experiment."
              checked={!!v.daily_experiment_enabled}
              onChange={(c: boolean) => update({ daily_experiment_enabled: c })}
            />
          </div>
        </div>
      </div>

      {/* Automation docs */}
      <div className="surface-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">How n8n will power this OS</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          The app is wired and ready. Once you connect n8n + Telegram above, scheduled workflows will:
        </p>
        <ol className="space-y-2 text-sm">
          {[
            "Collect AI news from RSS, X/Twitter, Reddit and HackerNews.",
            "Analyze trends and cluster the most important signals.",
            "Generate a 5-minute daily briefing (summary, hot topics, why it matters).",
            "Generate one practical daily AI experiment matched to your focus areas.",
            "Send the briefing + experiment to your Telegram chat.",
            "Store every result, score and message in Supabase for review here.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid place-items-center h-6 w-6 rounded-md bg-primary/15 text-primary text-xs font-semibold shrink-0">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <div className="text-xs text-muted-foreground pt-2">
          Each run will be recorded under <Link to="/automation" className="text-primary hover:underline">Automation Logs</Link>.
        </div>
      </div>

      {/* Other */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard icon={<KeyRound className="h-4 w-4" />} title="API integrations" description="OpenAI / Anthropic / Perplexity keys (stored as Supabase secrets later)">
          <Input placeholder="OPENAI_API_KEY" disabled />
          <Input placeholder="ANTHROPIC_API_KEY" disabled />
        </PlaceholderCard>
        <PlaceholderCard icon={<Download className="h-4 w-4" />} title="Export data" description="Download all your data as JSON.">
          <Button variant="outline" onClick={exportAll}><Download className="h-4 w-4 mr-1" />Export everything</Button>
        </PlaceholderCard>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ icon, title, description, checked, onChange }: any) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border/50 p-3">
      <div className="flex gap-2 min-w-0">
        <div className="grid place-items-center h-7 w-7 rounded-md bg-primary/15 text-primary shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PlaceholderCard({ icon, title, description, children }: any) {
  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid place-items-center h-8 w-8 rounded-md bg-primary/15 text-primary">{icon}</div>
        <div>
          <div className="font-display font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
