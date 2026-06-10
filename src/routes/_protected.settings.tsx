import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Send, Webhook, KeyRound, Save } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  async function exportAll() {
    const tables = ["profile", "projects", "agents", "agent_runs", "daily_briefings", "experiments", "experiment_reviews", "ai_news", "social_insights", "learning_journal", "skills", "score_events", "telegram_messages"];
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

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Profile, integrations, data"
        actions={<Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save profile</Button>} />

      <div className="surface-card p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Display name"><Input value={v.display_name || ""} onChange={(e) => setF({ ...v, display_name: e.target.value })} /></F>
          <F label="Focus areas (csv)"><Input value={arrayToCsv(v.focus_areas)} onChange={(e) => setF({ ...v, focus_areas: csvToArray(e.target.value) })} /></F>
        </div>
        <F label="Bio"><Textarea rows={3} value={v.bio || ""} onChange={(e) => setF({ ...v, bio: e.target.value })} /></F>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard icon={<Send className="h-4 w-4" />} title="Telegram" description="Send daily briefings to your Telegram chat.">
          <Input placeholder="Bot token (stored in Supabase secret later)" disabled />
          <Input placeholder="Chat ID" disabled />
        </PlaceholderCard>
        <PlaceholderCard icon={<Webhook className="h-4 w-4" />} title="n8n webhooks" description="POST endpoints n8n can hit to push data.">
          <Input placeholder="https://your-n8n.example.com/webhook/..." disabled />
        </PlaceholderCard>
        <PlaceholderCard icon={<KeyRound className="h-4 w-4" />} title="API integrations" description="OpenAI / Anthropic / Perplexity keys (later)">
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
