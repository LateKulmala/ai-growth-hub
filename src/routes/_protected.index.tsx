import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FlaskConical, Newspaper, Bot, FolderKanban, Activity, Trophy, Zap, Flame } from "lucide-react";
import { listQuery } from "@/lib/queries";
import { PageHeader, StatCard, StatusBadge, ScoreRing } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_protected/")({
  component: Dashboard,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function Dashboard() {
  const profile = useSuspenseQuery(listQuery<any>("profile")).data[0];
  const experiments = useSuspenseQuery(listQuery<any>("experiments", { column: "experiment_date" })).data;
  const briefings = useSuspenseQuery(listQuery<any>("daily_briefings", { column: "briefing_date" })).data;
  const news = useSuspenseQuery(listQuery<any>("ai_news", { column: "discovered_at" })).data;
  const social = useSuspenseQuery(listQuery<any>("social_insights", { column: "discovered_at" })).data;
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const agents = useSuspenseQuery(listQuery<any>("agents")).data;

  const todayExp = experiments[0];
  const todayBrief = briefings[0];
  const completed = experiments.filter((e) => e.status === "completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((a, e) => a + (e.score || 0), 0) / completed.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.display_name || "Operator"}`}
        description="Your AI command center · today's mission below"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Learning Score" value={profile?.learning_score ?? 0} icon={Trophy} tone="primary" />
        <StatCard label="Weekly Streak" value={`${profile?.weekly_streak ?? 0}d`} icon={Flame} tone="warning" />
        <StatCard label="Experiments Done" value={completed.length} icon={FlaskConical} tone="accent" />
        <StatCard label="Avg Score" value={`${avgScore}`} icon={Activity} tone="success" hint="all completed experiments" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-primary">Today's experiment</div>
              <h2 className="mt-1 font-display text-xl font-semibold">
                {todayExp?.title || "No experiment queued"}
              </h2>
            </div>
            {todayExp && <StatusBadge status={todayExp.status} />}
          </div>
          {todayExp ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{todayExp.task || todayExp.background}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">Difficulty {todayExp.difficulty}/10</span>
                <span className="text-xs text-muted-foreground">· {todayExp.estimated_time || "—"}</span>
                <Button asChild size="sm" className="ml-auto">
                  <Link to="/experiments/$id" params={{ id: todayExp.id }}>Open experiment</Link>
                </Button>
              </div>
            </>
          ) : (
            <Button asChild size="sm" className="mt-4"><Link to="/experiments">Plan one</Link></Button>
          )}
        </div>

        <div className="surface-card p-6 flex items-center gap-6">
          <ScoreRing value={profile?.learning_score ?? 0} size={96} />
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Operator level</div>
            <div className="font-display text-2xl font-bold text-gradient">
              {profile?.learning_score >= 80 ? "Architect" : profile?.learning_score >= 50 ? "Builder" : "Apprentice"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{profile?.focus_areas?.[0] || "Set a focus"}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Today's briefing</h3>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </div>
          {todayBrief ? (
            <Link to="/briefings/$id" params={{ id: todayBrief.id }} className="block">
              <div className="text-sm font-medium">{todayBrief.title}</div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{todayBrief.executive_summary}</p>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No briefing yet today.</p>
          )}
        </div>

        <div className="surface-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Agents</h3>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {agents.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.role}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {agents.length === 0 && <p className="text-sm text-muted-foreground">No agents yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentList
          title="Recent experiments"
          icon={<FlaskConical className="h-4 w-4 text-muted-foreground" />}
          rows={experiments.slice(0, 5).map((e) => ({ id: e.id, title: e.title, meta: e.status, to: `/experiments/${e.id}` }))}
        />
        <RecentList
          title="Recent AI news"
          icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
          rows={news.slice(0, 5).map((n) => ({ id: n.id, title: n.title, meta: n.source, href: n.url }))}
        />
        <RecentList
          title="Social insights"
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          rows={social.slice(0, 5).map((s) => ({ id: s.id, title: s.topic || s.summary?.slice(0, 60), meta: s.platform, href: s.post_url }))}
        />
      </div>

      <div className="surface-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Active projects</h3>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((p) => (
            <Link
              to="/projects/$id"
              params={{ id: p.id }}
              key={p.id}
              className="rounded-xl border border-border bg-surface/40 p-4 hover:border-primary/40 transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">{p.name}</div>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link to="/experiments"><Plus className="h-4 w-4 mr-1" />Experiment</Link></Button>
        <Button asChild variant="outline"><Link to="/projects"><Plus className="h-4 w-4 mr-1" />Project</Link></Button>
        <Button asChild variant="outline"><Link to="/journal"><Plus className="h-4 w-4 mr-1" />Journal entry</Link></Button>
      </div>
    </div>
  );
}

function RecentList({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { id: string; title: string; meta?: string; to?: string; href?: string }[];
}) {
  return (
    <div className="surface-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <ul className="space-y-2">
        {rows.length === 0 && <li className="text-sm text-muted-foreground">Nothing yet.</li>}
        {rows.map((r) => {
          const content = (
            <>
              <div className="text-sm font-medium truncate">{r.title}</div>
              {r.meta && <div className="text-xs text-muted-foreground truncate">{r.meta}</div>}
            </>
          );
          return (
            <li key={r.id} className="rounded-lg border border-border/50 bg-surface/30 px-3 py-2 hover:border-primary/30">
              {r.to ? (
                <Link to={r.to as never}>{content}</Link>
              ) : r.href ? (
                <a href={r.href} target="_blank" rel="noreferrer">{content}</a>
              ) : (
                <div>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
