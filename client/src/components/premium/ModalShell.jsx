import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModalShell({
  open,
  onClose,
  title,
  description,
  children,
  className,
  contentClassName
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] p-3 md:p-6">
      <div
        className="absolute inset-0 bg-[#05070a]/76 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative mx-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(11,13,16,0.96)] text-[#f5f7fa] shadow-[0_30px_120px_rgba(0,0,0,0.52)] md:max-h-[calc(100vh-3rem)]",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 md:px-6">
          <div className="space-y-1">
            {title ? (
              <h2 className="font-display text-xl font-semibold tracking-[-0.04em] text-[#f5f7fa] md:text-2xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm text-[#b7c0cc]">{description}</p>
            ) : null}
          </div>
          <Button type="button" variant="icon" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("overflow-y-auto px-5 py-5 md:px-6 md:py-6", contentClassName)}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
