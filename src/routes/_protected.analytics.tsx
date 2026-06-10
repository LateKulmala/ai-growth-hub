import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { listQuery } from "@/lib/queries";
import { PageHeader, StatCard } from "@/components/ui-bits";
import { Flame, FlaskConical, FolderKanban, Bot, Trophy, Activity } from "lucide-react";

export const Route = createFileRoute("/_protected/analytics")({
  component: AnalyticsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Not found</div>,
});

function AnalyticsPage() {
  const exps = useSuspenseQuery(listQuery<any>("experiments", { column: "experiment_date", ascending: true })).data;
  const projects = useSuspenseQuery(listQuery<any>("projects")).data;
  const agents = useSuspenseQuery(listQuery<any>("agents")).data;
  const profile = useSuspenseQuery(listQuery<any>("profile")).data[0];

  const completed = exps.filter((e) => e.status === "completed");
  const avg = completed.length ? Math.round(completed.reduce((a, e) => a + (e.score || 0), 0) / completed.length) : 0;

  const scoreSeries = useMemo(
    () => completed.map((e, i) => ({ name: e.experiment_date, score: e.score ?? 0, idx: i + 1 })),
    [completed],
  );

  const categoryAgg = useMemo(() => {
    const map = new Map<string, number>();
    exps.forEach((e) => {
      const k = e.category || "Uncategorized";
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([category, count]) => ({ category, count }));
  }, [exps]);

  const toolAgg = useMemo(() => {
    const map = new Map<string, number>();
    exps.forEach((e) => (e.tools_needed || []).forEach((t: string) => map.set(t, (map.get(t) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tool, count]) => ({ tool, count }));
  }, [exps]);

  const best = [...completed].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);
  const weakest = [...completed].filter((e) => e.score != null).sort((a, b) => (a.score || 0) - (b.score || 0)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Your AI growth, visualized" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Experiments" value={completed.length} icon={FlaskConical} tone="primary" />
        <StatCard label="Avg Score" value={avg} icon={Activity} tone="accent" />
        <StatCard label="Learning Score" value={profile?.learning_score ?? 0} icon={Trophy} tone="success" />
        <StatCard label="Streak" value={`${profile?.weekly_streak ?? 0}d`} icon={Flame} tone="warning" />
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} />
        <StatCard label="Agents" value={agents.length} icon={Bot} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Score over time">
          <ResponsiveContainer>
            <LineChart data={scoreSeries}>
              <CartesianGrid strokeOpacity={0.1} />
              <XAxis dataKey="idx" stroke="oklch(0.70 0.02 260)" fontSize={11} />
              <YAxis stroke="oklch(0.70 0.02 260)" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.025 260)", border: "1px solid var(--border)" }} />
              <Line type="monotone" dataKey="score" stroke="oklch(0.78 0.16 200)" strokeWidth={2} dot={{ r: 3, fill: "oklch(0.78 0.16 200)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Experiments by category">
          <ResponsiveContainer>
            <BarChart data={categoryAgg}>
              <CartesianGrid strokeOpacity={0.1} />
              <XAxis dataKey="category" stroke="oklch(0.70 0.02 260)" fontSize={11} />
              <YAxis stroke="oklch(0.70 0.02 260)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.025 260)", border: "1px solid var(--border)" }} />
              <Bar dataKey="count" fill="oklch(0.70 0.22 300)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Most used tools">
          <ResponsiveContainer>
            <BarChart data={toolAgg} layout="vertical">
              <CartesianGrid strokeOpacity={0.1} />
              <XAxis type="number" stroke="oklch(0.70 0.02 260)" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="tool" stroke="oklch(0.70 0.02 260)" fontSize={11} width={100} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.025 260)", border: "1px solid var(--border)" }} />
              <Bar dataKey="count" fill="oklch(0.78 0.16 200)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <div className="surface-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Top scoring experiments</div>
          <ul className="space-y-2">
            {best.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{e.title}</span>
                <span className="text-primary font-semibold">{e.score}</span>
              </li>
            ))}
            {best.length === 0 && <li className="text-sm text-muted-foreground">No completed experiments yet.</li>}
          </ul>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mt-5 mb-3">Weakest areas</div>
          <ul className="space-y-2">
            {weakest.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{e.title}</span>
                <span className="text-destructive font-semibold">{e.score}</span>
              </li>
            ))}
            {weakest.length === 0 && <li className="text-sm text-muted-foreground">—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{title}</div>
      <div className="h-64">{children}</div>
    </div>
  );
}
