import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Bot,
  Newspaper,
  FlaskConical,
  Radio,
  MessagesSquare,
  BookOpen,
  LineChart,
  Settings,
  LogOut,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth";

const sections = [
  {
    label: "Command",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Portfolio", url: "/portfolio", icon: User },
    ],
  },
  {
    label: "Build",
    items: [
      { title: "Projects", url: "/projects", icon: FolderKanban },
      { title: "Agents", url: "/agents", icon: Bot },
      { title: "Experiments", url: "/experiments", icon: FlaskConical },
    ],
  },
  {
    label: "Intel",
    items: [
      { title: "Briefings", url: "/briefings", icon: Newspaper },
      { title: "News & Trends", url: "/news", icon: Radio },
      { title: "Social Insights", url: "/social", icon: MessagesSquare },
    ],
  },
  {
    label: "Reflect",
    items: [
      { title: "Journal", url: "/journal", icon: BookOpen },
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "Automation", url: "/automation", icon: Zap },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)] shrink-0">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-gradient truncate">AI Growth OS</div>
              <div className="text-[10px] text-muted-foreground truncate">Command Center</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
