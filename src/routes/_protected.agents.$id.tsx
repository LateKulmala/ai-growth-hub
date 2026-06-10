import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { rowQuery, listQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_protected/agents/$id")({
  component: AgentDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function AgentDetail() {
  const { id } = Route.useParams();
  const a = useSuspenseQuery(rowQuery<any>("agents", id)).data;
  const runs = useSuspenseQuery(listQuery<any>("agent_runs", { column: "started_at" })).data.filter((r: any) => r.agent_id === id);
  const upsert = useUpsert("agents");
  const del = useDelete("agents");
  const nav = useNavigate();
  const [f, setF] = useState<any>(a);
  useEffect(() => setF(a), [a?.id]);
  if (!a) return <div className="p-4">Not found</div>;
  const v = f ?? a;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/agents"><ArrowLeft className="h-4 w-4 mr-1" />Agents</Link></Button>
      <PageHeader title={v.name} description={v.role}
        actions={<>
          <Button variant="destructive" size="sm" onClick={() => del.mutate(a.id, { onSuccess: () => nav({ to: "/agents" }) })}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save</Button>
        </>} />

      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center gap-3"><StatusBadge status={v.status} />
          {v.n8n_workflow_url && <a className="text-xs text-primary inline-flex items-center gap-1" href={v.n8n_workflow_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" />n8n workflow</a>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Name"><Input value={v.name || ""} onChange={(e) => setF({ ...v, name: e.target.value })} /></F>
          <F label="Role"><Input value={v.role || ""} onChange={(e) => setF({ ...v, role: e.target.value })} /></F>
          <F label="Trigger">
            <Select value={v.trigger_type || "manual"} onValueChange={(x) => setF({ ...v, trigger_type: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Status">
            <Select value={v.status || "idle"} onValueChange={(x) => setF({ ...v, status: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="Success rate (0–1)"><Input type="number" step="0.01" min={0} max={1} value={v.success_rate ?? 0} onChange={(e) => setF({ ...v, success_rate: Number(e.target.value) })} /></F>
          <F label="n8n URL"><Input value={v.n8n_workflow_url || ""} onChange={(e) => setF({ ...v, n8n_workflow_url: e.target.value })} /></F>
        </div>
        <F label="Description"><Textarea rows={3} value={v.description || ""} onChange={(e) => setF({ ...v, description: e.target.value })} /></F>
        <F label="Input"><Textarea rows={2} value={v.input_description || ""} onChange={(e) => setF({ ...v, input: e.target.value })} /></F>
        <F label="Output"><Textarea rows={2} value={v.output_description || ""} onChange={(e) => setF({ ...v, output: e.target.value })} /></F>
        <F label="Tools (csv)"><Input value={arrayToCsv(v.tools_used)} onChange={(e) => setF({ ...v, tools_used: csvToArray(e.target.value) })} /></F>
        <div className="flex flex-wrap gap-1.5">{(v.tools_used || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>
        <F label="Notes"><Textarea rows={3} value={v.notes || ""} onChange={(e) => setF({ ...v, notes: e.target.value })} /></F>
        <F label="Improvement ideas"><Textarea rows={3} value={v.improvement_ideas || ""} onChange={(e) => setF({ ...v, improvement_ideas: e.target.value })} /></F>
        <div className="text-xs text-muted-foreground">Last run {v.last_run_at ? new Date(v.last_run_at).toLocaleString() : "never"}</div>
      </div>

      <div className="surface-card p-6">
        <h3 className="font-display text-lg font-semibold mb-3">Recent runs</h3>
        {runs.length === 0 ? <p className="text-sm text-muted-foreground">No runs logged.</p> : (
          <div className="space-y-2">
            {runs.slice(0, 10).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm">
                <div>{new Date(r.started_at).toLocaleString()}</div>
                <div className="flex items-center gap-3">
                  {r.duration_seconds != null && <span className="text-xs text-muted-foreground">{r.duration_seconds}ms</span>}
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
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
