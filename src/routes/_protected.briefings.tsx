import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, EmptyState, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_protected/briefings")({
  component: BriefingsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function BriefingsPage() {
  const briefings = useSuspenseQuery(listQuery<any>("daily_briefings", { column: "briefing_date" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ briefing_date: new Date().toISOString().slice(0, 10) });
  const upsert = useUpsert("daily_briefings");

  return (
    <div className="space-y-6">
      <PageHeader title="Päiväbriefingit" description="5 minuutin päivittäinen AI-tieto"
        actions={<Button onClick={() => { setDraft({ briefing_date: new Date().toISOString().slice(0, 10) }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Uusi briefing</Button>} />

      {briefings.length === 0 ? (
        <EmptyState title="Ei briefingejä vielä" description="Päivittäinen tieto saapuu tänne." />
      ) : (
        <div className="space-y-3">
          {briefings.map((b) => (
            <Link to="/briefings/$id" params={{ id: b.id }} key={b.id} className="surface-card p-5 block hover:border-primary/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-primary">{b.briefing_date}</div>
                  <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{b.executive_summary}</p>
                </div>
                {b.telegram_sent && <CheckCircle2 className="h-4 w-4 text-[color:var(--success)] shrink-0" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(b.hot_topics || []).slice(0, 5).map((t: string) => <Chip key={t}>{t}</Chip>)}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Uusi briefing</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <R label="Päivämäärä"><Input type="date" value={draft.briefing_date || ""} onChange={(e) => setDraft({ ...draft, briefing_date: e.target.value })} /></R>
            <R label="Otsikko"><Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></R>
            <R label="Tiivistelmä"><Textarea rows={3} value={draft.executive_summary || ""} onChange={(e) => setDraft({ ...draft, executive_summary: e.target.value })} /></R>
            <R label="Kuumat aiheet (pilkulla)"><Input value={arrayToCsv(draft.hot_topics)} onChange={(e) => setDraft({ ...draft, hot_topics: csvToArray(e.target.value) })} /></R>
            <R label="Miksi tämä on tärkeää"><Textarea rows={2} value={draft.why_it_matters || ""} onChange={(e) => setDraft({ ...draft, why_it_matters: e.target.value })} /></R>
            <R label="Mitä opettelisit"><Textarea rows={2} value={draft.learning_recommendation || ""} onChange={(e) => setDraft({ ...draft, learning_recommendation: e.target.value })} /></R>
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
