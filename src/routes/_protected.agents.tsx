import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ExternalLink } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip, EmptyState } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_protected/agents")({
  component: AgentsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function AgentsPage() {
  const agents = useSuspenseQuery(listQuery<any>("agents")).data;
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ status: "idle", trigger_type: "manual" });
  const upsert = useUpsert("agents");

  return (
    <div className="space-y-6">
      <PageHeader title="Agenttikirjasto" description="Kaikki n8n-automaatiosi ja AI-agenttisi"
        actions={<Button onClick={() => { setDraft({ status: "idle", trigger_type: "manual" }); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Uusi agentti</Button>} />

      {agents.length === 0 ? (
        <EmptyState title="Ei agentteja vielä" description="Yhdistä ensimmäinen n8n-työnkulkusi." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <Link to="/agents/$id" params={{ id: a.id }} key={a.id} className="surface-card p-5 hover:border-primary/40 transition">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.role}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Liipaisin · {a.trigger_type}</span>
                <span>· Onnistuminen {Math.round((a.success_rate || 0) * 100)}%</span>
              </div>
              {a.project_id && (() => { const proj = projects.find((p: any) => p.id === a.project_id); return proj ? <div className="mt-1 text-xs text-muted-foreground">Projekti: {proj.name}</div> : null; })()}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(a.tools_used || []).slice(0, 4).map((t: string) => <Chip key={t}>{t}</Chip>)}
              </div>
              {a.n8n_workflow_url && <a className="mt-3 inline-flex items-center gap-1 text-xs text-primary" href={a.n8n_workflow_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><ExternalLink className="h-3 w-3" />Työnkulku</a>}
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Uusi agentti</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <R label="Nimi"><Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></R>
            <R label="Rooli"><Input value={draft.role || ""} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></R>
            <R label="Kuvaus"><Textarea rows={2} value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></R>
            <div className="grid grid-cols-2 gap-3">
              <R label="Liipaisintyyppi">
                <Select value={draft.trigger_type} onValueChange={(v) => setDraft({ ...draft, trigger_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manuaalinen</SelectItem>
                    <SelectItem value="schedule">Ajastettu</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="event">Tapahtuma</SelectItem>
                  </SelectContent>
                </Select>
              </R>
              <R label="Tila">
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idle">Vapaa</SelectItem>
                    <SelectItem value="running">Käynnissä</SelectItem>
                    <SelectItem value="paused">Tauolla</SelectItem>
                    <SelectItem value="error">Virhe</SelectItem>
                  </SelectContent>
                </Select>
              </R>
            </div>
            <R label="Projekti">
              <Select value={draft.project_id ?? "none"} onValueChange={(x) => setDraft({ ...draft, project_id: x === "none" ? null : x })}>
                <SelectTrigger><SelectValue placeholder="Ei projektia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ei projektia</SelectItem>
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </R>
            <R label="Syöte"><Textarea rows={2} value={draft.input_description || ""} onChange={(e) => setDraft({ ...draft, input_description: e.target.value })} /></R>
            <R label="Tuotos"><Textarea rows={2} value={draft.output_description || ""} onChange={(e) => setDraft({ ...draft, output_description: e.target.value })} /></R>
            <R label="Työkalut (pilkulla)"><Input value={arrayToCsv(draft.tools_used)} onChange={(e) => setDraft({ ...draft, tools_used: csvToArray(e.target.value) })} /></R>
            <R label="n8n-työnkulun osoite"><Input value={draft.n8n_workflow_url || ""} onChange={(e) => setDraft({ ...draft, n8n_workflow_url: e.target.value })} /></R>
            <R label="Muistiinpanot"><Textarea rows={2} value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></R>
            <R label="Parannusideat"><Textarea rows={2} value={draft.improvement_ideas || ""} onChange={(e) => setDraft({ ...draft, improvement_ideas: e.target.value })} /></R>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Peruuta</Button>
            <Button onClick={() => upsert.mutate(draft, { onSuccess: () => setOpen(false) })} disabled={!draft.name || upsert.isPending}>Luo</Button>
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
