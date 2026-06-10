import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: string;
  tone?: "primary" | "accent" | "success" | "warning";
}) {
  const toneClass = {
    primary: "from-primary/20 to-primary/0 text-primary",
    accent: "from-accent/20 to-accent/0 text-accent",
    success: "from-[color:var(--success)]/20 to-transparent text-[color:var(--success)]",
    warning: "from-[color:var(--warning)]/20 to-transparent text-[color:var(--warning)]",
  }[tone];

  return (
    <div className="surface-card relative overflow-hidden p-5">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", toneClass)} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg bg-background/40 p-2 backdrop-blur", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiivinen",
  running: "Käynnissä",
  completed: "Valmis",
  "in progress": "Kesken",
  in_progress: "Kesken",
  planned: "Suunniteltu",
  idle: "Vapaa",
  skipped: "Ohitettu",
  paused: "Tauolla",
  error: "Virhe",
  archived: "Arkistoitu",
  pending: "Odottaa",
  success: "Onnistui",
  failed: "Epäonnistui",
  disconnected: "Ei yhdistetty",
  connected: "Yhdistetty",
};

export function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || "").toLowerCase();
  const map: Record<string, string> = {
    active: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    running: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    completed: "bg-primary/15 text-primary border-primary/30",
    "in progress": "bg-accent/15 text-accent border-accent/30",
    in_progress: "bg-accent/15 text-accent border-accent/30",
    planned: "bg-muted text-muted-foreground border-border",
    idle: "bg-muted text-muted-foreground border-border",
    skipped: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    paused: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
    error: "bg-destructive/15 text-destructive border-destructive/30",
    archived: "bg-muted text-muted-foreground border-border",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const cls = map[s] || "bg-muted text-muted-foreground border-border";
  const label = STATUS_LABELS[s] || status || "—";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", cls)}>
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card p-10 text-center">
      <div className="font-display text-lg font-semibold">{title}</div>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-2/40 px-2 py-0.5 text-xs text-foreground/80">
      {children}
    </span>
  );
}

export function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const v = Math.max(0, Math.min(100, value));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (v / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#scoreGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.16 200)" />
          <stop offset="100%" stopColor="oklch(0.70 0.22 300)" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dy="0.35em"
        textAnchor="middle"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        className="fill-foreground font-display"
        style={{ fontSize: size * 0.28, fontWeight: 700 }}
      >
        {v}
      </text>
    </svg>
  );
}
