import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Drawer } from "vaul";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileDrawerNav({
  title,
  subtitle,
  links,
  pathname,
  actions
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} shouldScaleBackground>
      <Drawer.Trigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-sm dark:bg-[#06080b]/70" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[90] mx-auto max-w-2xl rounded-t-[28px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4 text-[color:var(--text)] shadow-[0_-20px_60px_rgba(15,23,42,0.2)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[color:var(--border)]" />
          <div className="mb-4">
            <Drawer.Title className="font-display text-xl font-semibold">{title}</Drawer.Title>
            {subtitle ? (
              <Drawer.Description className="mt-1 text-sm text-[color:var(--text-muted)]">
                {subtitle}
              </Drawer.Description>
            ) : null}
          </div>
          <div className="space-y-2">
            {links.map((link) => (
              <Drawer.Close asChild key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-[color:var(--border)] px-4 py-3 text-sm font-medium text-[color:var(--text-secondary)] transition hover:border-primary/25 hover:bg-primary/10 hover:text-[color:var(--text)]",
                    pathname === link.to && "border-primary/28 bg-primary/10 text-primary"
                  )}
                >
                  <span>{link.label}</span>
                  {link.caption ? (
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                      {link.caption}
                    </span>
                  ) : null}
                </Link>
              </Drawer.Close>
            ))}
          </div>
          {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
