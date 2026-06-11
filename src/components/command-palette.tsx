import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Bot,
  FlaskConical,
  Newspaper,
  Radio,
  MessagesSquare,
  BookOpen,
  LineChart,
  Zap,
  Settings,
  ExternalLink,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { listQuery } from "@/lib/queries";

const PAGES = [
  { title: "Ohjauskeskus", url: "/", icon: LayoutDashboard },
  { title: "AI-portfolio", url: "/portfolio", icon: User },
  { title: "Projektit", url: "/projects", icon: FolderKanban },
  { title: "Agentit", url: "/agents", icon: Bot },
  { title: "AI-kokeet", url: "/experiments", icon: FlaskConical },
  { title: "Päiväbriefingit", url: "/briefings", icon: Newspaper },
  { title: "Uutiset ja trendit", url: "/news", icon: Radio },
  { title: "Somehavainnot", url: "/social", icon: MessagesSquare },
  { title: "Oppimispäiväkirja", url: "/journal", icon: BookOpen },
  { title: "Analytiikka", url: "/analytics", icon: LineChart },
  { title: "Automaatiot", url: "/automation", icon: Zap },
  { title: "Asetukset", url: "/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Listen for an app-wide event so a header button can open the palette too.
  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener("open-command-palette", openIt);
    return () => window.removeEventListener("open-command-palette", openIt);
  }, []);

  // Only fetch entities while the palette is open to keep the rest of the app light.
  const projects = useQuery({ ...listQuery<any>("projects"), enabled: open }).data ?? [];
  const agents = useQuery({ ...listQuery<any>("agents"), enabled: open }).data ?? [];
  const experiments = useQuery({ ...listQuery<any>("experiments", { column: "experiment_date" }), enabled: open }).data ?? [];
  const briefings = useQuery({ ...listQuery<any>("daily_briefings", { column: "briefing_date" }), enabled: open }).data ?? [];
  const news = useQuery({ ...listQuery<any>("ai_news", { column: "discovered_at" }), enabled: open }).data ?? [];

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Etsi projekteja, agentteja, kokeita, uutisia…" />
      <CommandList>
        <CommandEmpty>Ei osumia.</CommandEmpty>

        <CommandGroup heading="Sivut">
          {PAGES.map((p) => (
            <CommandItem
              key={p.url}
              value={`sivu ${p.title}`}
              onSelect={() => go(() => navigate({ to: p.url as never }))}
            >
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {p.title}
            </CommandItem>
          ))}
        </CommandGroup>

        {projects.length > 0 && (
          <CommandGroup heading="Projektit">
            {projects.map((p: any) => (
              <CommandItem
                key={p.id}
                value={`projekti ${p.name} ${p.purpose ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/projects/$id", params: { id: p.id } }))}
              >
                <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {agents.length > 0 && (
          <CommandGroup heading="Agentit">
            {agents.map((a: any) => (
              <CommandItem
                key={a.id}
                value={`agentti ${a.name} ${a.role ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/agents/$id", params: { id: a.id } }))}
              >
                <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
                {a.name}
                {a.role && <span className="ml-2 text-xs text-muted-foreground">{a.role}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {experiments.length > 0 && (
          <CommandGroup heading="AI-kokeet">
            {experiments.map((e: any) => (
              <CommandItem
                key={e.id}
                value={`koe ${e.title} ${e.category ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/experiments/$id", params: { id: e.id } }))}
              >
                <FlaskConical className="mr-2 h-4 w-4 text-muted-foreground" />
                {e.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {briefings.length > 0 && (
          <CommandGroup heading="Briefingit">
            {briefings.map((b: any) => (
              <CommandItem
                key={b.id}
                value={`briefing ${b.title} ${b.briefing_date ?? ""}`}
                onSelect={() => go(() => navigate({ to: "/briefings/$id", params: { id: b.id } }))}
              >
                <Newspaper className="mr-2 h-4 w-4 text-muted-foreground" />
                {b.title}
                {b.briefing_date && <span className="ml-2 text-xs text-muted-foreground">{b.briefing_date}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {news.length > 0 && (
          <CommandGroup heading="Uutiset">
            {news.slice(0, 20).map((n: any) => (
              <CommandItem
                key={n.id}
                value={`uutinen ${n.title} ${n.source ?? ""}`}
                onSelect={() =>
                  go(() => {
                    if (n.url) window.open(n.url, "_blank", "noopener,noreferrer");
                    else navigate({ to: "/news" });
                  })
                }
              >
                <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="truncate">{n.title}</span>
                {n.source && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{n.source}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
