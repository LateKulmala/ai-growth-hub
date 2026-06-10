import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Save, Trash2, Play, CheckCircle2, Target, Clock, FlaskConical, Sparkles, Wrench, BookOpen, Lightbulb } from "lucide-react";
import { rowQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, StatusBadge, Chip, ScoreRing } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_protected/experiments/$id")({
  component: ExperimentDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

const SCORE_FIELDS = [
  { key: "score_technical", label: "Tekninen toteutus", icon: Wrench, hint: "Koodin laatu, oikeellisuus ja syvyys" },
  { key: "score_creativity", label: "Luovuus", icon: Sparkles, hint: "Lähestymistavan ja ideoiden uutuus" },
  { key: "score_practical", label: "Käytännön arvo", icon: Target, hint: "Kuinka hyödyllinen tulos on oikeassa elämässä" },
  { key: "score_documentation", label: "Dokumentaatio", icon: BookOpen, hint: "Selostuksen selkeys ja toistettavuus" },
  { key: "score_learning", label: "Oppimisen syvyys", icon: Lightbulb, hint: "Mitä ymmärrät nyt, mitä et aiemmin" },
] as const;

function ExperimentDetail() {
  const { id } = Route.useParams();
  const e = useSuspenseQuery(rowQuery<any>("experiments", id)).data;
  const upsert = useUpsert("experiments");
  const del = useDelete("experiments");
  const nav = useNavigate();
  const [f, setF] = useState<any>(e);
  useEffect(() => setF(e), [e?.id]);
  if (!e) return <div className="p-4">Ei löytynyt</div>;
  const v = f ?? e;

  const computedTotal = useMemo(() => {
    return SCORE_FIELDS.reduce((sum, s) => sum + (Number(v[s.key]) || 0), 0);
  }, [v]);

  const set = (patch: any) => setF({ ...v, ...patch });
  const save = (extra: any = {}) => upsert.mutate({ ...v, ...extra });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/experiments"><ArrowLeft className="h-4 w-4 mr-1" />Kaikki kokeet</Link></Button>

      <PageHeader
        title={v.title || "Nimetön koe"}
        description={`${v.experiment_date || "—"} · ${v.category || "ei kategoriaa"} · Vaikeus ${v.difficulty ?? "—"}/10`}
        actions={<>
          {v.status !== "in_progress" && v.status !== "completed" && (
            <Button variant="secondary" onClick={() => save({ status: "in_progress" })}><Play className="h-4 w-4 mr-1" />Aloita</Button>
          )}
          {v.status !== "completed" && (
            <Button onClick={() => save({ status: "completed" })}><CheckCircle2 className="h-4 w-4 mr-1" />Merkitse valmiiksi</Button>
          )}
          <Button variant="outline" onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Tallenna</Button>
          <Button variant="destructive" size="icon" onClick={() => del.mutate(e.id, { onSuccess: () => nav({ to: "/experiments" }) })}><Trash2 className="h-4 w-4" /></Button>
        </>}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="surface-card relative overflow-hidden p-6 lg:col-span-1 flex items-center gap-4">
          <ScoreRing value={v.score_total ?? 0} size={96} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Kokonaispisteet</div>
            <div className="font-display text-3xl font-bold text-gradient">{v.score_total ?? 0}<span className="text-base text-muted-foreground">/100</span></div>
            <StatusBadge status={v.status} />
          </div>
        </div>
        <MiniStat icon={Clock} label="Arvioitu" value={v.estimated_time_minutes ? `${v.estimated_time_minutes} min` : "—"} />
        <MiniStat icon={Target} label="Vaikeustaso" value={`${v.difficulty ?? "—"}/10`} />
        <MiniStat icon={FlaskConical} label="Kategoria" value={v.category || "—"} />
      </div>

      <Tabs defaultValue="brief">
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="result">Tulos ja reflektio</TabsTrigger>
          <TabsTrigger value="score">Pisteytys</TabsTrigger>
          <TabsTrigger value="edit">Muokkaa</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Block title="Taustakonteksti">
                <Textarea rows={4} value={v.background_context || ""} onChange={(x) => set({ background_context: x.target.value })} placeholder="Miksi tämä koe on olemassa? Mikä on lähtötilanne?" />
              </Block>
              <Block title="Tehtävän kuvaus">
                <Textarea rows={4} value={v.task_description || ""} onChange={(x) => set({ task_description: x.target.value })} placeholder="Mitä tarkalleen teet?" />
              </Block>
              <Block title="Vaiheittaiset ohjeet">
                <Textarea rows={8} value={v.step_by_step_instructions || ""} onChange={(x) => set({ step_by_step_instructions: x.target.value })} placeholder="1. …&#10;2. …&#10;3. …" className="font-mono text-sm" />
              </Block>
              <Block title="Onnistumiskriteerit">
                <Textarea rows={3} value={v.success_criteria || ""} onChange={(x) => set({ success_criteria: x.target.value })} placeholder="Mistä tiedät, että tämä onnistui?" />
              </Block>
            </div>
            <div className="space-y-4">
              <Block title="Tarvittavat työkalut">
                <Input value={arrayToCsv(v.tools_needed)} onChange={(x) => set({ tools_needed: csvToArray(x.target.value) })} placeholder="claude, n8n, supabase" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(v.tools_needed || []).map((t: string) => <Chip key={t}>{t}</Chip>)}
                </div>
              </Block>
              <div className="surface-card p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Pikatoiminnot</div>
                <div className="flex flex-col gap-2">
                  {v.status !== "in_progress" && v.status !== "completed" && (
                    <Button onClick={() => save({ status: "in_progress" })}><Play className="h-4 w-4 mr-1" />Aloita nyt</Button>
                  )}
                  {v.status === "in_progress" && (
                    <Button onClick={() => save({ status: "completed" })}><CheckCircle2 className="h-4 w-4 mr-1" />Merkitse valmiiksi</Button>
                  )}
                  <Button variant="outline" onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Tallenna muutokset</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="result" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Block title="Tuloksen lähetys">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tuloksen osoite</Label>
                  <Input value={v.result_url || ""} onChange={(x) => set({ result_url: x.target.value })} placeholder="https://…" />
                  {v.result_url && (
                    <a className="mt-1 inline-flex items-center gap-1 text-xs text-primary" href={v.result_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" /> Avaa tulos
                    </a>
                  )}
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tuloksen yhteenveto</Label>
                  <Textarea rows={6} value={v.result_summary || ""} onChange={(x) => set({ result_summary: x.target.value })} placeholder="Mitä todella rakensit / tuotit?" />
                </div>
              </div>
            </Block>
            <Block title="Itsereflektio">
              <Textarea rows={10} value={v.self_reflection || ""} onChange={(x) => set({ self_reflection: x.target.value })} placeholder="Mikä meni hyvin? Mikä ei? Mitä muuttaisit?" />
            </Block>
            <Block title="AI-palaute">
              <Textarea rows={8} value={v.ai_feedback || ""} onChange={(x) => set({ ai_feedback: x.target.value })} placeholder="Liitä arvioijan tuotos, Clauden/GPT:n palaute tai automaattisesti luotu palaute. n8n täyttää tämän myöhemmin." />
            </Block>
            <Block title="Seuraavan kokeen idea">
              <Textarea rows={4} value={v.next_experiment_idea || ""} onChange={(x) => set({ next_experiment_idea: x.target.value })} placeholder="Mikä on luonteva jatko?" />
              <Label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">Mitä opin</Label>
              <Textarea rows={3} value={v.what_i_learned || ""} onChange={(x) => set({ what_i_learned: x.target.value })} placeholder="Yksi kappale. Tee tulevasta itsestäsi viisaampi." />
            </Block>
          </div>
        </TabsContent>

        <TabsContent value="score" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 surface-card p-6 space-y-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold">Pisteytyksen erittely</h3>
                <div className="text-xs text-muted-foreground">Kukin osa-alue 0–20 · yhteensä 0–100</div>
              </div>
              {SCORE_FIELDS.map((field) => {
                const value = Number(v[field.key]) || 0;
                const Icon = field.icon;
                return (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium">{field.label}</div>
                          <div className="text-[10px] text-muted-foreground">{field.hint}</div>
                        </div>
                      </div>
                      <div className="font-display text-lg font-bold tabular-nums">
                        {value}<span className="text-xs text-muted-foreground">/20</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Slider min={0} max={20} step={1} value={[value]} onValueChange={(arr) => set({ [field.key]: arr[0] })} className="flex-1" />
                      <Input type="number" min={0} max={20} value={v[field.key] ?? ""} onChange={(x) => set({ [field.key]: x.target.value === "" ? null : Math.max(0, Math.min(20, Number(x.target.value))) })} className="w-20" />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Laskettu summa</div>
                <div className="font-display text-2xl font-bold text-gradient">{computedTotal}/100</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => upsert.mutate(v)} disabled={upsert.isPending}>
                  <Save className="h-4 w-4 mr-1" />Tallenna pisteet
                </Button>
                <Button variant="ghost" onClick={() => set({ score_technical: null, score_creativity: null, score_practical: null, score_documentation: null, score_learning: null })}>
                  Nollaa
                </Button>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col items-center justify-center text-center">
              <ScoreRing value={v.score_total ?? computedTotal} size={160} />
              <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">Tallennettu summa</div>
              <div className="font-display text-3xl font-bold">{v.score_total ?? 0}<span className="text-base text-muted-foreground">/100</span></div>
              <div className="mt-3 text-xs text-muted-foreground max-w-[14rem]">
                Summa päivittyy automaattisesti, kun tallennat osa-alueiden pisteet.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <div className="surface-card p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Päivämäärä"><Input type="date" value={v.experiment_date || ""} onChange={(x) => set({ experiment_date: x.target.value })} /></Field>
              <Field label="Kategoria"><Input value={v.category || ""} onChange={(x) => set({ category: x.target.value })} /></Field>
              <Field label="Vaikeustaso 1-10"><Input type="number" min={1} max={10} value={v.difficulty || 5} onChange={(x) => set({ difficulty: Number(x.target.value) })} /></Field>
            </div>
            <Field label="Otsikko"><Input value={v.title || ""} onChange={(x) => set({ title: x.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Arvioitu aika (min)"><Input type="number" min={0} value={v.estimated_time_minutes ?? ""} onChange={(x) => set({ estimated_time_minutes: x.target.value === "" ? null : Number(x.target.value) })} /></Field>
              <Field label="Tila">
                <Select value={v.status} onValueChange={(x) => set({ status: x })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Suunniteltu</SelectItem>
                    <SelectItem value="in_progress">Kesken</SelectItem>
                    <SelectItem value="completed">Valmis</SelectItem>
                    <SelectItem value="skipped">Ohitettu</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Tallenna tiedot</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="surface-card p-4 flex items-center gap-3">
      <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-base font-semibold">{value}</div>
      </div>
    </div>
  );
}
