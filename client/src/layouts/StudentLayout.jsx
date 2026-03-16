import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Compass, FileBadge2, FolderKanban, LayoutDashboard, Search, Settings2, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { CommandPalette } from "@/components/premium/CommandPalette";
import { MobileDrawerNav } from "@/components/premium/MobileDrawerNav";

const links = [
  { to: "/student", label: "Overview", icon: LayoutDashboard, caption: "Home" },
  { to: "/student/internships", label: "Internships", icon: Compass, caption: "Apply" },
  { to: "/student/applications", label: "My Applications", icon: FolderKanban, caption: "Track" },
  { to: "/student/certificates", label: "Certificates", icon: FileBadge2, caption: "Proof" },
  { to: "/student/profile", label: "Profile", icon: UserRound, caption: "Identity" },
  { to: "/student/profile/edit", label: "Edit Profile", icon: Settings2, caption: "Update" }
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
        <aside className="navyan-panel sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[292px] shrink-0 flex-col overflow-hidden bg-[#0f1318]/92 text-[#f5f7fa] lg:flex">
          <div className="border-b border-white/8 px-5 py-5">
            <Link to={dashboardHomePath}>
              <BrandLogo imageClassName="h-12 md:h-14" />
            </Link>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#7e8794]">Student Workspace</p>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-3 text-sm font-medium text-[#b7c0cc] transition hover:border-white/8 hover:bg-white/5 hover:text-[#f5f7fa]",
                    isActive && "border-primary/20 bg-primary/10 text-primary"
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                <div>
                  <p>{link.label}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#7e8794]">
                    {link.caption}
                  </p>
                </div>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/8 p-4">
            <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold text-[#f5f7fa]">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-[#7e8794]">{user?.email}</p>
                </div>
                <ThemeToggle variant="ghost" />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="navyan-panel sticky top-3 z-40 bg-[#0f1318]/86 px-4 py-3 text-[#f5f7fa] md:px-5">
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
                  <p className="font-display text-lg font-semibold text-[#f5f7fa] md:text-xl">
                    Student portal
                  </p>
                  <p className="text-xs text-[#7e8794]">
                    Track your internship lifecycle, documents, and achievements.
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <CommandPalette items={paletteItems} title="Jump to anything" />
                <ThemeToggle variant="outline" />
                <Button variant="icon" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <main className="navyan-panel min-h-[calc(100vh-7rem)] px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
