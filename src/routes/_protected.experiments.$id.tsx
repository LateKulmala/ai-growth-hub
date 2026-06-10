import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { rowQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip, ScoreRing } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_protected/experiments/$id")({
  component: ExperimentDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function ExperimentDetail() {
  const { id } = Route.useParams();
  const e = useSuspenseQuery(rowQuery<any>("experiments", id)).data;
  const upsert = useUpsert("experiments");
  const del = useDelete("experiments");
  const nav = useNavigate();
  const [f, setF] = useState<any>(e);
  useEffect(() => setF(e), [e?.id]);
  if (!e) return <div className="p-4">Not found</div>;
  const v = f ?? e;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/experiments"><ArrowLeft className="h-4 w-4 mr-1" />Experiments</Link></Button>
      <PageHeader title={v.title} description={`${v.experiment_date} · ${v.category || "—"}`}
        actions={<>
          <Button variant="destructive" size="sm" onClick={() => del.mutate(e.id, { onSuccess: () => nav({ to: "/experiments" }) })}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save</Button>
        </>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <F label="Date"><Input type="date" value={v.experiment_date || ""} onChange={(x) => setF({ ...v, experiment_date: x.target.value })} /></F>
            <F label="Category"><Input value={v.category || ""} onChange={(x) => setF({ ...v, category: x.target.value })} /></F>
            <F label="Difficulty"><Input type="number" min={1} max={10} value={v.difficulty || 5} onChange={(x) => setF({ ...v, difficulty: Number(x.target.value) })} /></F>
          </div>
          <F label="Title"><Input value={v.title || ""} onChange={(x) => setF({ ...v, title: x.target.value })} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Estimated time"><Input value={v.estimated_time || ""} onChange={(x) => setF({ ...v, estimated_time: x.target.value })} /></F>
            <F label="Status">
              <Select value={v.status} onValueChange={(x) => setF({ ...v, status: x })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </F>
          </div>
          <F label="Tools (csv)"><Input value={arrayToCsv(v.tools_needed)} onChange={(x) => setF({ ...v, tools_needed: csvToArray(x.target.value) })} /></F>
          <div className="flex flex-wrap gap-1.5">{(v.tools_needed || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>

          <F label="Background"><Textarea rows={3} value={v.background || ""} onChange={(x) => setF({ ...v, background: x.target.value })} /></F>
          <F label="Task"><Textarea rows={3} value={v.task || ""} onChange={(x) => setF({ ...v, task: x.target.value })} /></F>
          <F label="Step-by-step instructions"><Textarea rows={5} value={v.instructions || ""} onChange={(x) => setF({ ...v, instructions: x.target.value })} /></F>
          <F label="Success criteria"><Textarea rows={2} value={v.success_criteria || ""} onChange={(x) => setF({ ...v, success_criteria: x.target.value })} /></F>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-6 flex items-center gap-4">
            <ScoreRing value={v.score ?? 0} size={84} />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Score</div>
              <StatusBadge status={v.status} />
            </div>
          </div>
          <div className="surface-card p-6 space-y-3">
            <F label="Score (0-100)"><Input type="number" min={0} max={100} value={v.score ?? ""} onChange={(x) => setF({ ...v, score: x.target.value === "" ? null : Number(x.target.value) })} /></F>
            <F label="Result URL"><Input value={v.result_url || ""} onChange={(x) => setF({ ...v, result_url: x.target.value })} /></F>
            {v.result_url && <a className="inline-flex items-center gap-1 text-xs text-primary" href={v.result_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" />Open result</a>}
            <F label="Result summary"><Textarea rows={3} value={v.result_summary || ""} onChange={(x) => setF({ ...v, result_summary: x.target.value })} /></F>
            <F label="Self reflection"><Textarea rows={3} value={v.self_reflection || ""} onChange={(x) => setF({ ...v, self_reflection: x.target.value })} /></F>
            <F label="AI feedback"><Textarea rows={3} value={v.ai_feedback || ""} onChange={(x) => setF({ ...v, ai_feedback: x.target.value })} /></F>
            <F label="What I learned"><Textarea rows={2} value={v.learnings || ""} onChange={(x) => setF({ ...v, learnings: x.target.value })} /></F>
            <F label="Next experiment idea"><Textarea rows={2} value={v.next_idea || ""} onChange={(x) => setF({ ...v, next_idea: x.target.value })} /></F>
          </div>
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
