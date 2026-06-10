import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Send, Webhook, KeyRound, Save, Bot, Clock, Zap, BookOpen, ShieldCheck, Languages } from "lucide-react";
import { getAllowedEmail } from "@/lib/auth";
import { listQuery } from "@/lib/queries";
import { useUpsert, arrayToCsv, csvToArray } from "@/lib/mutations";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
  errorComponent: ({ error }) => <div className="p-4 text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-4">Ei löytynyt</div>,
});

const TG_LABEL: Record<string, string> = {
  disconnected: "Ei yhdistetty",
  pending: "Odottaa asetusta",
  connected: "Yhdistetty",
};

function SettingsPage() {
  const profile = useSuspenseQuery(listQuery<any>("profile")).data[0];
  const upsert = useUpsert("profile");
  const [f, setF] = useState<any>(null);
  const v = f ?? profile ?? {};

  function update(patch: any) {
    setF({ ...v, ...patch });
  }

  function save() {
    upsert.mutate(v, {
      onSuccess: () => toast.success("Asetukset tallennettu"),
    });
  }

  async function exportAll() {
    const tables = ["profile", "projects", "agents", "agent_runs", "daily_briefings", "experiments", "experiment_reviews", "ai_news", "social_insights", "learning_journal", "skills", "score_events", "telegram_messages", "automation_logs"];
    const out: Record<string, any> = {};
    for (const t of tables) {
      const { data } = await supabase.from(t as any).select("*");
      out[t] = data ?? [];
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-growth-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Vienti ladattu");
  }

  const tgStatus = v.telegram_bot_status || "disconnected";
  const tgVariant = tgStatus === "connected" ? "default" : tgStatus === "pending" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asetukset"
        description="Profiili, integraatiot, automaatio ja data"
        actions={<Button onClick={save}><Save className="h-4 w-4 mr-1" />Tallenna muutokset</Button>}
      />

      {/* Yksityinen pääsy */}
      <div className="surface-card p-6 space-y-3 border-primary/30">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Yksityinen pääsy</h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Tämä on <span className="text-foreground font-medium">yksityinen yhden käyttäjän sovellus</span>. Julkinen rekisteröinti on poistettu käytöstä.</li>
          <li>Vain <span className="text-foreground font-medium">{getAllowedEmail() || "määritetty omistaja"}</span> voi kirjautua sisään.</li>
          <li>Yksityinen pääsyavain vaaditaan kirjautuessa salasanan lisäksi.</li>
          <li>Pidä pääsyavain salassa — se on tallennettu vain <code className="font-mono text-xs">VITE_APP_ACCESS_KEY</code>-muuttujaan, ei tietokantaan.</li>
          <li>Avaimen vaihto: päivitä <code className="font-mono text-xs">VITE_APP_ACCESS_KEY</code> ympäristöösi ja julkaise uudelleen.</li>
        </ul>
      </div>

      {/* Kieli */}
      <div className="surface-card p-6 space-y-2 border-accent/30">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-accent" />
          <h3 className="font-display text-lg font-semibold">Sisällön kieli</h3>
        </div>
        <p className="text-sm">
          <span className="text-foreground font-medium">Kaikki AI:n luoma sisältö tuotetaan oletuksena suomeksi.</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Tämä koskee päiväbriefingejä, AI-uutisten yhteenvetoja, kokeita, kokeiden arvioita, Telegram-viestejä, somehavaintojen analyysejä, päiväkirjaehdotuksia ja muuta automaatioiden tuottamaa sisältöä.
        </p>
      </div>

      {/* Profiili */}
      <div className="surface-card p-6 space-y-4">
        <h3 className="font-display text-lg font-semibold">Profiili</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Näyttönimi"><Input value={v.display_name || ""} onChange={(e) => update({ display_name: e.target.value })} /></F>
          <F label="Painopistealueet (pilkulla)"><Input value={arrayToCsv(v.focus_areas)} onChange={(e) => update({ focus_areas: csvToArray(e.target.value) })} /></F>
        </div>
        <F label="Bio"><Textarea rows={3} value={v.bio || ""} onChange={(e) => update({ bio: e.target.value })} /></F>
      </div>

      {/* Integraatiot */}
      <div className="surface-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> Integraatiot
            </h3>
            <p className="text-sm text-muted-foreground">Yhdistä n8n ja Telegram tehostaaksesi päivittäisiä automaatioita.</p>
          </div>
          <Link to="/automation" className="text-xs text-primary hover:underline">Katso automaatioiden lokit →</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* n8n */}
          <div className="surface-card p-5 space-y-3 bg-card/40">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-8 w-8 rounded-md bg-primary/15 text-primary"><Webhook className="h-4 w-4" /></div>
              <div>
                <div className="font-display font-semibold">n8n</div>
                <div className="text-xs text-muted-foreground">Sisääntuleva webhook-osoite työnkuluillesi.</div>
              </div>
            </div>
            <F label="Webhook-osoite">
              <Input
                placeholder="https://oma-n8n.example.com/webhook/ai-growth"
                value={v.n8n_webhook_url || ""}
                onChange={(e) => update({ n8n_webhook_url: e.target.value })}
              />
            </F>
            <p className="text-xs text-muted-foreground">n8n lähettää briefingit, uutiset ja kokeet tähän sovellukseen Supabasen kautta.</p>
          </div>

          {/* Telegram */}
          <div className="surface-card p-5 space-y-3 bg-card/40">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-8 w-8 rounded-md bg-primary/15 text-primary"><Send className="h-4 w-4" /></div>
              <div className="flex-1">
                <div className="font-display font-semibold flex items-center gap-2">
                  Telegram
                  <Badge variant={tgVariant as any} className="text-[10px] uppercase">{TG_LABEL[tgStatus] || tgStatus}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">Vastaanota päiväbriefingit Telegram-keskusteluusi.</div>
              </div>
            </div>
            <F label="Botin tila">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={v.telegram_bot_status || "disconnected"}
                onChange={(e) => update({ telegram_bot_status: e.target.value })}
              >
                <option value="disconnected">Ei yhdistetty</option>
                <option value="pending">Odottaa asetusta</option>
                <option value="connected">Yhdistetty</option>
              </select>
            </F>
            <F label="Chat ID">
              <Input
                placeholder="esim. 123456789"
                value={v.telegram_chat_id || ""}
                onChange={(e) => update({ telegram_chat_id: e.target.value })}
              />
            </F>
          </div>
        </div>

        {/* Aikataulu + kytkimet */}
        <div className="surface-card p-5 space-y-4 bg-card/40">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div className="font-display font-semibold">Päivittäinen automaatio</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <F label="Briefingin lähetysaika">
              <Input
                type="time"
                value={(v.daily_briefing_time || "08:00").toString().slice(0, 5)}
                onChange={(e) => update({ daily_briefing_time: e.target.value })}
              />
            </F>
            <ToggleRow
              icon={<Send className="h-4 w-4" />}
              title="Päivittäinen Telegram-briefing"
              description="Lähetä 5 minuutin briefing Telegramiin."
              checked={!!v.daily_telegram_enabled}
              onChange={(c: boolean) => update({ daily_telegram_enabled: c })}
            />
            <ToggleRow
              icon={<Bot className="h-4 w-4" />}
              title="Päivittäinen kokeen luonti"
              description="Luo päivän AI-koe automaattisesti."
              checked={!!v.daily_experiment_enabled}
              onChange={(c: boolean) => update({ daily_experiment_enabled: c })}
            />
          </div>
        </div>
      </div>

      {/* Automaation dokumentaatio */}
      <div className="surface-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold">Miten n8n toimii tämän OS:n moottorina</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Sovellus on valmiina. Kun yhdistät n8n:n ja Telegramin yllä, ajastetut työnkulut:
        </p>
        <ol className="space-y-2 text-sm">
          {[
            "Keräävät AI-uutisia RSS:stä, X/Twitteristä, Redditistä ja HackerNewsista.",
            "Analysoivat trendejä ja klusteroivat tärkeimmät signaalit.",
            "Luovat 5 minuutin päiväbriefingin (tiivistelmä, kuumat aiheet, miksi tämä on tärkeää).",
            "Generoivat yhden käytännön AI-kokeen painopistealueidesi mukaan.",
            "Lähettävät briefingin ja kokeen Telegram-keskusteluusi.",
            "Tallentavat kaikki tulokset, pisteet ja viestit Supabaseen tarkasteltavaksi täällä.",
          ].map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid place-items-center h-6 w-6 rounded-md bg-primary/15 text-primary text-xs font-semibold shrink-0">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-xs text-foreground/90">
          <span className="font-semibold">Kieliohje n8n:lle:</span> All n8n-generated content must be written in Finnish unless explicitly changed later. Tämä koskee uutiskeräystä, briefingejä, kokeita, Telegram-viestejä, kokeiden arviointia ja somehavaintojen analyysejä.
        </div>
        <div className="text-xs text-muted-foreground pt-1">
          Jokainen suoritus kirjautuu kohtaan <Link to="/automation" className="text-primary hover:underline">Automaatioiden lokit</Link>.
        </div>
      </div>

      {/* Muut */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard icon={<KeyRound className="h-4 w-4" />} title="API-integraatiot" description="OpenAI / Anthropic / Perplexity -avaimet (tallennetaan Supabase-salaisuuksiksi myöhemmin)">
          <Input placeholder="OPENAI_API_KEY" disabled />
          <Input placeholder="ANTHROPIC_API_KEY" disabled />
        </PlaceholderCard>
        <PlaceholderCard icon={<Download className="h-4 w-4" />} title="Vie data" description="Lataa kaikki datasi JSON-muodossa.">
          <Button variant="outline" onClick={exportAll}><Download className="h-4 w-4 mr-1" />Vie kaikki</Button>
        </PlaceholderCard>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({ icon, title, description, checked, onChange }: any) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border/50 p-3">
      <div className="flex gap-2 min-w-0">
        <div className="grid place-items-center h-7 w-7 rounded-md bg-primary/15 text-primary shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PlaceholderCard({ icon, title, description, children }: any) {
  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="grid place-items-center h-8 w-8 rounded-md bg-primary/15 text-primary">{icon}</div>
        <div>
          <div className="font-display font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
