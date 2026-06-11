import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FlaskConical,
  Newspaper,
  Bot,
  Activity,
  Trophy,
  Flame,
  Sparkles,
  Play,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Clock,
  Target,
  ExternalLink,
  TrendingUp,
  CircleDot,
} from "lucide-react";
import { listQuery } from "@/lib/queries";
import { PageHeader, StatCard, StatusBadge, ScoreRing, Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useUpsert } from "@/lib/mutations";

export const Route = createFileRoute("/_protected/")({
  component: Dashboard,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function Dashboard() {
  const profile = useSuspenseQuery(listQuery<any>("profile")).data[0];
  const experiments = useSuspenseQuery(listQuery<any>("experiments", { column: "experiment_date" })).data;
  const briefings = useSuspenseQuery(listQuery<any>("daily_briefings", { column: "briefing_date" })).data;
  const news = useSuspenseQuery(listQuery<any>("ai_news", { column: "discovered_at" })).data;
  const journal = useSuspenseQuery(listQuery<any>("learning_journal", { column: "entry_date" })).data;
  const agents = useSuspenseQuery(listQuery<any>("agents")).data;
  const scoreEvents = useSuspenseQuery(listQuery<any>("score_events", { column: "event_date" })).data;

  const upsertExp = useUpsert("experiments");

  const today = new Date().toISOString().slice(0, 10);
  const todayExp =
    experiments.find((e: any) => e.experiment_date === today && e.status !== "completed") ||
    experiments.find((e: any) => e.status !== "completed") ||
    experiments[0];
  const todayBrief = briefings[0];

  const completed = experiments.filter((e: any) => e.status === "completed");
  const avgScore = completed.length
    ? Math.round(completed.reduce((a: number, e: any) => a + (e.score_total || 0), 0) / completed.length)
    : 0;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyScore = scoreEvents
    .filter((s: any) => new Date(s.event_date).getTime() >= weekAgo)
    .reduce((a: number, s: any) => a + (s.points || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tervetuloa takaisin, ${profile?.display_name || "Operaattori"}`}
        description="Sinun AI-ohjauskeskuksesi · järjestelmät kunnossa · päivän tehtävä alla"
      />

      {/* PÄIVÄN TEHTÄVÄ + AI-BRIEFING */}
      <div className="grid gap-4 lg:grid-cols-3">
        <MissionCard exp={todayExp} onStart={() => todayExp && upsertExp.mutate({ ...todayExp, status: "in_progress" })} onComplete={() => todayExp && upsertExp.mutate({ ...todayExp, status: "completed" })} pending={upsertExp.isPending} />
        <BriefingCard brief={todayBrief} />
      </div>

      {/* OPPIMISEN KEHITYS */}
      <section>
        <SectionHeader icon={Trophy} label="Oppimisen kehitys" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Kokonaispisteet" value={profile?.learning_score ?? 0} icon={Trophy} tone="primary" />
          <StatCard label="Tällä viikolla" value={`+${weeklyScore}`} icon={TrendingUp} tone="accent" hint="viim. 7 päivää" />
          <StatCard label="AI-kokeet" value={completed.length} icon={FlaskConical} tone="success" hint="valmiita" />
          <StatCard label="Keskipisteet" value={avgScore} icon={Activity} tone="primary" hint="kaikista koesta" />
          <StatCard label="Putki" value={`${profile?.weekly_streak ?? 0} pv`} icon={Flame} tone="warning" />
        </div>
      </section>

      {/* AGENTTITIIMIN TILA */}
      <section>
        <SectionHeader icon={Bot} label="Agenttitiimin tila" right={<Link to="/agents" className="text-xs text-primary inline-flex items-center gap-1">Näytä kaikki <ArrowRight className="h-3 w-3" /></Link>} />
        {agents.length === 0 ? (
          <div className="surface-card p-6 text-sm text-muted-foreground">Ei agentteja vielä käytössä.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {agents.slice(0, 8).map((a: any) => (
              <Link
                key={a.id}
                to="/agents/$id"
                params={{ id: a.id }}
                className="surface-card group p-4 hover:border-primary/40 transition relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CircleDot className={`h-3 w-3 ${a.status === "active" || a.status === "running" ? "text-[color:var(--success)] animate-pulse" : "text-muted-foreground"}`} />
                      <div className="font-medium truncate">{a.name}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground truncate">{a.role || "—"}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-3 flex items-end justify-between text-xs">
                  <div className="text-muted-foreground">
                    <div>Edellinen suoritus</div>
                    <div className="text-foreground">{a.last_run_at ? new Date(a.last_run_at).toLocaleDateString("fi-FI") : "ei koskaan"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground">Onnistuminen</div>
                    <div className="font-display text-base font-bold text-primary">{Math.round(Number(a.success_rate || 0))}%</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* VIIMEISIN TOIMINTA + SEURAAVAT PARHAAT ASKELEET */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          <RecentList
            title="AI-kokeet"
            icon={<FlaskConical className="h-4 w-4 text-muted-foreground" />}
            rows={experiments.slice(0, 5).map((e: any) => ({
              id: e.id,
              title: e.title,
              meta: `${e.status} · ${e.experiment_date || ""}`,
              to: `/experiments/${e.id}`,
            }))}
          />
          <RecentList
            title="Päiväkirjamerkinnät"
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            rows={journal.slice(0, 5).map((j: any) => ({
              id: j.id,
              title: j.what_i_learned?.slice(0, 80) || j.what_i_built?.slice(0, 80) || "(merkintä)",
              meta: `${j.entry_date || ""} · ${j.mood || ""}`,
              to: "/journal",
            }))}
          />
          <RecentList
            title="AI-uutiset"
            icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
            rows={news.slice(0, 5).map((n: any) => ({ id: n.id, title: n.title, meta: n.source, href: n.url }))}
          />
          <RecentList
            title="Päiväbriefingit"
            icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
            rows={briefings.slice(0, 5).map((b: any) => ({
              id: b.id,
              title: b.title,
              meta: b.briefing_date,
              to: `/briefings/${b.id}`,
            }))}
          />
        </div>

        <NextBestActions />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, right }: { icon: any; label: string; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</h2>
      </div>
      {right}
    </div>
  );
}

function MissionCard({ exp, onStart, onComplete, pending }: { exp: any; onStart: () => void; onComplete: () => void; pending: boolean }) {
  return (
    <div className="surface-card relative overflow-hidden p-6 lg:col-span-2">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Päivän tehtävä
          </div>
          {exp && <StatusBadge status={exp.status} />}
        </div>

        {exp ? (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{exp.title}</h2>
            {(exp.task_description || exp.background_context) && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {exp.task_description || exp.background_context}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Metric icon={Target} label="Vaikeustaso" value={`${exp.difficulty ?? "—"}/10`} />
              <Metric icon={Clock} label="Arvioitu aika" value={exp.estimated_time_minutes ? `${exp.estimated_time_minutes} min` : "—"} />
              <Metric icon={FlaskConical} label="Kategoria" value={exp.category || "—"} />
            </div>

            {exp.tools_needed?.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tarvittavat työkalut</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {exp.tools_needed.map((t: string) => <Chip key={t}>{t}</Chip>)}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={onStart} disabled={pending || exp.status === "in_progress" || exp.status === "completed"}>
                <Play className="h-4 w-4 mr-1" /> Aloita
              </Button>
              <Button onClick={onComplete} disabled={pending || exp.status === "completed"} variant="secondary">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Merkitse valmiiksi
              </Button>
              <Button asChild variant="ghost" className="ml-auto">
                <Link to="/experiments/$id" params={{ id: exp.id }}>Avaa <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Päivälle ei ole vielä jonotettu koetta.</p>
            <Button asChild className="mt-3"><Link to="/experiments">Suunnittele yksi</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}

function BriefingCard({ brief }: { brief: any }) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent">
          <Newspaper className="h-3.5 w-3.5" /> 5 minuutin AI-briefing
        </div>
        {brief?.briefing_date && (
          <span className="text-[10px] text-muted-foreground">{brief.briefing_date}</span>
        )}
      </div>

      {brief ? (
        <>
          <h3 className="mt-2 font-display text-lg font-semibold leading-tight line-clamp-2">{brief.title}</h3>
          {brief.executive_summary && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{brief.executive_summary}</p>
          )}

          {brief.hot_topics?.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Kuumat aiheet</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {brief.hot_topics.slice(0, 5).map((t: string) => <Chip key={t}>🔥 {t}</Chip>)}
              </div>
            </div>
          )}

          {Array.isArray(brief.recommended_articles) && brief.recommended_articles.length > 0 && (
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Suositellut artikkelit</div>
              <ul className="mt-1.5 space-y-1">
                {brief.recommended_articles.slice(0, 3).map((a: any, i: number) => (
                  <li key={i} className="text-xs">
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-foreground/90 hover:text-primary inline-flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> {a.title || a.url}
                      </a>
                    ) : (
                      <span className="text-foreground/90">{a.title || JSON.stringify(a)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {brief.why_it_matters && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="text-[10px] uppercase tracking-wider text-primary">Miksi tämä on tärkeää</div>
              <p className="mt-1 text-xs text-foreground/90 line-clamp-3">{brief.why_it_matters}</p>
            </div>
          )}

          <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
            <Link to="/briefings/$id" params={{ id: brief.id }}>Lue koko briefing <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Päivän briefingiä ei ole vielä saatu. n8n ei ole vielä toimittanut sitä.</p>
      )}
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
        <h3 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <ul className="space-y-2">
        {rows.length === 0 && <li className="text-sm text-muted-foreground">Ei vielä mitään.</li>}
        {rows.map((r) => {
          const content = (
            <>
              <div className="text-sm font-medium truncate">{r.title}</div>
              {r.meta && <div className="text-xs text-muted-foreground truncate">{r.meta}</div>}
            </>
          );
          return (
            <li key={r.id} className="rounded-lg border border-border/50 bg-surface/30 px-3 py-2 hover:border-primary/30 transition">
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

function NextBestActions() {
  const actions = [
    { label: "Tee päivän AI-koe", to: "/experiments", icon: FlaskConical },
    { label: "Käy läpi eilisen oppiminen", to: "/journal", icon: BookOpen },
    { label: "Päivitä yksi projekti", to: "/projects", icon: Target },
    { label: "Tarkista uudet AI-trendit", to: "/news", icon: TrendingUp },
  ];
  return (
    <div className="surface-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h3 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Seuraavat parhaat askeleet</h3>
      </div>
      <ul className="space-y-2">
        {actions.map((a, i) => (
          <li key={a.label}>
            <Link
              to={a.to as never}
              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-surface/30 px-3 py-2.5 hover:border-accent/40 hover:bg-accent/5 transition"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent text-xs font-bold">
                {i + 1}
              </span>
              <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm flex-1">{a.label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <ScoreRing value={70} size={36} />
        <span>Olet hyvällä kurssilla. Jatka rakentamista.</span>
      </div>
    </div>
  );
}
