import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ExternalLink, Github } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_protected/projects")({
  component: ProjectsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function ProjectsPage() {
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ status: "active" });
  const upsert = useUpsert("projects");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projektit"
        description="Kaikki mitä olet julkaissut tai rakentamassa"
        actions={
          <Button onClick={() => { setDraft({ status: "active" }); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Uusi projekti
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState title="Ei projekteja vielä" description="Luo ensimmäinen AI-rakennelmasi." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Uusi projekti</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              to="/projects/$id"
              params={{ id: p.id }}
              key={p.id}
              className="surface-card p-5 group hover:border-primary/40 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold group-hover:text-primary transition">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(p.tools_used || []).slice(0, 4).map((t: string) => <Chip key={t}>{t}</Chip>)}
              </div>
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                {p.github_url && <span className="inline-flex items-center gap-1"><Github className="h-3 w-3" />GitHub</span>}
                {p.demo_url && <span className="inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />Demo</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Uusi projekti</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Row label="Nimi"><Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Row>
            <Row label="Kuvaus"><Textarea rows={2} value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Row>
            <Row label="Mikä ongelma ratkaistaan"><Textarea rows={2} value={draft.problem_solved || ""} onChange={(e) => setDraft({ ...draft, problem_solved: e.target.value })} /></Row>
            <Row label="Työkalut (pilkulla)"><Input value={arrayToCsv(draft.tools_used)} onChange={(e) => setDraft({ ...draft, tools_used: csvToArray(e.target.value) })} /></Row>
            <div className="grid grid-cols-2 gap-3">
              <Row label="Tila">
                <Select value={draft.status || "active"} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiivinen</SelectItem>
                    <SelectItem value="paused">Tauolla</SelectItem>
                    <SelectItem value="completed">Valmis</SelectItem>
                    <SelectItem value="archived">Arkistoitu</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="GitHub-osoite"><Input value={draft.github_url || ""} onChange={(e) => setDraft({ ...draft, github_url: e.target.value })} /></Row>
              <Row label="Demo-osoite"><Input value={draft.demo_url || ""} onChange={(e) => setDraft({ ...draft, demo_url: e.target.value })} /></Row>
            </div>
            <Row label="Opitut asiat"><Textarea rows={2} value={draft.learnings || ""} onChange={(e) => setDraft({ ...draft, learnings: e.target.value })} /></Row>
            <Row label="Seuraavat parannukset"><Textarea rows={2} value={draft.next_improvements || ""} onChange={(e) => setDraft({ ...draft, next_improvements: e.target.value })} /></Row>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Peruuta</Button>
            <Button onClick={() => { upsert.mutate(draft, { onSuccess: () => setOpen(false) }); }} disabled={upsert.isPending || !draft.name}>Luo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
