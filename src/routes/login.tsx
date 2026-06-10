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
      toast.success("Welcome back");
      navigate({ to: "/" });
      return;
    }
    switch (result.reason) {
      case "email":
        toast.error("Access denied. This app is restricted to the owner.");
        break;
      case "key":
        toast.error("Invalid private access key.");
        break;
      case "password":
        toast.error("Invalid password.");
        break;
      case "config":
        toast.error("Auth not configured. Set VITE_ALLOWED_USER_EMAIL, VITE_APP_PASSWORD and VITE_APP_ACCESS_KEY.");
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
            <h1 className="text-2xl font-bold text-gradient">Private AI Growth OS</h1>
            <p className="text-xs text-muted-foreground">Access restricted to the owner only.</p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            Registration is disabled. Only <span className="text-foreground font-medium">{allowed || "the owner"}</span> can sign in.
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="accessKey">Private access key</Label>
          <Input
            id="accessKey"
            type="password"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="Paste private access key"
            autoComplete="off"
            required
          />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Stored in <code className="font-mono">VITE_APP_ACCESS_KEY</code>. Never share it.
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Enter command center
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          This is a private one-user system. Public sign-up is disabled.
        </p>
      </form>
    </div>
  );
}
