import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ExternalLink, Trash2, CheckCircle2 } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, Chip, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_protected/news")({
  component: NewsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function NewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Uutiset ja briefingit" description="AI-uutiset, trendit ja päivittäiset briefingit · kuratoituna" />
      <Tabs defaultValue="news">
        <TabsList>
          <TabsTrigger value="news">Uutiset</TabsTrigger>
          <TabsTrigger value="briefings">Briefingit</TabsTrigger>
        </TabsList>
        <TabsContent value="news" className="mt-4">
          <NewsTab />
        </TabsContent>
        <TabsContent value="briefings" className="mt-4">
          <BriefingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewsTab() {
  const items = useSuspenseQuery(listQuery<any>("ai_news", { column: "discovered_at" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ relevance_score: 5, trend_score: 5 });
  const upsert = useUpsert("ai_news");
  const del = useDelete("ai_news");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setDraft({ relevance_score: 5, trend_score: 5 }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Uusi merkintä
        </Button>
      </div>

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

function BriefingsTab() {
  const briefings = useSuspenseQuery(listQuery<any>("daily_briefings", { column: "briefing_date" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ briefing_date: new Date().toISOString().slice(0, 10) });
  const upsert = useUpsert("daily_briefings");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setDraft({ briefing_date: new Date().toISOString().slice(0, 10) }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Uusi briefing
        </Button>
      </div>

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
