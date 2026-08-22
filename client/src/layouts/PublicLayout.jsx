import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Linkedin, Youtube, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { MobileDrawerNav } from "@/components/premium/MobileDrawerNav";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { to: "/", label: "Home", caption: "Start" },
  { to: "/internships", label: "Internships", caption: "Apply" },
  { to: "/courses", label: "Courses", caption: "Learn" },
  { to: "/services", label: "Services", caption: "Build" },
  { to: "/about", label: "About Us", caption: "Story" },
  { to: "/contact", label: "Contact", caption: "Talk" }
];

export function PublicLayout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="navyan-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 h-[72px] w-full border-b border-border/80 bg-background/80 backdrop-blur-md px-4 md:px-8">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
          <Link to="/" className="shrink-0">
            <BrandLogo imageClassName="h-8 md:h-9 lg:h-10" surface="adaptive" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-200",
                  location.pathname === link.to
                    ? "text-primary font-semibold bg-primary-soft/50"
                    : "text-textSecondary hover:text-primary hover:bg-backgroundSecondary/50"
                )}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle variant="outline" />
            <Link to="/verify-certificate">
              <Button variant="outline" size="sm">
                Verify Certificate
              </Button>
            </Link>
            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/student"}>
                <Button size="sm">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/internships">
                  <Button variant="accent" size="sm">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle variant="outline" />
            <MobileDrawerNav
              title="Navigate Navyan"
              subtitle="Explore internships, services, and certificate verification."
              links={navLinks}
              pathname={location.pathname}
              actions={
                user ? (
                  <Link to={user.role === "admin" ? "/admin" : "/student"} className="w-full">
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Log in
                      </Button>
                    </Link>
                    <Link to="/internships" className="flex-1">
                      <Button variant="accent" className="w-full">Apply Now</Button>
                    </Link>
                  </>
                )
              }
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-backgroundSecondary dark:bg-[#0F0F14] text-textSecondary dark:text-[#FAF9FB] py-12 md:py-16 transition-colors duration-200">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:px-8">
          <div className="space-y-4">
            <BrandLogo imageClassName="h-8 md:h-9" surface="adaptive" />
            <p className="text-sm leading-7 text-textSecondary/80 dark:text-white/60">
              Internships & IT Services.
              <br />
              outcome-driven learning and digital studio execution.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-medium uppercase tracking-[0.12em] text-textMuted dark:text-white/40">
              Explore
            </h4>
            <div className="mt-4 space-y-3">
              <Link to="/internships" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                Internships
              </Link>
              <Link to="/courses" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                Courses
              </Link>
              <Link to="/services" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                Services
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-medium uppercase tracking-[0.12em] text-textMuted dark:text-white/40">
              Company
            </h4>
            <div className="mt-4 space-y-3">
              <Link to="/about" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                About Us
              </Link>
              <Link to="/jobs" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                Career
              </Link>
              <Link to="/contact" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                Contact
              </Link>
              <Link to="/verify-certificate" className="block text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition">
                Verify Certificate
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-medium uppercase tracking-[0.12em] text-textMuted dark:text-white/40">
              Connect
            </h4>
            <div className="mt-4 space-y-3">
              <a
                href="https://www.linkedin.com/company/navyan"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition"
              >
                <Youtube className="h-4 w-4" />
                <span>YouTube</span>
              </a>
              <a
                href="mailto:navyanintern@gmail.com"
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary dark:text-white/70 dark:hover:text-accent transition"
              >
                <Mail className="h-4 w-4" />
                <span>navyanintern@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl border-t border-border dark:border-white/10 mt-8 pt-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-textMuted dark:text-white/40">
          <p>© {new Date().getFullYear()} Navyan. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-textPrimary dark:hover:text-white transition">Terms of Service</span>
            <span className="cursor-pointer hover:text-textPrimary dark:hover:text-white transition">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
