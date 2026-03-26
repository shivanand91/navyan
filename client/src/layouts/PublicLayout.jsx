import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Github, Instagram, Linkedin, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";
import { MobileDrawerNav } from "@/components/premium/MobileDrawerNav";

const navLinks = [
  { to: "/", label: "Home", caption: "Start" },
  { to: "/internships", label: "Internships", caption: "Talent" },
  { to: "/jobs", label: "Jobs", caption: "Careers" },
  { to: "/services", label: "Services", caption: "Studio" },
  { to: "/verify-certificate", label: "Verify", caption: "Trust" },
  { to: "/about", label: "About", caption: "Brand" },
  { to: "/contact", label: "Contact", caption: "Talk" }
];

const socialLinks = [
  {
    href: "#",
    label: "Instagram",
    icon: Instagram
  },
  {
    href: "https://www.linkedin.com/company/navyan",
    label: "LinkedIn",
    icon: Linkedin
  },
  {
    href: "https://youtu.be/3XBvTJydmFE?si=VxWg2f7zP_OuHyI6",
    label: "YouTube",
    icon: Youtube
  },
  {
    href: "https://example.com/navyan-github",
    label: "X.com",
    icon: X
  }
];

export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="navyan-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 px-3 pt-3 md:px-5 md:pt-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border border-[color:var(--border)] bg-[color:var(--sidebar)] px-4 py-3 text-[color:var(--text)] shadow-[0_20px_60px_rgba(3,5,8,0.18)] backdrop-blur-2xl">
          <Link to="/" className="shrink-0">
            <BrandLogo imageClassName="h-12 md:h-14 lg:h-16" surface="adaptive" />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-black/[0.045] hover:text-[color:var(--text)] dark:hover:bg-white/5",
                  location.pathname === link.to &&
                    "bg-black/[0.055] text-[color:var(--text)] dark:bg-white/6"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle variant="outline" />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle variant="outline" />
            <MobileDrawerNav
              title="Navigate Navyan"
              subtitle="Explore internships, services, and certificate verification."
              links={navLinks}
              pathname={location.pathname}
              actions={
                <>
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button className="w-full">Get started</Button>
                  </Link>
                </>
              }
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[color:var(--bg-secondary)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] md:px-6">
          <div className="space-y-4">
            <BrandLogo imageClassName="h-14 md:h-16" surface="adaptive" />
            <p className="max-w-md text-sm leading-7 text-[color:var(--text-secondary)]">
              Navyan is an AI-era internship and product services platform built for ambitious
              students, freshers, and founders who value clarity, execution, and premium
              experience.
            </p>
          </div>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              Explore
            </p>
            <div className="mt-4 space-y-3">
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-[color:var(--text-secondary)] transition hover:text-[color:var(--text)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              Trust layer
            </p>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--text-secondary)]">
              <p>Structured internships</p>
              <p>Public certificate verification</p>
              <p>Product studio for startups</p>
              <p>Built in India, designed globally</p>
            </div>
          </div>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
              Follow us
            </p>
            <div className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-black/8 bg-black/[0.025] px-3 py-3 text-sm text-[color:var(--text-secondary)] transition hover:border-primary/20 hover:bg-primary/10 hover:text-[color:var(--text)] dark:border-white/8 dark:bg-white/5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-black/8 bg-white/70 text-[color:var(--text)] transition group-hover:border-primary/20 group-hover:text-primary dark:border-white/8 dark:bg-[#0f1318]">
                    <link.icon className="h-4 w-4" />
                  </span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[color:var(--border)] px-4 py-4 text-center text-xs text-[color:var(--text-muted)]">
          © {new Date().getFullYear()} Navyan. Premium internship workflows and digital product
          execution.
        </div>
      </footer>
    </div>
  );
}
