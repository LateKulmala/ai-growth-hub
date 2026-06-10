import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, useDelete } from "@/lib/mutations";
import { PageHeader, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_protected/social")({
  component: SocialPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function SocialPage() {
  const items = useSuspenseQuery(listQuery<any>("social_insights", { column: "discovered_at" })).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ platform: "LinkedIn", relevance_score: 5 });
  const upsert = useUpsert("social_insights");
  const del = useDelete("social_insights");

  return (
    <div className="space-y-6">
      <PageHeader title="Somehavainnot" description="AI-keskusteludata LinkedInistä ja muualta"
        actions={<Button onClick={() => { setDraft({ platform: "LinkedIn", relevance_score: 5 }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Uusi havainto</Button>} />

      {items.length === 0 ? <EmptyState title="Ei havaintoja vielä" /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} className="surface-card p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.platform} · {s.author}</span>
                <span>Rel <span className="text-primary font-semibold">{s.relevance_score}</span></span>
              </div>
              <h3 className="font-display text-lg font-semibold mt-1">{s.topic || "Nimetön"}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{s.summary}</p>
              {s.opportunity && <p className="mt-2 text-sm"><span className="text-primary">Mahdollisuus: </span>{s.opportunity}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs">
                {s.post_url && <a className="text-primary inline-flex items-center gap-1" href={s.post_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" />Julkaisu</a>}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => del.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Uusi somehavainto</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <R label="Alusta"><Input value={draft.platform || ""} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} /></R>
              <R label="Kirjoittaja"><Input value={draft.author || ""} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></R>
            </div>
            <R label="Julkaisun osoite"><Input value={draft.post_url || ""} onChange={(e) => setDraft({ ...draft, post_url: e.target.value })} /></R>
            <R label="Aihe"><Input value={draft.topic || ""} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} /></R>
            <R label="Yhteenveto"><Textarea rows={3} value={draft.summary || ""} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></R>
            <R label="Pääargumentit"><Textarea rows={2} value={draft.main_arguments || ""} onChange={(e) => setDraft({ ...draft, main_arguments: e.target.value })} /></R>
            <R label="Kommenttianalyysi"><Textarea rows={2} value={draft.comment_analysis || ""} onChange={(e) => setDraft({ ...draft, comment_analysis: e.target.value })} /></R>
            <R label="Mahdollisuus"><Textarea rows={2} value={draft.opportunity || ""} onChange={(e) => setDraft({ ...draft, opportunity: e.target.value })} /></R>
            <R label="Ehdotettu vastaus"><Textarea rows={2} value={draft.suggested_response || ""} onChange={(e) => setDraft({ ...draft, suggested_response: e.target.value })} /></R>
            <R label="Ehdotettu sisältöidea"><Textarea rows={2} value={draft.suggested_content_idea || ""} onChange={(e) => setDraft({ ...draft, suggested_content_idea: e.target.value })} /></R>
            <R label="Relevanssi 1-10"><Input type="number" min={1} max={10} value={draft.relevance_score} onChange={(e) => setDraft({ ...draft, relevance_score: Number(e.target.value) })} /></R>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Peruuta</Button>
            <Button onClick={() => upsert.mutate(draft, { onSuccess: () => setOpen(false) })} disabled={upsert.isPending}>Luo</Button>
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
