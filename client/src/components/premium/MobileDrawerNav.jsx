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
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-[#06080b]/70 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[90] mx-auto max-w-2xl rounded-t-[28px] border border-white/10 bg-[#0f1318]/98 p-4 text-[#f5f7fa] shadow-[0_-20px_60px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/10" />
          <div className="mb-4">
            <Drawer.Title className="font-display text-xl font-semibold">{title}</Drawer.Title>
            {subtitle ? (
              <Drawer.Description className="mt-1 text-sm text-[#7e8794]">
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
                    "flex items-center justify-between rounded-2xl border border-white/8 px-4 py-3 text-sm font-medium text-[#b7c0cc] transition hover:border-primary/25 hover:bg-primary/10 hover:text-[#f5f7fa]",
                    pathname === link.to && "border-primary/28 bg-primary/10 text-primary"
                  )}
                >
                  <span>{link.label}</span>
                  {link.caption ? (
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#7e8794]">
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
