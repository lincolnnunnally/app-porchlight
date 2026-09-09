import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useStewardStore } from "@/lib/steward-store";

const ITEMS: { to: string; label: string; exact?: boolean }[] = [
  { to: "/protect", label: "How it works", exact: true },
  { to: "/protect/quiz", label: "Season" },
  { to: "/protect/intake", label: "Facts" },
  { to: "/protect/fees", label: "Fees" },
  { to: "/protect/packet", label: "Packet" },
  { to: "/attorney", label: "Attorney" },
  { to: "/protect/dashboard", label: "After filing" },
];

export function ProtectSubnav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const season = useStewardStore((s) => s.season);

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          Home stewardship
        </p>
        <p className="text-sm text-muted">
          {season === "crisis"
            ? "Crisis season — no transfer packet."
            : season === "planning"
              ? "Planning season — attorney stays in the loop."
              : season === "connector"
                ? "Connector — refer, don’t sell."
                : "Take the season quiz before any paperwork."}
        </p>
      </div>
      <nav
        aria-label="Keep"
        className="-mx-1 flex gap-2 overflow-x-auto pb-1"
      >
        {ITEMS.map((item) => {
          const current = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={current ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-2 text-sm no-underline",
                current
                  ? "border-teal bg-teal font-semibold text-night"
                  : "border-line text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
