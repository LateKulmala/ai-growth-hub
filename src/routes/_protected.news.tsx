import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, Chip, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_protected/news")({
  component: NewsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function NewsPage() {
  const items = useSuspenseQuery(listQuery<any>("ai_news", { column: "discovered_at" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ relevance_score: 5, trend_score: 5 });
  const upsert = useUpsert("ai_news");
  const del = useDelete("ai_news");

  return (
    <div className="space-y-6">
      <PageHeader title="Uutiset ja trendit" description="AI-uutiset, työkalut ja trendit · kuratoituna"
        actions={<Button onClick={() => { setDraft({ relevance_score: 5, trend_score: 5 }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Uusi merkintä</Button>} />

      {items.length === 0 ? <EmptyState title="Tutka on hiljainen" /> : (
        <div className="grid gap-3">
          {items.map((n) => (
            <div key={n.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{n.source} · {new Date(n.discovered_at).toLocaleDateString("fi-FI")}</div>
                  <h3 className="font-display text-lg font-semibold truncate">{n.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.summary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-muted-foreground">Rel <span className="text-primary font-semibold">{n.relevance_score}</span></div>
                  <div className="text-xs text-muted-foreground">Trd <span className="text-accent font-semibold">{n.trend_score}</span></div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1.5">{(n.tags || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>
                {n.url && <a className="text-xs text-primary inline-flex items-center gap-1" href={n.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" />Avaa</a>}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => del.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Uusi uutismerkintä</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <R label="Otsikko"><Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></R>
            <div className="grid grid-cols-2 gap-3">
              <R label="Lähde"><Input value={draft.source || ""} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></R>
              <R label="Kategoria"><Input value={draft.category || ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></R>
            </div>
            <R label="Osoite"><Input value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></R>
            <R label="Yhteenveto"><Textarea rows={3} value={draft.summary || ""} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></R>
            <div className="grid grid-cols-2 gap-3">
              <R label="Relevanssi 1-10"><Input type="number" min={1} max={10} value={draft.relevance_score} onChange={(e) => setDraft({ ...draft, relevance_score: Number(e.target.value) })} /></R>
              <R label="Trendi 1-10"><Input type="number" min={1} max={10} value={draft.trend_score} onChange={(e) => setDraft({ ...draft, trend_score: Number(e.target.value) })} /></R>
            </div>
            <R label="Tunnisteet (pilkulla)"><Input value={arrayToCsv(draft.tags)} onChange={(e) => setDraft({ ...draft, tags: csvToArray(e.target.value) })} /></R>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Peruuta</Button>
            <Button onClick={() => upsert.mutate(draft, { onSuccess: () => setOpen(false) })} disabled={!draft.title || upsert.isPending}>Luo</Button>
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
