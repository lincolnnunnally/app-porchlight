import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useRentalStore } from "@/lib/rental-store";

const ITEMS: { to: string; label: string; exact?: boolean }[] = [
  { to: "/rent", label: "Homes", exact: true },
  { to: "/rent/apply", label: "Apply" },
  { to: "/rent/leases", label: "Leases" },
  { to: "/rent/payments", label: "Payments" },
  { to: "/rent/work", label: "Work" },
  { to: "/rent/waitlist", label: "Waitlist" },
  { to: "/rent/calendar", label: "Calendar" },
  { to: "/rent/desk", label: "Desk" },
];

export function RentSubnav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const vacant = useRentalStore(
    (s) => s.homes.filter((h) => h.status !== "occupied").length,
  );
  const waiting = useRentalStore(
    (s) =>
      s.waitlist.filter(
        (p) => p.status === "interested" || p.status === "contacted",
      ).length,
  );

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">Rent</p>
        <p className="text-sm text-muted">
          Fair rent, not market max. {vacant} home{vacant === 1 ? "" : "s"}{" "}
          turning or vacant. {waiting} neighbor{waiting === 1 ? "" : "s"} waiting
          on a light.
        </p>
      </div>
      <nav
        aria-label="Rent"
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
