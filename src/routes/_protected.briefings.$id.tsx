import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { rowQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_protected/briefings/$id")({
  component: BriefingDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function BriefingDetail() {
  const { id } = Route.useParams();
  const b = useSuspenseQuery(rowQuery<any>("daily_briefings", id)).data;
  const upsert = useUpsert("daily_briefings");
  const del = useDelete("daily_briefings");
  const nav = useNavigate();
  const [f, setF] = useState<any>(b);
  useEffect(() => setF(b), [b?.id]);
  if (!b) return <div className="p-4">Not found</div>;
  const v = f ?? b;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/briefings"><ArrowLeft className="h-4 w-4 mr-1" />Briefings</Link></Button>
      <PageHeader title={v.title} description={v.briefing_date}
        actions={<>
          <Button variant="destructive" size="sm" onClick={() => del.mutate(b.id, { onSuccess: () => nav({ to: "/briefings" }) })}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save</Button>
        </>} />

      <div className="surface-card p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Title"><Input value={v.title || ""} onChange={(e) => setF({ ...v, title: e.target.value })} /></F>
          <F label="Date"><Input type="date" value={v.briefing_date || ""} onChange={(e) => setF({ ...v, briefing_date: e.target.value })} /></F>
        </div>
        <F label="Executive summary"><Textarea rows={4} value={v.executive_summary || ""} onChange={(e) => setF({ ...v, executive_summary: e.target.value })} /></F>
        <F label="Hot topics (csv)"><Input value={arrayToCsv(v.hot_topics)} onChange={(e) => setF({ ...v, hot_topics: csvToArray(e.target.value) })} /></F>
        <div className="flex flex-wrap gap-1.5">{(v.hot_topics || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>
        <F label="Why it matters"><Textarea rows={3} value={v.why_it_matters || ""} onChange={(e) => setF({ ...v, why_it_matters: e.target.value })} /></F>
        <F label="What to learn"><Textarea rows={3} value={v.what_to_learn || ""} onChange={(e) => setF({ ...v, what_to_learn: e.target.value })} /></F>
        <div className="flex items-center gap-3">
          <Switch checked={!!v.telegram_sent} onCheckedChange={(c) => setF({ ...v, telegram_sent: c })} />
          <Label>Telegram sent</Label>
        </div>
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
