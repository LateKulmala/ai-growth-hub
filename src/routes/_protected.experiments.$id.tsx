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
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

const SCORE_FIELDS = [
  { key: "score_technical", label: "Technical execution", icon: Wrench, hint: "Code quality, correctness, depth" },
  { key: "score_creativity", label: "Creativity", icon: Sparkles, hint: "Novelty of approach and ideas" },
  { key: "score_practical", label: "Practical value", icon: Target, hint: "How useful is the result in real life" },
  { key: "score_documentation", label: "Documentation", icon: BookOpen, hint: "Clarity of writeup and reproducibility" },
  { key: "score_learning", label: "Learning depth", icon: Lightbulb, hint: "What you understand now that you didn't before" },
] as const;

function ExperimentDetail() {
  const { id } = Route.useParams();
  const e = useSuspenseQuery(rowQuery<any>("experiments", id)).data;
  const upsert = useUpsert("experiments");
  const del = useDelete("experiments");
  const nav = useNavigate();
  const [f, setF] = useState<any>(e);
  useEffect(() => setF(e), [e?.id]);
  if (!e) return <div className="p-4">Not found</div>;
  const v = f ?? e;

  const computedTotal = useMemo(() => {
    return SCORE_FIELDS.reduce((sum, s) => sum + (Number(v[s.key]) || 0), 0);
  }, [v]);

  const set = (patch: any) => setF({ ...v, ...patch });
  const save = (extra: any = {}) => upsert.mutate({ ...v, ...extra });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/experiments"><ArrowLeft className="h-4 w-4 mr-1" />All experiments</Link></Button>

      <PageHeader
        title={v.title || "Untitled experiment"}
        description={`${v.experiment_date || "—"} · ${v.category || "uncategorized"} · Difficulty ${v.difficulty ?? "—"}/10`}
        actions={<>
          {v.status !== "in_progress" && v.status !== "completed" && (
            <Button variant="secondary" onClick={() => save({ status: "in_progress" })}><Play className="h-4 w-4 mr-1" />Start</Button>
          )}
          {v.status !== "completed" && (
            <Button onClick={() => save({ status: "completed" })}><CheckCircle2 className="h-4 w-4 mr-1" />Complete</Button>
          )}
          <Button variant="outline" onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save</Button>
          <Button variant="destructive" size="icon" onClick={() => del.mutate(e.id, { onSuccess: () => nav({ to: "/experiments" }) })}><Trash2 className="h-4 w-4" /></Button>
        </>}
      />

      {/* Top stat strip */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="surface-card relative overflow-hidden p-6 lg:col-span-1 flex items-center gap-4">
          <ScoreRing value={v.score_total ?? 0} size={96} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total score</div>
            <div className="font-display text-3xl font-bold text-gradient">{v.score_total ?? 0}<span className="text-base text-muted-foreground">/100</span></div>
            <StatusBadge status={v.status} />
          </div>
        </div>
        <MiniStat icon={Clock} label="Estimated" value={v.estimated_time_minutes ? `${v.estimated_time_minutes} min` : "—"} />
        <MiniStat icon={Target} label="Difficulty" value={`${v.difficulty ?? "—"}/10`} />
        <MiniStat icon={FlaskConical} label="Category" value={v.category || "—"} />
      </div>

      <Tabs defaultValue="brief">
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="result">Result & reflection</TabsTrigger>
          <TabsTrigger value="score">Scoring</TabsTrigger>
          <TabsTrigger value="edit">Edit metadata</TabsTrigger>
        </TabsList>

        {/* BRIEF — read-style content */}
        <TabsContent value="brief" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Block title="Background context">
                <Textarea rows={4} value={v.background_context || ""} onChange={(x) => set({ background_context: x.target.value })} placeholder="Why does this experiment exist? What's the setup?" />
              </Block>
              <Block title="Task description">
                <Textarea rows={4} value={v.task_description || ""} onChange={(x) => set({ task_description: x.target.value })} placeholder="What exactly are you doing?" />
              </Block>
              <Block title="Step-by-step instructions">
                <Textarea rows={8} value={v.step_by_step_instructions || ""} onChange={(x) => set({ step_by_step_instructions: x.target.value })} placeholder="1. …&#10;2. …&#10;3. …" className="font-mono text-sm" />
              </Block>
              <Block title="Success criteria">
                <Textarea rows={3} value={v.success_criteria || ""} onChange={(x) => set({ success_criteria: x.target.value })} placeholder="How will you know this worked?" />
              </Block>
            </div>
            <div className="space-y-4">
              <Block title="Tools needed">
                <Input value={arrayToCsv(v.tools_needed)} onChange={(x) => set({ tools_needed: csvToArray(x.target.value) })} placeholder="claude, n8n, supabase" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(v.tools_needed || []).map((t: string) => <Chip key={t}>{t}</Chip>)}
                </div>
              </Block>
              <div className="surface-card p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Quick actions</div>
                <div className="flex flex-col gap-2">
                  {v.status !== "in_progress" && v.status !== "completed" && (
                    <Button onClick={() => save({ status: "in_progress" })}><Play className="h-4 w-4 mr-1" />Start now</Button>
                  )}
                  {v.status === "in_progress" && (
                    <Button onClick={() => save({ status: "completed" })}><CheckCircle2 className="h-4 w-4 mr-1" />Mark complete</Button>
                  )}
                  <Button variant="outline" onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save changes</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* RESULT */}
        <TabsContent value="result" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Block title="Result submission">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Result URL</Label>
                  <Input value={v.result_url || ""} onChange={(x) => set({ result_url: x.target.value })} placeholder="https://…" />
                  {v.result_url && (
                    <a className="mt-1 inline-flex items-center gap-1 text-xs text-primary" href={v.result_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" /> Open result
                    </a>
                  )}
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Result summary</Label>
                  <Textarea rows={6} value={v.result_summary || ""} onChange={(x) => set({ result_summary: x.target.value })} placeholder="What did you actually build / produce?" />
                </div>
              </div>
            </Block>
            <Block title="Self-reflection">
              <Textarea rows={10} value={v.self_reflection || ""} onChange={(x) => set({ self_reflection: x.target.value })} placeholder="What went well? What didn't? What would you change?" />
            </Block>
            <Block title="AI feedback">
              <Textarea rows={8} value={v.ai_feedback || ""} onChange={(x) => set({ ai_feedback: x.target.value })} placeholder="Paste evaluator output, Claude/GPT review notes, or auto-generated feedback. n8n will fill this later." />
            </Block>
            <Block title="Next experiment idea">
              <Textarea rows={4} value={v.next_experiment_idea || ""} onChange={(x) => set({ next_experiment_idea: x.target.value })} placeholder="What's the natural follow-up?" />
              <Label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">What I learned</Label>
              <Textarea rows={3} value={v.what_i_learned || ""} onChange={(x) => set({ what_i_learned: x.target.value })} placeholder="One paragraph. Make future-you smarter." />
            </Block>
          </div>
        </TabsContent>

        {/* SCORE BREAKDOWN */}
        <TabsContent value="score" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 surface-card p-6 space-y-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold">Scoring breakdown</h3>
                <div className="text-xs text-muted-foreground">Each dimension scored 0–20 · total 0–100</div>
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
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Computed total</div>
                <div className="font-display text-2xl font-bold text-gradient">{computedTotal}/100</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => upsert.mutate(v)} disabled={upsert.isPending}>
                  <Save className="h-4 w-4 mr-1" />Save scores
                </Button>
                <Button variant="ghost" onClick={() => set({ score_technical: null, score_creativity: null, score_practical: null, score_documentation: null, score_learning: null })}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="surface-card p-6 flex flex-col items-center justify-center text-center">
              <ScoreRing value={v.score_total ?? computedTotal} size={160} />
              <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">Saved total</div>
              <div className="font-display text-3xl font-bold">{v.score_total ?? 0}<span className="text-base text-muted-foreground">/100</span></div>
              <div className="mt-3 text-xs text-muted-foreground max-w-[14rem]">
                Total updates automatically when you save individual scores.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* EDIT */}
        <TabsContent value="edit" className="mt-4">
          <div className="surface-card p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Date"><Input type="date" value={v.experiment_date || ""} onChange={(x) => set({ experiment_date: x.target.value })} /></Field>
              <Field label="Category"><Input value={v.category || ""} onChange={(x) => set({ category: x.target.value })} /></Field>
              <Field label="Difficulty 1-10"><Input type="number" min={1} max={10} value={v.difficulty || 5} onChange={(x) => set({ difficulty: Number(x.target.value) })} /></Field>
            </div>
            <Field label="Title"><Input value={v.title || ""} onChange={(x) => set({ title: x.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Estimated time (minutes)"><Input type="number" min={0} value={v.estimated_time_minutes ?? ""} onChange={(x) => set({ estimated_time_minutes: x.target.value === "" ? null : Number(x.target.value) })} /></Field>
              <Field label="Status">
                <Select value={v.status} onValueChange={(x) => set({ status: x })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Button onClick={() => upsert.mutate(v)}><Save className="h-4 w-4 mr-1" />Save metadata</Button>
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
