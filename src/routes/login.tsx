import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, getAllowedEmail } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(email, password, accessKey);
    if (result.ok) {
      toast.success("Tervetuloa takaisin");
      navigate({ to: "/" });
      return;
    }
    switch (result.reason) {
      case "email":
        toast.error("Pääsy estetty. Sovellus on rajattu vain omistajalle.");
        break;
      case "key":
        toast.error("Virheellinen yksityinen pääsyavain.");
        break;
      case "password":
        toast.error("Virheellinen salasana.");
        break;
      case "config":
        toast.error("Tunnistautumista ei ole määritetty. Aseta VITE_ALLOWED_USER_EMAIL, VITE_APP_PASSWORD ja VITE_APP_ACCESS_KEY.");
        break;
    }
  }

  const allowed = getAllowedEmail();

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="surface-card w-full max-w-md p-8 space-y-6"
        autoComplete="off"
      >
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Yksityinen AI Growth OS</h1>
            <p className="text-xs text-muted-foreground">Pääsy rajattu vain omistajalle.</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            Rekisteröinti on poistettu käytöstä. Vain <span className="text-foreground font-medium">{allowed || "omistaja"}</span> voi kirjautua sisään.
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Sähköposti</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sinun@osoite.fi"
            autoComplete="email"
            autoFocus
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Salasana</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessKey">Yksityinen pääsyavain</Label>
          <Input
            id="accessKey"
            type="password"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="Liitä yksityinen pääsyavain"
            autoComplete="off"
            required
          />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Tallennettu ympäristömuuttujaan <code className="font-mono">VITE_APP_ACCESS_KEY</code>. Älä jaa sitä koskaan.
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Siirry ohjauskeskukseen
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          Tämä on yksityinen yhden käyttäjän järjestelmä. Julkinen rekisteröinti on poistettu käytöstä.
        </p>
      </form>
    </div>
  );
}
