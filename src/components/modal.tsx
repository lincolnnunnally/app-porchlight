import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape closes; focus lands in the dialog and returns to the opener after.
  // Only `open` drives this so an inline onClose does not re-run it each render.
  useEffect(() => {
    if (!open) return;
    const opener =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const first = dialogRef.current?.querySelector<HTMLElement>(
      "input, select, textarea, button, a[href]",
    );
    (first ?? dialogRef.current)?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-night/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl border border-line bg-bg-2 p-5 shadow-[var(--shadow-soft)] outline-none"
      >
        {children}
      </div>
    </div>
  );
}
