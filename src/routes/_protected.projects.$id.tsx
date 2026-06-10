import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Github, Save, Trash2, Plus, Link2, FileText } from "lucide-react";
import { rowQuery, listQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_protected/projects/$id")({
  component: ProjectDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

const LINK_KINDS = [
  { value: "github", label: "GitHub" },
  { value: "lovable", label: "Lovable" },
  { value: "replit", label: "Replit" },
  { value: "supabase", label: "Supabase" },
  { value: "n8n", label: "n8n" },
  { value: "demo", label: "Demo" },
  { value: "docs", label: "Dokumentaatio" },
  { value: "other", label: "Muu" },
];

const FILE_KINDS = [
  { value: "doc", label: "Dokumentti" },
  { value: "spec", label: "Määrittely" },
  { value: "image", label: "Kuva" },
  { value: "other", label: "Muu" },
];

function kindLabel(list: { value: string; label: string }[], value: string) {
  return list.find((k) => k.value === value)?.label || value;
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const p = useSuspenseQuery(rowQuery<any>("projects", id)).data;
  const agents = useSuspenseQuery(listQuery<any>("agents")).data.filter((a: any) => a.project_id === id);
  const experiments = useSuspenseQuery(listQuery<any>("experiments", { column: "experiment_date" })).data.filter((x: any) => x.project_id === id);
  const links = useSuspenseQuery(listQuery<any>("project_links")).data.filter((l: any) => l.project_id === id);
  const files = useSuspenseQuery(listQuery<any>("project_files")).data.filter((fl: any) => fl.project_id === id);
  const upsert = useUpsert("projects");
  const del = useDelete("projects");
  const nav = useNavigate();
  const [f, setF] = useState<any>(p);
  useEffect(() => setF(p), [p?.id]);
  if (!p) return <div className="p-4">Ei löytynyt</div>;
  const v = f ?? p;
  const set = (patch: any) => setF({ ...v, ...patch });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/projects"><ArrowLeft className="h-4 w-4 mr-1" />Takaisin projekteihin</Link></Button>

      <PageHeader
        title={v.name || "Nimetön projekti"}
        description={v.description}
        actions={<>
          <Button variant="destructive" size="sm" onClick={() => del.mutate(p.id, { onSuccess: () => nav({ to: "/projects" }) })}><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Tallenna</Button>
        </>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={v.status} />
        {v.github_url && <a className="inline-flex items-center gap-1 text-xs text-primary" href={v.github_url} target="_blank" rel="noreferrer"><Github className="h-3 w-3" />GitHub</a>}
        {v.demo_url && <a className="inline-flex items-center gap-1 text-xs text-primary" href={v.demo_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" />Demo</a>}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Yleiskuva</TabsTrigger>
          <TabsTrigger value="tech">Teknologiat ja työkalut</TabsTrigger>
          <TabsTrigger value="links">Linkit ja tiedostot</TabsTrigger>
          <TabsTrigger value="related">Agentit ja kokeet</TabsTrigger>
          <TabsTrigger value="learning">Oppiminen ja ideat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="surface-card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Nimi"><Input value={v.name || ""} onChange={(e) => set({ name: e.target.value })} /></F>
              <F label="Tila">
                <Select value={v.status} onValueChange={(x) => set({ status: x })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiivinen</SelectItem>
                    <SelectItem value="paused">Tauolla</SelectItem>
                    <SelectItem value="completed">Valmis</SelectItem>
                    <SelectItem value="archived">Arkistoitu</SelectItem>
                  </SelectContent>
                </Select>
              </F>
              <F label="GitHub-osoite"><Input value={v.github_url || ""} onChange={(e) => set({ github_url: e.target.value })} /></F>
              <F label="Demo-osoite"><Input value={v.demo_url || ""} onChange={(e) => set({ demo_url: e.target.value })} /></F>
            </div>
            <F label="Kuvaus"><Textarea rows={3} value={v.description || ""} onChange={(e) => set({ description: e.target.value })} /></F>
            <F label="Tarkoitus"><Textarea rows={3} value={v.purpose || ""} onChange={(e) => set({ purpose: e.target.value })} /></F>
            <F label="Mikä ongelma ratkaistaan"><Textarea rows={3} value={v.problem_solved || ""} onChange={(e) => set({ problem_solved: e.target.value })} /></F>
            <F label="Luotu arvo"><Textarea rows={3} value={v.value_created || ""} onChange={(e) => set({ value_created: e.target.value })} /></F>
            <div className="text-xs text-muted-foreground">Luotu {new Date(p.created_at).toLocaleString("fi-FI")} · Päivitetty {new Date(p.updated_at).toLocaleString("fi-FI")}</div>
          </div>
        </TabsContent>

        <TabsContent value="tech" className="mt-4">
          <div className="surface-card p-6 space-y-4">
            <F label="Työkalut (pilkulla)"><Input value={arrayToCsv(v.tools_used)} onChange={(e) => set({ tools_used: csvToArray(e.target.value) })} /></F>
            <div className="flex flex-wrap gap-1.5">{(v.tools_used || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>
            <F label="Teknologiat (pilkulla)"><Input value={arrayToCsv(v.technologies)} onChange={(e) => set({ technologies: csvToArray(e.target.value) })} /></F>
            <div className="flex flex-wrap gap-1.5">{(v.technologies || []).map((t: string) => <Chip key={t}>{t}</Chip>)}</div>
          </div>
        </TabsContent>

        <TabsContent value="links" className="mt-4 space-y-4">
          <LinksPanel projectId={id} links={links} />
          <FilesPanel projectId={id} files={files} />
        </TabsContent>

        <TabsContent value="related" className="mt-4 space-y-4">
          <div className="surface-card p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Liittyvät agentit</h3>
            {agents.length === 0 ? <p className="text-sm text-muted-foreground">Ei liitettyjä agentteja.</p> : (
              <div className="space-y-2">
                {agents.map((a: any) => (
                  <Link key={a.id} to="/agents/$id" params={{ id: a.id }} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm hover:bg-surface/70">
                    <div>
                      <div className="font-medium">{a.name}</div>
                      {a.role && <div className="text-xs text-muted-foreground">{a.role}</div>}
                    </div>
                    <StatusBadge status={a.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="surface-card p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Liittyvät kokeet</h3>
            {experiments.length === 0 ? <p className="text-sm text-muted-foreground">Ei liitettyjä kokeita.</p> : (
              <div className="space-y-2">
                {experiments.map((x: any) => (
                  <Link key={x.id} to="/experiments/$id" params={{ id: x.id }} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm hover:bg-surface/70">
                    <div>
                      <div className="font-medium">{x.title || "Nimetön koe"}</div>
                      {x.experiment_date && <div className="text-xs text-muted-foreground">{x.experiment_date}</div>}
                    </div>
                    <StatusBadge status={x.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="mt-4">
          <div className="surface-card p-6 space-y-4">
            <F label="Opitut asiat"><Textarea rows={4} value={v.learnings || ""} onChange={(e) => set({ learnings: e.target.value })} /></F>
            <F label="Muistiinpanot"><Textarea rows={4} value={v.notes || ""} onChange={(e) => set({ notes: e.target.value })} /></F>
            <F label="Tulevat ideat"><Textarea rows={4} value={v.future_ideas || ""} onChange={(e) => set({ future_ideas: e.target.value })} /></F>
            <F label="Seuraavat parannukset"><Textarea rows={4} value={v.next_improvements || ""} onChange={(e) => set({ next_improvements: e.target.value })} /></F>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LinksPanel({ projectId, links }: { projectId: string; links: any[] }) {
  const upsert = useUpsert("project_links");
  const del = useDelete("project_links");
  const [kind, setKind] = useState("github");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const add = () => {
    if (!url.trim()) return;
    upsert.mutate({ project_id: projectId, kind, label, url }, {
      onSuccess: () => { setLabel(""); setUrl(""); },
    });
  };

  return (
    <div className="surface-card p-6 space-y-4">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" />Linkit</h3>
      {links.length === 0 ? <p className="text-sm text-muted-foreground">Ei linkkejä.</p> : (
        <div className="space-y-2">
          {links.map((l: any) => (
            <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Chip>{kindLabel(LINK_KINDS, l.kind)}</Chip>
                {l.label && <span className="font-medium truncate">{l.label}</span>}
                <a className="inline-flex items-center gap-1 text-xs text-primary truncate" href={l.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 shrink-0" />{l.url}</a>
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(l.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr_auto] sm:items-end border-t border-border pt-4">
        <F label="Tyyppi">
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LINK_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </F>
        <F label="Nimi"><Input value={label} onChange={(e) => setLabel(e.target.value)} /></F>
        <F label="Osoite"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></F>
        <Button onClick={add} disabled={upsert.isPending}><Plus className="h-4 w-4 mr-1" />Lisää linkki</Button>
      </div>
    </div>
  );
}

function FilesPanel({ projectId, files }: { projectId: string; files: any[] }) {
  const upsert = useUpsert("project_files");
  const del = useDelete("project_files");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("doc");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const add = () => {
    if (!title.trim()) return;
    upsert.mutate({ project_id: projectId, title, kind, url, notes }, {
      onSuccess: () => { setTitle(""); setUrl(""); setNotes(""); },
    });
  };

  return (
    <div className="surface-card p-6 space-y-4">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Tiedostot</h3>
      {files.length === 0 ? <p className="text-sm text-muted-foreground">Ei tiedostoja.</p> : (
        <div className="space-y-2">
          {files.map((fl: any) => (
            <div key={fl.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Chip>{kindLabel(FILE_KINDS, fl.kind)}</Chip>
                <span className="font-medium truncate">{fl.title}</span>
                {fl.url && <a className="inline-flex items-center gap-1 text-xs text-primary truncate" href={fl.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 shrink-0" />Avaa</a>}
                {fl.notes && <span className="text-xs text-muted-foreground truncate">{fl.notes}</span>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => del.mutate(fl.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 border-t border-border pt-4">
        <F label="Otsikko"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></F>
        <F label="Tyyppi">
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FILE_KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </F>
        <F label="Osoite"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></F>
        <F label="Muistiinpano"><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></F>
        <div className="sm:col-span-2">
          <Button onClick={add} disabled={upsert.isPending}><Plus className="h-4 w-4 mr-1" />Lisää tiedosto</Button>
        </div>
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
