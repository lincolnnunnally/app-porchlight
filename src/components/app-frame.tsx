import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Lantern } from "./lantern";
import { useHuntStore } from "@/lib/hunt-store";
import { useLegalStore } from "@/lib/legal-store";
import { useRentalStore } from "@/lib/rental-store";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/", label: "Home", exact: true },
  { to: "/hunt", label: "Hunt" },
  { to: "/houses", label: "Houses" },
  { to: "/letters", label: "Letters" },
  { to: "/search", label: "Search" },
  { to: "/protect", label: "Stewardship" },
  { to: "/attorney", label: "Attorney" },
  { to: "/rent", label: "Rentals" },
  { to: "/owners", label: "Owners" },
  { to: "/dash", label: "Desk" },
  { to: "/connect", label: "Connectors" },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useHuntStore.persist.rehydrate();
    void useStewardStore.persist.rehydrate();
    void useLegalStore.persist.rehydrate();
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
            <Link to="/" className="flex items-center gap-3 text-ink no-underline">
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
            className="-mx-1 flex gap-2 overflow-x-auto pb-1"
          >
            {NAV.map((item) => {
              const current = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm no-underline transition-colors duration-fast",
                    current
                      ? "border-gold bg-gold font-semibold text-night"
                      : "border-line text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-line">
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
