import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, Chip, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_protected/journal")({
  component: JournalPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function JournalPage() {
  const items = useSuspenseQuery(listQuery<any>("learning_journal", { column: "entry_date" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ entry_date: new Date().toISOString().slice(0, 10), mood: "focused" });
  const upsert = useUpsert("learning_journal");
  const del = useDelete("learning_journal");

  return (
    <div className="space-y-6">
      <PageHeader title="Learning Journal" description="Daily reflection · private"
        actions={<Button onClick={() => { setDraft({ entry_date: new Date().toISOString().slice(0, 10), mood: "focused" }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />New entry</Button>} />

      {items.length === 0 ? <EmptyState title="No journal entries" /> : (
        <div className="space-y-3">
          {items.map((j) => (
            <div key={j.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-primary">{j.entry_date} · {j.mood}</div>
                  <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                    {j.what_i_learned && <P label="Learned">{j.what_i_learned}</P>}
                    {j.what_i_built && <P label="Built">{j.what_i_built}</P>}
                    {j.what_was_difficult && <P label="Difficult">{j.what_was_difficult}</P>}
                    {j.what_surprised_me && <P label="Surprised">{j.what_surprised_me}</P>}
                    {j.next_improvement && <P label="Improve next">{j.next_improvement}</P>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(j.tags || []).map((t: string) => <Chip key={t}>{t}</Chip>)}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => del.mutate(j.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New journal entry</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <R label="Date"><Input type="date" value={draft.entry_date || ""} onChange={(e) => setDraft({ ...draft, entry_date: e.target.value })} /></R>
              <R label="Mood / energy"><Input value={draft.mood || ""} onChange={(e) => setDraft({ ...draft, mood: e.target.value })} /></R>
            </div>
            <R label="What I learned"><Textarea rows={2} value={draft.what_i_learned || ""} onChange={(e) => setDraft({ ...draft, what_i_learned: e.target.value })} /></R>
            <R label="What I built"><Textarea rows={2} value={draft.what_i_built || ""} onChange={(e) => setDraft({ ...draft, what_i_built: e.target.value })} /></R>
            <R label="What was difficult"><Textarea rows={2} value={draft.what_was_difficult || ""} onChange={(e) => setDraft({ ...draft, what_was_difficult: e.target.value })} /></R>
            <R label="What surprised me"><Textarea rows={2} value={draft.what_surprised_me || ""} onChange={(e) => setDraft({ ...draft, what_surprised_me: e.target.value })} /></R>
            <R label="What to improve next"><Textarea rows={2} value={draft.next_improvement || ""} onChange={(e) => setDraft({ ...draft, next_improvement: e.target.value })} /></R>
            <R label="Tags (csv)"><Input value={arrayToCsv(draft.tags)} onChange={(e) => setDraft({ ...draft, tags: csvToArray(e.target.value) })} /></R>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => upsert.mutate(draft, { onSuccess: () => setOpen(false) })} disabled={upsert.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function P({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
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
