import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  Briefcase,
  ChevronLeft,
  ClipboardList,

  FileText,
  FolderTree,
  Gauge,
  HardDrive,
  Image,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  Shield,
  Users,
  UserSquare2,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/site/theme-toggle";
import {
  adminSessionQueryOptions,
  adminMessagesQuery,
  adminProductsQuery,
  adminBlogQuery,
  logActivity,
} from "@/lib/admin/api";
import { can, highestRole, ROLE_LABELS, type ModuleKey } from "@/lib/admin/rbac";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const NAV: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; module: ModuleKey }[] = [
  { to: "/admin", label: "Dashboard", icon: Gauge, module: "dashboard" },
  { to: "/admin/products", label: "Products", icon: Package, module: "products" },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, module: "categories" },
  { to: "/admin/blog", label: "Blog", icon: FileText, module: "blog" },
  { to: "/admin/media", label: "Media Library", icon: Image, module: "media" },
  { to: "/admin/team", label: "Team", icon: UserSquare2, module: "team" },
  { to: "/admin/careers", label: "Careers", icon: Briefcase, module: "careers" },
  { to: "/admin/messages", label: "Messages", icon: Mail, module: "messages" },
  { to: "/admin/subscribers", label: "Subscribers", icon: Users, module: "subscribers" },
  { to: "/admin/waitlist", label: "Waitlist", icon: ClipboardList, module: "waitlist" },

  { to: "/admin/analytics", label: "Analytics", icon: LayoutGrid, module: "analytics" },
  { to: "/admin/admins", label: "Administrators", icon: Shield, module: "admins" },
  { to: "/admin/users", label: "Site Users", icon: Users, module: "admins" },
  { to: "/admin/settings", label: "Settings", icon: Settings, module: "settings" },
  { to: "/admin/activity", label: "Activity Logs", icon: Activity, module: "activity" },
  { to: "/admin/backup", label: "Backup", icon: HardDrive, module: "backup" },
  { to: "/admin/security", label: "Security", icon: Shield, module: "security" },
];

const IDLE_LIMIT_MS = 30 * 60 * 1000;

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session } = useQuery(adminSessionQueryOptions);
  const roles = session?.roles ?? [];

  const nav = useMemo(() => NAV.filter((item) => can(roles, item.module)), [roles]);

  async function signOut() {
    await logActivity({ action: "Signed out", module: "auth" });
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  // Session timeout after inactivity
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void supabase.auth.signOut().then(() => navigate({ to: "/admin/login", replace: true }));
      }, IDLE_LIMIT_MS);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [navigate]);

  // Keyboard shortcut for global search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const crumbs = pathname.split("/").filter(Boolean);
  const initials = (session?.profile?.full_name || session?.email || "A")
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl transition-all duration-300 lg:static",
          collapsed ? "w-[76px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
            A
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">Aevon Admin</p>
              <p className="truncate text-[11px] text-muted-foreground">Control Center</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/60 p-3">
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
          <button
            type="button"
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Collapse sidebar"
            className="hidden h-9 w-9 place-items-center rounded-lg hover:bg-muted lg:grid"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
            {crumbs.map((c, i) => (
              <span key={c + i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground">/</span>}
                <span className={cn("capitalize", i === crumbs.length - 1 ? "text-foreground" : "text-muted-foreground")}>
                  {c}
                </span>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition hover:bg-muted"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search…</span>
              <kbd className="hidden rounded bg-background px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
            </button>

            <NotificationsMenu />
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground"
                  aria-label="Account menu"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate text-sm">{session?.profile?.full_name || session?.email}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {highestRole(roles) ? ROLE_LABELS[highestRole(roles)!] : "No role"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/profile">My profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/security">Security</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function NotificationsMenu() {
  const { data: messages = [] } = useQuery(adminMessagesQuery);
  const unread = messages.filter((m) => m.status === "new");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {unread.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
        ) : (
          unread.slice(0, 6).map((m) => (
            <DropdownMenuItem key={m.id} asChild>
              <Link to="/admin/messages" className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">New message from {m.name}</span>
                <span className="line-clamp-1 text-xs text-muted-foreground">{m.subject || m.message}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { data: products = [] } = useQuery({ ...adminProductsQuery, enabled: open });
  const { data: posts = [] } = useQuery({ ...adminBlogQuery, enabled: open });
  const { data: messages = [] } = useQuery({ ...adminMessagesQuery, enabled: open });

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search products, posts, messages, pages…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {NAV.map((n) => (
            <CommandItem key={n.to} value={n.label} onSelect={() => go(n.to)}>
              <n.icon className="mr-2 h-4 w-4" />
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {products.length > 0 && (
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem key={p.id} value={`product ${p.name}`} onSelect={() => go("/admin/products")}>
                <Package className="mr-2 h-4 w-4" />
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {posts.length > 0 && (
          <CommandGroup heading="Blog">
            {posts.map((p) => (
              <CommandItem key={p.id} value={`post ${p.title}`} onSelect={() => go("/admin/blog")}>
                <FileText className="mr-2 h-4 w-4" />
                {p.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {messages.length > 0 && (
          <CommandGroup heading="Messages">
            {messages.slice(0, 8).map((m) => (
              <CommandItem key={m.id} value={`message ${m.name} ${m.email}`} onSelect={() => go("/admin/messages")}>
                <Mail className="mr-2 h-4 w-4" />
                {m.name} — {m.subject || "No subject"}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
