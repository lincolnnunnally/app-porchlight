import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { Lantern } from "./lantern";
import { useHuntStore } from "@/lib/hunt-store";
import { useLegalStore } from "@/lib/legal-store";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

type Door = { to: string; label: string };

const PRIMARY: Door[] = [
  { to: "/hunt", label: "Hunt" },
  { to: "/protect", label: "Keep" },
  { to: "/rent", label: "Rent" },
];

const MORE_SECTIONS: { heading: string; items: Door[] }[] = [
  {
    heading: "Find",
    items: [
      { to: "/houses", label: "Houses" },
      { to: "/search", label: "Search" },
    ],
  },
  {
    heading: "Keep",
    items: [
      { to: "/letters", label: "Letters" },
      { to: "/attorney", label: "Attorney" },
    ],
  },
  {
    heading: "Operate",
    items: [
      { to: "/owners", label: "Owners" },
      { to: "/dash", label: "Desk" },
      { to: "/connect", label: "Connectors" },
    ],
  },
];

const MORE_DOORS = MORE_SECTIONS.flatMap((section) => section.items);

function doorCurrent(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

function moreCurrent(pathname: string) {
  return MORE_DOORS.some((item) => doorCurrent(pathname, item.to));
}

function pillClass(current: boolean, className?: string) {
  return cn(
    "shrink-0 rounded-full border px-4 py-2 text-sm no-underline transition-colors duration-fast",
    current
      ? "border-gold bg-gold font-semibold text-night"
      : "border-line text-muted hover:text-ink",
    className,
  );
}

function MoreMenu({
  pathname,
  placement,
}: {
  pathname: string;
  placement: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const active = moreCurrent(pathname) || open;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [
        buttonRef.current,
        ...panelRef.current.querySelectorAll<HTMLElement>("a[href], button"),
      ].filter((el): el is HTMLElement => Boolean(el));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="menu"
      aria-label="More doors"
      className={cn(
        "grid gap-4 rounded-xl border border-line bg-bg-2 p-4 shadow-[var(--shadow-soft)]",
        placement === "desktop"
          ? "absolute right-0 top-full z-50 mt-2 w-64"
          : "fixed inset-x-3 bottom-[4.75rem] z-50",
      )}
    >
      {MORE_SECTIONS.map((section) => (
        <div key={section.heading} className="grid gap-2">
          <p className="text-sm tracking-wide text-gold-2 uppercase">
            {section.heading}
          </p>
          <div className="-mx-1 flex flex-wrap gap-2">
            {section.items.map((item) => {
              const current = doorCurrent(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  aria-current={current ? "page" : undefined}
                  className={pillClass(current)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={placement === "mobile" ? "min-w-0 flex-1" : "relative"}
    >
      {open && placement === "mobile" ? (
        <div
          className="fixed inset-0 z-40 bg-night/70"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        aria-label="More doors"
        className={pillClass(
          active,
          placement === "mobile" ? "w-full px-2 text-center" : undefined,
        )}
        onClick={() => setOpen((value) => !value)}
      >
        More
      </button>
      {open ? panel : null}
    </div>
  );
}

function PrimaryPills({
  pathname,
  className,
  compact,
}: {
  pathname: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <>
      {PRIMARY.map((item) => {
        const current = doorCurrent(pathname, item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={current ? "page" : undefined}
            className={pillClass(
              current,
              compact ? "min-w-0 flex-1 px-2 text-center" : undefined,
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useHuntStore.persist.rehydrate();
    void useStewardStore.persist.rehydrate();
    void useLegalStore.persist.rehydrate();
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const homeCurrent = pathname === "/";

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <Link
              to="/"
              aria-label="Porchlight home"
              aria-current={homeCurrent ? "page" : undefined}
              className="flex items-center gap-3 text-ink no-underline"
            >
              <Lantern />
              <span>
                <span className="font-display block text-xl leading-none">
                  Porchlight
                </span>
                <span className="mt-1 block max-w-xs text-sm text-muted">
                  Hunt a house. Keep a home. Rent it fairly.
                </span>
              </span>
            </Link>
          </div>
          <nav
            aria-label="Primary"
            className="-mx-1 hidden gap-2 pb-1 md:flex"
          >
            <PrimaryPills pathname={pathname} />
            <MoreMenu pathname={pathname} placement="desktop" />
          </nav>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-8"
      >
        {children}
      </main>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <PrimaryPills pathname={pathname} compact />
          <MoreMenu pathname={pathname} placement="mobile" />
        </div>
      </nav>
      <footer className="border-t border-line pb-24 md:pb-0">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>People are the purpose. We do not take houses.</p>
          <Link to="/packet" className="text-muted hover:text-gold-2">
            vNext packet
          </Link>
        </div>
      </footer>
    </div>
  );
}
