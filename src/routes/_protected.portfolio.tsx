import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, User } from "lucide-react";

export const Route = createFileRoute("/_protected/portfolio")({
  component: PortfolioPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function PortfolioPage() {
  const profiles = useSuspenseQuery(listQuery<any>("profile")).data;
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const agents = useSuspenseQuery(listQuery<any>("agents")).data;
  const journal = useSuspenseQuery(listQuery<any>("learning_journal", { column: "entry_date" })).data;
  const profile = profiles[0];
  const upsert = useUpsert("profile");

  const [f, setF] = useState<any>(null);
  const v = f ?? profile ?? {
    display_name: "AI Operator",
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My AI Portfolio"
        description="Your living profile · proof of skills and growth"
        actions={
          <Button onClick={() => upsert.mutate(v)} disabled={upsert.isPending}>
            <Save className="h-4 w-4 mr-1" /> Save profile
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

          <Field label="Short bio">
            <Textarea rows={3} value={v.bio || ""} onChange={(e) => setF({ ...v, bio: e.target.value })} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Focus areas (comma separated)">
              <Input value={arrayToCsv(v.focus_areas)} onChange={(e) => setF({ ...v, focus_areas: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Tools (comma separated)">
              <Input value={arrayToCsv(v.tools)} onChange={(e) => setF({ ...v, tools: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Skills (comma separated)">
              <Input value={arrayToCsv(v.skills)} onChange={(e) => setF({ ...v, skills: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Strengths">
              <Input value={arrayToCsv(v.strengths)} onChange={(e) => setF({ ...v, strengths: csvToArray(e.target.value) })} />
            </Field>
            <Field label="Development goals">
              <Input value={arrayToCsv(v.development_goals)} onChange={(e) => setF({ ...v, development_goals: csvToArray(e.target.value) })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Learning score">
                <Input type="number" value={v.learning_score ?? 0} onChange={(e) => setF({ ...v, learning_score: Number(e.target.value) })} />
              </Field>
              <Field label="Weekly streak">
                <Input type="number" value={v.weekly_streak ?? 0} onChange={(e) => setF({ ...v, weekly_streak: Number(e.target.value) })} />
              </Field>
            </div>
          </div>

          <Field label="Public portfolio summary">
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">At a glance</div>
            <ul className="space-y-1 text-sm">
              <li>{projects.length} projects</li>
              <li>{agents.length} agents / automations</li>
              <li>{journal.length} journal entries</li>
            </ul>
          </div>
        </div>
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
        <div className="text-xs uppercase tracking-wider text-primary">Public preview</div>
        <div className="mt-1 font-display text-xl font-bold">{name}</div>
        <p className="mt-2 text-sm text-muted-foreground">{bio || "Add a bio."}</p>
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
