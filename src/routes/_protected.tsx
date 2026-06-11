import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { isAuthed } from "@/lib/auth";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="grid-bg flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/60 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="font-display text-sm text-muted-foreground">
              <span className="text-foreground/80">AI Growth OS</span> · v0.1
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hae…</span>
                <kbd className="hidden sm:inline rounded border border-border bg-background px-1 text-[10px]">⌘K</kbd>
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] shadow-[0_0_8px_var(--success)]" />
                Järjestelmät kunnossa
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}

function ProtectedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/login", replace: true });
    } else {
      setReady(true);
    }
  }, [navigate]);

  return (
    <Shell>
      {ready ? (
        <Suspense fallback={<div className="text-sm text-muted-foreground">Ladataan…</div>}>
          <Outlet />
        </Suspense>
      ) : (
        <div className="text-sm text-muted-foreground">Tunnistaudutaan…</div>
      )}
    </Shell>
  );
}
