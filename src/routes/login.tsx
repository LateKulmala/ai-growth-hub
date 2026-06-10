import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (login(pw)) {
      navigate({ to: "/" });
    } else {
      toast.error("Access denied");
    }
  }

  return (
    <div className="grid-bg flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="surface-card w-full max-w-md p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">AI Growth OS</h1>
            <p className="text-xs text-muted-foreground">Private command center</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Access key</Label>
          <Input
            id="password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter access key"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Default: <code className="font-mono">ai-growth</code> — change via <code>VITE_APP_PASSWORD</code>.
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Initialize session
        </Button>
      </form>
    </div>
  );
}
