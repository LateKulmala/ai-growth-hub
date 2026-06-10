import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip, EmptyState, ScoreRing } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_protected/experiments")({
  component: ExperimentsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function ExperimentsPage() {
  const items = useSuspenseQuery(listQuery<any>("experiments", { column: "experiment_date" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ status: "planned", difficulty: 5, experiment_date: new Date().toISOString().slice(0, 10) });
  const upsert = useUpsert("experiments");

  return (
    <div className="space-y-6">
      <PageHeader title="AI Experiments" description="Practical AI workouts · build proof through doing"
        actions={<Button onClick={() => { setDraft({ status: "planned", difficulty: 5, experiment_date: new Date().toISOString().slice(0, 10) }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />New experiment</Button>} />

      {items.length === 0 ? <EmptyState title="No experiments yet" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <Link to="/experiments/$id" params={{ id: e.id }} key={e.id} className="surface-card p-5 hover:border-primary/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-primary">{e.experiment_date} · {e.category}</div>
                  <h3 className="font-display text-lg font-semibold mt-1">{e.title}</h3>
                </div>
                <div className="shrink-0">
                  {e.score_total != null ? <ScoreRing value={e.score_total} size={48} /> : <StatusBadge status={e.status} />}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{e.task_description || e.background_context}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Difficulty {e.difficulty}/10</span>
                <StatusBadge status={e.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(e.tools_needed || []).slice(0, 4).map((t: string) => <Chip key={t}>{t}</Chip>)}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New experiment</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <R label="Date"><Input type="date" value={draft.experiment_date || ""} onChange={(e) => setDraft({ ...draft, experiment_date: e.target.value })} /></R>
              <R label="Category"><Input value={draft.category || ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></R>
            </div>
            <R label="Title"><Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></R>
            <div className="grid grid-cols-3 gap-3">
              <R label="Difficulty 1-10"><Input type="number" min={1} max={10} value={draft.difficulty || 5} onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })} /></R>
              <R label="Estimated time (minutes)"><Input type="number" min={0} value={draft.estimated_time_minutes ?? ""} onChange={(e) => setDraft({ ...draft, estimated_time_minutes: e.target.value === "" ? null : Number(e.target.value) })} /></R>
              <R label="Status">
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </R>
            </div>
            <R label="Tools needed (csv)"><Input value={arrayToCsv(draft.tools_needed)} onChange={(e) => setDraft({ ...draft, tools_needed: csvToArray(e.target.value) })} /></R>
            <R label="Background"><Textarea rows={2} value={draft.background_context || ""} onChange={(e) => setDraft({ ...draft, background_context: e.target.value })} /></R>
            <R label="Task"><Textarea rows={2} value={draft.task_description || ""} onChange={(e) => setDraft({ ...draft, task_description: e.target.value })} /></R>
            <R label="Step-by-step instructions"><Textarea rows={4} value={draft.step_by_step_instructions || ""} onChange={(e) => setDraft({ ...draft, step_by_step_instructions: e.target.value })} /></R>
            <R label="Success criteria"><Textarea rows={2} value={draft.success_criteria || ""} onChange={(e) => setDraft({ ...draft, success_criteria: e.target.value })} /></R>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => upsert.mutate(draft, { onSuccess: () => setOpen(false) })} disabled={!draft.title || upsert.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function R({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
