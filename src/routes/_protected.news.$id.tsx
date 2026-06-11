import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, BookOpen, Newspaper } from "lucide-react";
import { rowQuery } from "@/lib/queries";
import { Chip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { ArticleBody } from "@/components/article-body";

export const Route = createFileRoute("/_protected/news/$id")({
  component: NewsDetail,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

function NewsDetail() {
  const { id } = Route.useParams();
  const n = useSuspenseQuery(rowQuery<any>("ai_news", id)).data;
  if (!n) return <div className="p-4">Ei löytynyt</div>;

  const isLesson = n.kind === "lesson";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/news"><ArrowLeft className="h-4 w-4 mr-1" />Uutiset ja briefingit</Link>
      </Button>

      <article className="surface-card p-6 sm:p-8 space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${isLesson ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}>
              {isLesson ? <BookOpen className="h-3 w-3" /> : <Newspaper className="h-3 w-3" />}
              {isLesson ? "Oppitunti" : "Uutinen"}
            </span>
            {n.category && <span className="text-muted-foreground">{n.category}</span>}
            <span className="text-muted-foreground">
              {n.source ? `${n.source} · ` : ""}{new Date(n.discovered_at).toLocaleDateString("fi-FI")}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{n.title}</h1>

          {n.summary && <p className="text-base text-muted-foreground leading-relaxed">{n.summary}</p>}

          {(n.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(n.tags as string[]).map((t) => <Chip key={t}>{t}</Chip>)}
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {n.content ? (
          <ArticleBody content={n.content} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Tälle merkinnälle ei ole vielä koko tekstiä. {n.url ? "Avaa alkuperäinen lähde alta." : ""}
          </p>
        )}

        {!isLesson && n.url && (
          <div className="pt-2">
            <a
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />Avaa alkuperäinen lähde
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
