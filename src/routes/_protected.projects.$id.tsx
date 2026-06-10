import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Github, Save, Trash2 } from "lucide-react";
import { rowQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_protected/projects/$id")({
  component: ProjectDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const p = useSuspenseQuery(rowQuery<any>("projects", id)).data;
  const upsert = useUpsert("projects");
  const del = useDelete("projects");
  const nav = useNavigate();
  const [f, setF] = useState<any>(p);
  useEffect(() => setF(p), [p?.id]);
  if (!p) return <div className="p-4">Not found</div>;
  const v = f ?? p;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/projects"><ArrowLeft className="h-4 w-4 mr-1" /> Projects</Link></Button>
      <PageHeader
        title={v.name}
        description={v.description}
        actions={
          <>
            <Button variant="destructive" size="sm" onClick={() => del.mutate(p.id, { onSuccess: () => nav({ to: "/projects" }) })}><Trash2 className="h-4 w-4" /></Button>
            <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save</Button>
          </>
        }
      />

      <div className="surface-card p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={v.status} />
          {v.github_url && <a className="inline-flex items-center gap-1 text-xs text-primary" href={v.github_url} target="_blank" rel="noreferrer"><Github className="h-3 w-3" />GitHub</a>}
          {v.demo_url && <a className="inline-flex items-center gap-1 text-xs text-primary" href={v.demo_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" />Demo</a>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Name"><Input value={v.name || ""} onChange={(e) => setF({ ...v, name: e.target.value })} /></F>
          <F label="Status">
            <Select value={v.status} onValueChange={(x) => setF({ ...v, status: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </F>
          <F label="GitHub URL"><Input value={v.github_url || ""} onChange={(e) => setF({ ...v, github_url: e.target.value })} /></F>
          <F label="Demo URL"><Input value={v.demo_url || ""} onChange={(e) => setF({ ...v, demo_url: e.target.value })} /></F>
        </div>
        <F label="Description"><Textarea rows={3} value={v.description || ""} onChange={(e) => setF({ ...v, description: e.target.value })} /></F>
        <F label="Problem it solves"><Textarea rows={3} value={v.problem_solved || ""} onChange={(e) => setF({ ...v, problem_solved: e.target.value })} /></F>
        <F label="Tools (csv)"><Input value={arrayToCsv(v.tools_used)} onChange={(e) => setF({ ...v, tools_used: csvToArray(e.target.value) })} /></F>
        <div className="flex flex-wrap gap-1.5">{(v.tools_used || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>
        <F label="Learnings"><Textarea rows={3} value={v.learnings || ""} onChange={(e) => setF({ ...v, learnings: e.target.value })} /></F>
        <F label="Next improvements"><Textarea rows={3} value={v.next_improvements || ""} onChange={(e) => setF({ ...v, next_improvements: e.target.value })} /></F>
        <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleString()} · Updated {new Date(p.updated_at).toLocaleString()}</div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
