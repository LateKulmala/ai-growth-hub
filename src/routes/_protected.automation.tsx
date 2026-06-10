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
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

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
        title="Automation Logs"
        description="Every n8n run, Telegram dispatch and scheduled job lands here."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />New log</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log a workflow run</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Field label="Workflow name"><Input value={draft.workflow_name || ""} onChange={(e) => setDraft({ ...draft, workflow_name: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Source"><Input value={draft.source || ""} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></Field>
                  <Field label="Trigger type"><Input value={draft.trigger_type || ""} onChange={(e) => setDraft({ ...draft, trigger_type: e.target.value })} /></Field>
                </div>
                <Field label="Status">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="running">Running</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </Field>
                <Field label="Error message (if any)"><Textarea rows={2} value={draft.error_message || ""} onChange={(e) => setDraft({ ...draft, error_message: e.target.value })} /></Field>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!draft.workflow_name) return toast.error("Workflow name required");
                    upsert.mutate(draft, {
                      onSuccess: () => { toast.success("Logged"); setOpen(false); setDraft({ workflow_name: "", source: "n8n", status: "success", trigger_type: "manual" }); },
                    });
                  }}
                >Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat icon={<Activity className="h-4 w-4" />} label="Total runs" value={stats.total} />
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} label="Successful" value={stats.success} />
        <Stat icon={<XCircle className="h-4 w-4 text-destructive" />} label="Failed" value={stats.failed} />
        <Stat icon={<Clock className="h-4 w-4 text-amber-400" />} label="Pending / running" value={stats.pending} />
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "success", "failed", "pending", "running"].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s[0].toUpperCase() + s.slice(1)}
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
                <StatusBadge status={l.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(l.started_at).toLocaleString()}
                {l.duration_ms != null && <> · {(l.duration_ms / 1000).toFixed(2)}s</>}
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
        <div className="font-display text-base font-semibold text-foreground mb-2">What lands here</div>
        <p>Once n8n is wired via <Link to="/settings" className="text-primary hover:underline">Settings → Integrations</Link>, every workflow run (news collection, briefing generation, experiment generation, Telegram dispatch) will write a row here with status, payload and duration. Until then, you can log runs manually.</p>
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

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    success: "default",
    failed: "destructive",
    pending: "secondary",
    running: "secondary",
  };
  return <Badge variant={map[status] || "outline"} className="text-[10px] uppercase">{status}</Badge>;
}

function EmptyState() {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      No automation runs yet. Connect n8n in Settings to start streaming workflow runs here.
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
