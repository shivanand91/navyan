import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { Search, CornerDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommandPalette({ items, title = "Search actions", className }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.group || "General";
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  const handleSelect = (item) => {
    setOpen(false);
    if (item.action) {
      item.action();
      return;
    }
    if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2 rounded-2xl", className)}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        {title}
        <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-[#7e8794]">
          Ctrl K
        </span>
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[90] bg-[#06080b]/80 backdrop-blur-sm">
          <div className="mx-auto flex min-h-screen max-w-2xl items-start px-4 pt-24">
            <Command
              label="Command Palette"
              className="navyan-panel w-full overflow-hidden border border-white/10 bg-[#101419]/95 text-[#f5f7fa]"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search className="h-4 w-4 text-[#7e8794]" />
                <Command.Input
                  autoFocus
                  placeholder="Search pages, workflows, and actions..."
                  className="h-10 w-full bg-transparent text-sm text-[#f5f7fa] outline-none placeholder:text-[#7e8794]"
                />
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto p-3">
                <Command.Empty className="px-3 py-8 text-center text-sm text-[#7e8794]">
                  No matching action.
                </Command.Empty>
                {Object.entries(grouped).map(([group, entries]) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="mb-4 overflow-hidden text-[11px] uppercase tracking-[0.18em] text-[#7e8794]"
                  >
                    <div className="mt-2 space-y-1">
                      {entries.map((item) => (
                        <Command.Item
                          key={`${group}-${item.label}`}
                          value={`${group} ${item.label} ${item.description || ""}`}
                          onSelect={() => handleSelect(item)}
                          className="flex cursor-pointer items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-left transition data-[selected=true]:border-primary/25 data-[selected=true]:bg-primary/10"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#f5f7fa]">{item.label}</p>
                            {item.description ? (
                              <p className="mt-1 text-xs text-[#7e8794]">{item.description}</p>
                            ) : null}
                          </div>
                          <CornerDownLeft className="h-4 w-4 text-[#7e8794]" />
                        </Command.Item>
                      ))}
                    </div>
                  </Command.Group>
                ))}
              </Command.List>
            </Command>
          </div>
        </div>
      ) : null}
    </>
  );
}
