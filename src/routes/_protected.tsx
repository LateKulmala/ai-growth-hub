import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { isAuthed } from "@/lib/auth";

export const Route = createFileRoute("/_protected")({
  ssr: false,
  component: ProtectedLayout,
});

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

  if (!ready) return null;

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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)] shadow-[0_0_8px_var(--success)]" />
                Systems nominal
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
