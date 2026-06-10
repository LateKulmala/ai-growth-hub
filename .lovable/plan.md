## AI Growth OS — Build Plan

A private, single-user AI learning operating system with a dark, futuristic "command center" feel. Built on TanStack Start + Supabase, ready for GitHub sync and future n8n integrations.

### 1. Authentication (MVP)
- Simple password-gated access stored in `localStorage` (single-user, private).
- Password lives in a `VITE_APP_PASSWORD` env var (default placeholder for now).
- Designed so we can swap in Supabase Auth later without rewriting routes.
- A pathless `_protected` layout enforces the gate; `/login` is public.

> Note: Because there's no real auth user yet, all Supabase tables will be **single-user / open-read-write** with RLS allowing the `anon` role full access. When we upgrade to Supabase Auth later, we'll tighten policies to `auth.uid()`.

### 2. Database (Supabase)
One migration creating all tables with `GRANT`s + permissive RLS for `anon`:

- `profile` (singleton row: bio, focus areas, public summary, learning score, streak)
- `projects`, `agents`, `agent_runs`
- `daily_briefings`, `experiments`, `experiment_reviews`
- `ai_news`, `social_insights`
- `learning_journal`, `skills`, `score_events`, `telegram_messages`

Each table: `id uuid pk`, `created_at`, `updated_at` + an update trigger, plus the domain fields from the spec.

### 3. Routes (TanStack Start, file-based)
```
/login                       public
/_protected/                 layout (gate)
  ├─ /                       Dashboard
  ├─ /portfolio              My AI Portfolio
  ├─ /projects, /projects/$id
  ├─ /agents, /agents/$id
  ├─ /briefings, /briefings/$id
  ├─ /experiments, /experiments/$id
  ├─ /news
  ├─ /social
  ├─ /journal
  ├─ /analytics
  └─ /settings
```
Shared shell with collapsible sidebar (shadcn `Sidebar`) + top bar showing streak/learning score.

### 4. Design system
- Dark-only theme. Deep slate/near-black background, neon cyan + violet accents, subtle grid/scanline backdrop.
- `src/styles.css` tokens: `--background`, `--surface`, `--primary` (cyan), `--accent` (violet), gradient + glow tokens, `--shadow-glow`.
- Reusable: `StatCard`, `SectionHeader`, `DataTable`, `StatusBadge`, `EmptyState`, `ScoreRing`, `GlowCard`.
- Font: Space Grotesk (display) + Inter (body) via `<link>` in root.

### 5. Data layer
- TanStack Query everywhere, `queryOptions` per table.
- Mutations via direct Supabase client (single-user, RLS open) — no server functions needed for MVP.
- Form handling via `react-hook-form` + Zod; modals (shadcn `Dialog`) for add/edit on each entity.
- Realistic seed data inserted via `supabase--insert` after migration approval.

### 6. Page contents (summary)
- **Dashboard**: 4 stat cards (Learning Score, Streak, Experiments done, Avg score), Today's Experiment + Today's Briefing panels, Recent lists, Agent status pills, Quick-action buttons opening create dialogs.
- **Portfolio**: Single profile doc — bio, skills (chips), tools, focus areas, public summary preview card.
- **Projects/Agents/Briefings/Experiments/News/Social/Journal**: Index = card or table grid + search/filter + add button; detail page with all fields, edit + delete.
- **Analytics**: Recharts (already in template) — score-over-time line, category breakdown bars, top tools, streak heatmap-ish strip.
- **Settings**: Profile form + placeholder cards for Telegram/n8n/API/Export.

### 7. Out of scope for this build (placeholders only)
- Real n8n/Telegram wiring (tables ready, settings page shows config placeholders).
- AI scoring of experiments (manual entry of score + AI feedback fields).
- Supabase Auth (swap-in later).

### Technical notes
- Tailwind v4 tokens in `src/styles.css` only.
- TanStack file-based routing; every route gets `errorComponent` + `notFoundComponent`.
- Sidebar uses `collapsible="icon"`; trigger pinned in top bar.
- All Supabase calls via `@/integrations/supabase/client`.
- Migration includes `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO anon, authenticated` and `service_role` ALL (MVP single-user).

Shipping order: migration → design tokens + shell → entity CRUD pages (projects, experiments, agents, briefings, news, social, journal) → portfolio + dashboard + analytics → settings → seed data.
