import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness,
  Compass,
  FileBadge2,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  UserRound
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { CommandPalette } from "@/components/premium/CommandPalette";
import { MobileDrawerNav } from "@/components/premium/MobileDrawerNav";
import NotificationBell from "@/components/notifications/NotificationBell";
import PushPermissionBanner from "@/components/notifications/PushPermissionBanner";

const links = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, caption: "Overview" },
  { to: "/student/internships", label: "My Internship", icon: Compass, caption: "Explore" },
  { to: "/student/jobs", label: "Projects", icon: BriefcaseBusiness, caption: "Career" },
  { to: "/student/applications", label: "Tasks & Progress", icon: FolderKanban, caption: "Track" },
  { to: "/student/certificates", label: "Certificates", icon: FileBadge2, caption: "Registry" },
  { to: "/student/profile", label: "Profile", icon: UserRound, caption: "Identity" },
  { to: "/student/profile/edit", label: "Settings", icon: Settings, caption: "Account" }
];

export function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const dashboardHomePath = "/student";

  const paletteItems = [
    ...links.map((link) => ({
      group: "Student workspace",
      label: link.label,
      description: `Open ${link.label.toLowerCase()}.`,
      to: link.to
    })),
    {
      group: "Account",
      label: "Logout",
      description: "Sign out from the student portal.",
      action: logout
    }
  ];

  return (
    <div className="navyan-shell min-h-screen">
      <div className="mx-auto flex max-w-[1500px] gap-5 px-3 py-3 md:px-5 md:py-5">
        <aside className="navyan-panel sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[292px] shrink-0 flex-col overflow-hidden bg-[color:var(--sidebar)] text-[color:var(--text)] lg:flex">
          <div className="border-b border-[color:var(--border)] px-5 py-5">
            <Link to={dashboardHomePath}>
              <BrandLogo imageClassName="h-10" />
            </Link>
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)] font-semibold">Student Workspace</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-[10px] border border-transparent px-3.5 py-2.5 text-sm font-medium text-[color:var(--text-secondary)] transition hover:border-[color:var(--border)] hover:bg-primary/5 hover:text-[color:var(--text)]",
                    isActive && "border-primary/20 bg-primary/10 text-primary"
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                <div>
                  <p>{link.label}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {link.caption}
                  </p>
                </div>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-[color:var(--border)] p-4">
            <div className="rounded-[12px] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold truncate text-[color:var(--text)]">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)] truncate">{user?.email}</p>
                </div>
                <ThemeToggle variant="ghost" />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-start text-xs h-8 rounded-[8px]" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="navyan-panel sticky top-3 z-40 bg-[color:var(--sidebar)] px-4 py-3 text-[color:var(--text)] md:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="lg:hidden">
                  <MobileDrawerNav
                    title="Student workspace"
                    subtitle={user?.fullName || "Student portal"}
                    links={links}
                    pathname={location.pathname}
                    actions={
                      <>
                        <ThemeToggle variant="outline" />
                        <Button variant="ghost" onClick={logout}>
                          Logout
                        </Button>
                      </>
                    }
                  />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-[color:var(--text)]">
                    Student portal
                  </p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    Track your internship lifecycle, documents, and achievements.
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <CommandPalette items={paletteItems} title="Jump to anything" />
                <ThemeToggle variant="outline" />
                <NotificationBell />
                <Button variant="icon" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <main className="navyan-panel min-h-[calc(100vh-7rem)] px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
          <PushPermissionBanner user={user} />
        </div>
      </div>
    </div>
  );
}
