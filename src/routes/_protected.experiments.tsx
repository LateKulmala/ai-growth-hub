import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, LayoutGrid, CalendarDays, Filter, X } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip, EmptyState, ScoreRing } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_protected/experiments")({
  component: ExperimentsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function ExperimentsPage() {
  const items = useSuspenseQuery(listQuery<any>("experiments", { column: "experiment_date" })).data;
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(blankDraft());
  const upsert = useUpsert("experiments");

  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<[number, number]>([1, 10]);
  const [score, setScore] = useState<[number, number]>([0, 100]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i: any) => i.category && set.add(i.category));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((e: any) => {
      if (status !== "all" && e.status !== status) return false;
      if (category !== "all" && e.category !== category) return false;
      if (projectFilter !== "all" && e.project_id !== projectFilter) return false;
      const d = e.difficulty ?? 0;
      if (d < difficulty[0] || d > difficulty[1]) return false;
      const s = e.score_total ?? 0;
      if (s < score[0] || s > score[1]) return false;
      return true;
    });
  }, [items, status, category, projectFilter, difficulty, score]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((e: any) => e.status === "completed").length;
    const inProgress = items.filter((e: any) => e.status === "in_progress").length;
    const avg = (() => {
      const arr = items.filter((e: any) => e.score_total != null);
      return arr.length ? Math.round(arr.reduce((a: number, e: any) => a + e.score_total, 0) / arr.length) : 0;
    })();
    return { total, completed, inProgress, avg };
  }, [items]);

  const reset = () => { setStatus("all"); setCategory("all"); setProjectFilter("all"); setDifficulty([1, 10]); setScore([0, 100]); };
  const filtersActive = status !== "all" || category !== "all" || projectFilter !== "all" || difficulty[0] !== 1 || difficulty[1] !== 10 || score[0] !== 0 || score[1] !== 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI-kokeet"
        description="Käytännön AI-treenit · todista oppimisesi tekemällä"
        actions={<Button onClick={() => { setDraft(blankDraft()); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Uusi koe</Button>}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Yhteensä" value={stats.total} />
        <Stat label="Valmiita" value={stats.completed} tone="primary" />
        <Stat label="Kesken" value={stats.inProgress} tone="accent" />
        <Stat label="Keskipisteet" value={stats.avg} tone="success" />
      </div>

      <div className="surface-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Suodattimet
          </div>
          <FilterField label="Tila">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kaikki</SelectItem>
                <SelectItem value="planned">Suunniteltu</SelectItem>
                <SelectItem value="in_progress">Kesken</SelectItem>
                <SelectItem value="completed">Valmis</SelectItem>
                <SelectItem value="skipped">Ohitettu</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Kategoria">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kaikki kategoriat</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label="Projekti">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kaikki projektit</SelectItem>
                {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
          <FilterField label={`Vaikeustaso ${difficulty[0]}–${difficulty[1]}`}>
            <Slider min={1} max={10} step={1} value={difficulty} onValueChange={(v) => setDifficulty([v[0], v[1]] as [number, number])} className="w-44" />
          </FilterField>
          <FilterField label={`Pisteet ${score[0]}–${score[1]}`}>
            <Slider min={0} max={100} step={5} value={score} onValueChange={(v) => setScore([v[0], v[1]] as [number, number])} className="w-44" />
          </FilterField>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={reset}><X className="h-3.5 w-3.5 mr-1" />Tyhjennä</Button>
          )}
          <div className="ml-auto text-xs text-muted-foreground">{filtered.length} / {items.length}</div>
        </div>
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid"><LayoutGrid className="h-3.5 w-3.5 mr-1" />Ruudukko</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="h-3.5 w-3.5 mr-1" />Kalenteri</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          {filtered.length === 0 ? <EmptyState title="Yksikään koe ei vastaa hakua" description="Kokeile poistaa suodattimia." /> : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e: any) => {
                const projectName = e.project_id ? (projects.find((p: any) => p.id === e.project_id)?.name ?? null) : null;
                return (
                  <Link to="/experiments/$id" params={{ id: e.id }} key={e.id} className="surface-card group p-5 hover:border-primary/40 transition relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-primary">{e.experiment_date} · {e.category || "—"}</div>
                        <h3 className="font-display text-lg font-semibold mt-1 leading-tight">{e.title}</h3>
                        {projectName && <div className="mt-0.5 text-xs text-muted-foreground">{projectName}</div>}
                      </div>
                      <div className="shrink-0">
                        {e.score_total != null ? <ScoreRing value={e.score_total} size={52} /> : <StatusBadge status={e.status} />}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{e.task_description || e.background_context}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Vaikeus {e.difficulty}/10 · {e.estimated_time_minutes ?? "—"} min</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(e.tools_needed || []).slice(0, 4).map((t: string) => <Chip key={t}>{t}</Chip>)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <MonthCalendar items={filtered} />
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Uusi AI-koe</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <R label="Päivämäärä"><Input type="date" value={draft.experiment_date || ""} onChange={(e) => setDraft({ ...draft, experiment_date: e.target.value })} /></R>
              <R label="Kategoria"><Input value={draft.category || ""} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="kehotteet · agentit · konenäkö …" /></R>
            </div>
            <R label="Otsikko"><Input value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></R>
            <div className="grid grid-cols-3 gap-3">
              <R label="Vaikeustaso 1-10"><Input type="number" min={1} max={10} value={draft.difficulty || 5} onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })} /></R>
              <R label="Arvioitu aika (min)"><Input type="number" min={0} value={draft.estimated_time_minutes ?? ""} onChange={(e) => setDraft({ ...draft, estimated_time_minutes: e.target.value === "" ? null : Number(e.target.value) })} /></R>
              <R label="Tila">
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Suunniteltu</SelectItem>
                    <SelectItem value="in_progress">Kesken</SelectItem>
                    <SelectItem value="completed">Valmis</SelectItem>
                    <SelectItem value="skipped">Ohitettu</SelectItem>
                  </SelectContent>
                </Select>
              </R>
            </div>
            <R label="Projekti">
              <Select value={draft.project_id ?? "none"} onValueChange={(v) => setDraft({ ...draft, project_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ei projektia</SelectItem>
                  {projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </R>
            <R label="Tarvittavat työkalut (pilkulla)"><Input value={arrayToCsv(draft.tools_needed)} onChange={(e) => setDraft({ ...draft, tools_needed: csvToArray(e.target.value) })} /></R>
            <R label="Taustakonteksti"><Textarea rows={2} value={draft.background_context || ""} onChange={(e) => setDraft({ ...draft, background_context: e.target.value })} /></R>
            <R label="Tehtävän kuvaus"><Textarea rows={2} value={draft.task_description || ""} onChange={(e) => setDraft({ ...draft, task_description: e.target.value })} /></R>
            <R label="Vaiheittaiset ohjeet"><Textarea rows={4} value={draft.step_by_step_instructions || ""} onChange={(e) => setDraft({ ...draft, step_by_step_instructions: e.target.value })} /></R>
            <R label="Onnistumiskriteerit"><Textarea rows={2} value={draft.success_criteria || ""} onChange={(e) => setDraft({ ...draft, success_criteria: e.target.value })} /></R>
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

function blankDraft() {
  return { status: "planned", difficulty: 5, experiment_date: new Date().toISOString().slice(0, 10), tools_needed: [] };
}

function R({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "primary" | "accent" | "success" }) {
  const color = { default: "text-foreground", primary: "text-primary", accent: "text-accent", success: "text-[color:var(--success)]" }[tone];
  return (
    <div className="surface-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function MonthCalendar({ items }: { items: any[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = useMemo(() => {
    const m: Record<string, any[]> = {};
    items.forEach((e) => { if (e.experiment_date) (m[e.experiment_date] ||= []).push(e); });
    return m;
  }, [items]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = new Date().toISOString().slice(0, 10);
  const monthLabel = cursor.toLocaleString("fi-FI", { month: "long", year: "numeric" });

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">{monthLabel}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>‹</Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>Tänään</Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>›</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"].map((d) => <div key={d} className="px-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (d == null) return <div key={i} className="aspect-square rounded-lg border border-border/30 bg-surface/20" />;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const dayItems = byDate[key] || [];
          const isToday = key === todayKey;
          return (
            <div key={i} className={`aspect-square min-h-20 rounded-lg border p-1.5 flex flex-col overflow-hidden ${isToday ? "border-primary/60 bg-primary/5" : "border-border bg-surface/40"}`}>
              <div className={`text-[10px] font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>{d}</div>
              <div className="mt-0.5 space-y-0.5 overflow-hidden">
                {dayItems.slice(0, 2).map((e) => (
                  <Link key={e.id} to="/experiments/$id" params={{ id: e.id }} className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] text-primary hover:bg-primary/25">
                    {e.title}
                  </Link>
                ))}
                {dayItems.length > 2 && <div className="text-[9px] text-muted-foreground">+{dayItems.length - 2} lisää</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
