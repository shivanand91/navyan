import { useEffect, useId, useRef } from "react";
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
  contentClassName,
  constrainToViewport = false
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const focusFirst = () => {
      const closeButton = dialogRef.current?.querySelector("button");
      if (closeButton) closeButton.focus();
      else dialogRef.current?.focus();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        const items = [...(focusable || [])].filter((item) => item.getAttribute("aria-hidden") !== "true");
        if (!items.length) {
          event.preventDefault();
          dialogRef.current?.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(focusFirst);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6">
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-md dark:bg-[#05070a]/76"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative mx-auto flex min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card-elevated)] text-[color:var(--text)] shadow-[0_30px_120px_rgba(15,23,42,0.24)] dark:shadow-[0_30px_120px_rgba(0,0,0,0.52)]",
          constrainToViewport
            ? "h-[calc(100vh-1.5rem)] md:h-[calc(100vh-3rem)]"
            : "max-h-[calc(100vh-1.5rem)] md:max-h-[calc(100vh-3rem)]",
          className
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[color:var(--border)] px-5 py-4 md:px-6">
          <div className="space-y-1">
            {title ? (
              <h2 id={titleId} className="font-display text-xl font-semibold tracking-[-0.04em] text-[color:var(--text)] md:text-2xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-sm text-[color:var(--text-secondary)]">{description}</p>
            ) : null}
          </div>
          <Button type="button" variant="icon" size="icon" onClick={onClose} aria-label="Close dialog" className="shrink-0">
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
