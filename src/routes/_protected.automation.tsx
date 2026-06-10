import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, CheckCircle2, XCircle, Clock, Plus, Trash2, Webhook } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, useDelete } from "@/lib/mutations";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_protected/automation")({
  component: AutomationPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Odottaa",
  running: "Käynnissä",
  success: "Onnistui",
  failed: "Epäonnistui",
};

function AutomationPage() {
  const logs = useSuspenseQuery(listQuery<any>("automation_logs", { column: "started_at", ascending: false })).data;
  const upsert = useUpsert("automation_logs");
  const del = useDelete("automation_logs");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>({ workflow_name: "", source: "n8n", status: "success", trigger_type: "manual" });

  const filtered = useMemo(() => filter === "all" ? logs : logs.filter((l: any) => l.status === filter), [logs, filter]);

  const stats = useMemo(() => ({
    total: logs.length,
    success: logs.filter((l: any) => l.status === "success").length,
    failed: logs.filter((l: any) => l.status === "failed").length,
    pending: logs.filter((l: any) => l.status === "pending" || l.status === "running").length,
  }), [logs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automaatioiden lokit"
        description="Jokainen n8n-suoritus, Telegram-lähetys ja ajastettu työ kirjautuu tänne."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />Uusi loki</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Kirjaa työnkulun suoritus</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Field label="Työnkulun nimi"><Input value={draft.workflow_name || ""} onChange={(e) => setDraft({ ...draft, workflow_name: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Lähde"><Input value={draft.source || ""} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></Field>
                  <Field label="Liipaisintyyppi"><Input value={draft.trigger_type || ""} onChange={(e) => setDraft({ ...draft, trigger_type: e.target.value })} /></Field>
                </div>
                <Field label="Tila">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  >
                    <option value="pending">Odottaa</option>
                    <option value="running">Käynnissä</option>
                    <option value="success">Onnistui</option>
                    <option value="failed">Epäonnistui</option>
                  </select>
                </Field>
                <Field label="Virheviesti (jos joku)"><Textarea rows={2} value={draft.error_message || ""} onChange={(e) => setDraft({ ...draft, error_message: e.target.value })} /></Field>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!draft.workflow_name) return toast.error("Työnkulun nimi vaaditaan");
                    upsert.mutate(draft, {
                      onSuccess: () => { toast.success("Kirjattu"); setOpen(false); setDraft({ workflow_name: "", source: "n8n", status: "success", trigger_type: "manual" }); },
                    });
                  }}
                >Tallenna</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat icon={<Activity className="h-4 w-4" />} label="Suorituksia yhteensä" value={stats.total} />
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Onnistuneita" value={stats.success} />
        <Stat icon={<XCircle className="h-4 w-4 text-destructive" />} label="Epäonnistuneita" value={stats.failed} />
        <Stat icon={<Clock className="h-4 w-4 text-amber-400" />} label="Odottaa / käynnissä" value={stats.pending} />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { v: "all", l: "Kaikki" },
          { v: "success", l: "Onnistuneet" },
          { v: "failed", l: "Epäonnistuneet" },
          { v: "pending", l: "Odottavat" },
          { v: "running", l: "Käynnissä" },
        ].map((s) => (
          <Button key={s.v} size="sm" variant={filter === s.v ? "default" : "outline"} onClick={() => setFilter(s.v)}>
            {s.l}
          </Button>
        ))}
      </div>

      <div className="surface-card divide-y divide-border/50">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : filtered.map((l: any) => (
          <div key={l.id} className="p-4 flex items-start gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-md bg-primary/10 text-primary shrink-0">
              <Webhook className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-medium truncate">{l.workflow_name}</div>
                <Badge variant="outline" className="text-[10px]">{l.source}</Badge>
                {l.trigger_type && <Badge variant="secondary" className="text-[10px]">{l.trigger_type}</Badge>}
                <RunStatusBadge status={l.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(l.started_at).toLocaleString("fi-FI")}
                {l.duration_ms != null && <> · {(l.duration_ms / 1000).toFixed(2)} s</>}
              </div>
              {l.error_message && <div className="text-xs text-destructive mt-1 line-clamp-2">{l.error_message}</div>}
            </div>
            <Button size="icon" variant="ghost" onClick={() => del.mutate(l.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="surface-card p-5 text-sm text-muted-foreground">
        <div className="font-display text-base font-semibold text-foreground mb-2">Mitä tänne kirjautuu</div>
        <p>Kun n8n on yhdistetty <Link to="/settings" className="text-primary hover:underline">Asetuksissa → Integraatiot</Link>, jokainen työnkulun suoritus (uutisten kerääminen, briefingin luonti, kokeen luonti, Telegram-lähetys) kirjautuu tänne tiloineen, dataineen ja kestoineen. Siihen asti voit kirjata suorituksia käsin.</p>
        <p className="mt-2 text-xs">Muistutus: kaikki AI:n luoma sisältö tuotetaan oletuksena suomeksi.</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: any) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">{icon} {label}</div>
      <div className="text-2xl font-display font-bold mt-1">{value}</div>
    </div>
  );
}

function RunStatusBadge({ status }: { status: string }) {
  const map: any = {
    success: "default",
    failed: "destructive",
    pending: "secondary",
    running: "secondary",
  };
  return <Badge variant={map[status] || "outline"} className="text-[10px] uppercase">{STATUS_LABEL[status] || status}</Badge>;
}

function EmptyState() {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Ei automaation suorituksia vielä. Yhdistä n8n Asetuksissa, niin työnkulkujen suoritukset alkavat virrata tänne.
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
