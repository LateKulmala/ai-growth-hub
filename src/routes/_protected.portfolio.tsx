import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listQuery } from "@/lib/queries";
import { useUpsert, useDelete, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Save, User, Plus, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_protected/portfolio")({
  component: PortfolioPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

const EMPTY_SKILL = { name: "", category: "", proficiency: 5, notes: "" };

function PortfolioPage() {
  const profiles = useSuspenseQuery(listQuery<any>("profile")).data;
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const agents = useSuspenseQuery(listQuery<any>("agents")).data;
  const journal = useSuspenseQuery(listQuery<any>("learning_journal", { column: "entry_date" })).data;
  const skills = useSuspenseQuery(listQuery<any>("skills")).data;
  const profile = profiles[0];
  const upsert = useUpsert("profile");
  const upsertSkill = useUpsert("skills");
  const deleteSkill = useDelete("skills");

  const [f, setF] = useState<any>(null);
  const v = f ?? profile ?? {
    display_name: "AI-operaattori",
    bio: "",
    focus_areas: [],
    tools: [],
    skills: [],
    strengths: [],
    development_goals: [],
    public_summary: "",
    learning_score: 0,
    weekly_streak: 0,
  };

  // Dialog state for skill create/edit
  const [skillDialog, setSkillDialog] = useState<{ open: boolean; skill: any }>({
    open: false,
    skill: { ...EMPTY_SKILL },
  });

  const openCreate = () =>
    setSkillDialog({ open: true, skill: { ...EMPTY_SKILL } });

  const openEdit = (skill: any) =>
    setSkillDialog({ open: true, skill: { ...skill } });

  const closeDialog = () =>
    setSkillDialog((prev) => ({ ...prev, open: false }));

  const saveSkill = () => {
    upsertSkill.mutate(skillDialog.skill, { onSuccess: closeDialog });
  };

  // Group skills by category
  const grouped: Record<string, any[]> = {};
  for (const s of skills ?? []) {
    const cat = s.category || "Muu";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }
  const categories = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI-portfolio"
        description="Sinun elävä profiilisi · todiste osaamisesta ja kehityksestä"
        actions={
          <Button onClick={() => upsert.mutate(v)} disabled={upsert.isPending}>
            <Save className="h-4 w-4 mr-1" /> Tallenna profiili
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <Input
              className="text-xl font-display font-bold"
              value={v.display_name || ""}
              onChange={(e) => setF({ ...v, display_name: e.target.value })}
            />
          </div>

          <Field label="Lyhyt bio">
            <Textarea rows={3} value={v.bio || ""} onChange={(e) => setF({ ...v, bio: e.target.value })} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Painopistealueet (pilkulla erotettuna)">
              <Input value={arrayToCsv(v.focus_areas)} onChange={(e) => setF({ ...v, focus_areas: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Työkalut (pilkulla erotettuna)">
              <Input value={arrayToCsv(v.tools)} onChange={(e) => setF({ ...v, tools: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Taidot (pilkulla erotettuna)">
              <Input value={arrayToCsv(v.skills)} onChange={(e) => setF({ ...v, skills: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Vahvuudet">
              <Input value={arrayToCsv(v.strengths)} onChange={(e) => setF({ ...v, strengths: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Kehittymistavoitteet">
              <Input value={arrayToCsv(v.development_goals)} onChange={(e) => setF({ ...v, development_goals: csvToArray(e.target.value) })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Oppimispisteet">
                <Input type="number" value={v.learning_score ?? 0} onChange={(e) => setF({ ...v, learning_score: Number(e.target.value) })} />
              </Field>
              <Field label="Viikkoputki">
                <Input type="number" value={v.weekly_streak ?? 0} onChange={(e) => setF({ ...v, weekly_streak: Number(e.target.value) })} />
              </Field>
            </div>
          </div>

          <Field label="Julkinen portfolioyhteenveto">
            <Textarea rows={4} value={v.public_summary || ""} onChange={(e) => setF({ ...v, public_summary: e.target.value })} />
          </Field>
        </div>

        <div className="space-y-4">
          <PreviewCard
            name={v.display_name}
            bio={v.bio}
            skills={v.skills}
            tools={v.tools}
            summary={v.public_summary}
          />
          <div className="surface-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Yhdellä silmäyksellä</div>
            <ul className="space-y-1 text-sm">
              <li>{projects.length} projektia</li>
              <li>{agents.length} agenttia / automaatiota</li>
              <li>{journal.length} päiväkirjamerkintää</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Käytetyt työkalut */}
      {(v.tools ?? []).length > 0 && (
        <div className="surface-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Käytetyt työkalut</div>
          <div className="flex flex-wrap gap-2">
            {(v.tools as string[]).map((tool: string) => (
              <Chip key={tool}>{tool}</Chip>
            ))}
          </div>
        </div>
      )}

      {/* Osaaminen ja taitotasot */}
      <div className="surface-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold">Osaaminen ja taitotasot</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {skills.length} taitoa · pohjautuu skills-tauluun
            </div>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Lisää taito
          </Button>
        </div>

        {skills.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Ei vielä taitoja. Lisää ensimmäinen klikkaamalla "Lisää taito".
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-1">
                  {cat}
                </div>
                <div className="space-y-3">
                  {grouped[cat].map((skill: any) => (
                    <SkillRow
                      key={skill.id}
                      skill={skill}
                      onEdit={() => openEdit(skill)}
                      onDelete={() => deleteSkill.mutate(skill.id)}
                      isDeleting={deleteSkill.isPending}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill create/edit dialog */}
      <Dialog open={skillDialog.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {skillDialog.skill?.id ? "Muokkaa taitoa" : "Lisää uusi taito"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Field label="Nimi">
              <Input
                value={skillDialog.skill?.name ?? ""}
                onChange={(e) =>
                  setSkillDialog((prev) => ({
                    ...prev,
                    skill: { ...prev.skill, name: e.target.value },
                  }))
                }
                placeholder="esim. Prompt engineering"
              />
            </Field>

            <Field label="Kategoria">
              <Input
                value={skillDialog.skill?.category ?? ""}
                onChange={(e) =>
                  setSkillDialog((prev) => ({
                    ...prev,
                    skill: { ...prev.skill, category: e.target.value },
                  }))
                }
                placeholder="esim. AI-kehitys"
              />
            </Field>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Taitotaso 1–10
                </Label>
                <span className="font-display text-lg font-bold text-primary">
                  {skillDialog.skill?.proficiency ?? 5}
                  <span className="text-xs text-muted-foreground font-normal">/10</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[skillDialog.skill?.proficiency ?? 5]}
                  onValueChange={(arr) =>
                    setSkillDialog((prev) => ({
                      ...prev,
                      skill: { ...prev.skill, proficiency: arr[0] },
                    }))
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={skillDialog.skill?.proficiency ?? 5}
                  onChange={(e) =>
                    setSkillDialog((prev) => ({
                      ...prev,
                      skill: {
                        ...prev.skill,
                        proficiency: Math.max(1, Math.min(10, Number(e.target.value))),
                      },
                    }))
                  }
                  className="w-20"
                />
              </div>
            </div>

            <Field label="Muistiinpanot">
              <Textarea
                rows={3}
                value={skillDialog.skill?.notes ?? ""}
                onChange={(e) =>
                  setSkillDialog((prev) => ({
                    ...prev,
                    skill: { ...prev.skill, notes: e.target.value },
                  }))
                }
                placeholder="Vapaamuotoiset muistiinpanot tästä taidosta..."
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Peruuta</Button>
            </DialogClose>
            <Button onClick={saveSkill} disabled={upsertSkill.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {skillDialog.skill?.id ? "Tallenna muutokset" : "Lisää taito"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillRow({
  skill,
  onEdit,
  onDelete,
  isDeleting,
}: {
  skill: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const pct = Math.round(((skill.proficiency ?? 0) / 10) * 100);
  return (
    <div className="flex items-center gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-medium truncate">{skill.name}</span>
          <span className="text-xs tabular-nums text-muted-foreground ml-2 shrink-0">
            {skill.proficiency ?? 0}/10
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
        {skill.notes && (
          <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{skill.notes}</div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
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

function PreviewCard({ name, bio, skills, tools, summary }: any) {
  return (
    <div className="surface-card p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-primary">Julkinen esikatselu</div>
        <div className="mt-1 font-display text-xl font-bold">{name}</div>
        <p className="mt-2 text-sm text-muted-foreground">{bio || "Lisää bio."}</p>
        {summary && <p className="mt-2 text-sm">{summary}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(skills || []).slice(0, 8).map((s: string) => <Chip key={s}>{s}</Chip>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(tools || []).slice(0, 8).map((s: string) => <Chip key={s}>{s}</Chip>)}
        </div>
      </div>
    </div>
  );
}
