import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ListingShare } from "./listing-share";
import { Button, buttonVariants } from "./ui/button";
import { vacancyNudges, type Nudge } from "@/lib/nudge";
import { useRentalStore } from "@/lib/rental-store";
import { cn } from "@/lib/utils";

/**
 * A dark house costs somebody a home. Says how long, who fits, and the next
 * honest step. Reads the same homes, leases and waitlist everything else does.
 */
export function VacancyNudges({ limit }: { limit?: number }) {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const waitlist = useRentalStore((s) => s.waitlist);
  const setListing = useRentalStore((s) => s.setListing);
  const nudges = useMemo(
    () => vacancyNudges({ homes, leases, waitlist }),
    [homes, leases, waitlist],
  );
  const shown = limit ? nudges.slice(0, limit) : nudges;
  if (shown.length === 0) return null;

  return (
    <section className="grid gap-3" aria-label="Vacancy nudges">
      <h2 className="font-display text-xl">Lights that need attention</h2>
      {shown.map((n) => {
        const home = homes.find((h) => h.id === n.homeId);
        return (
          <article
            key={n.id}
            className={cn(
              "grid gap-2 rounded-lg border bg-panel p-4",
              n.urgency === "now" ? "border-gold/60" : "border-line",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-display text-lg leading-snug">{n.headline}</p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs tracking-wide uppercase",
                  n.urgency === "now"
                    ? "border-gold/50 text-gold-2"
                    : "border-line text-muted",
                )}
              >
                {urgencyLabel(n)}
              </span>
            </div>
            <p className="text-sm text-muted">{n.detail}</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/rent/waitlist"
                className={cn(buttonVariants({ variant: "teal", size: "sm" }), "no-underline")}
              >
                {n.fits ? `Call the ${n.fits} who fit` : "Open the waitlist"}
              </Link>
              <Link
                to="/place/$placeId"
                params={{ placeId: n.homeId }}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "no-underline")}
              >
                Open the house
              </Link>
              {n.kind === "dark" && home ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setListing(home.id, "available")}
                >
                  Turn the light on
                </Button>
              ) : null}
              {n.kind === "lease_ending" ? (
                <Link
                  to="/rent/leases"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "no-underline")}
                >
                  Open the lease
                </Link>
              ) : null}
              {home && n.kind !== "lease_ending" ? <ListingShare home={home} compact /> : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function urgencyLabel(n: Nudge) {
  if (n.kind === "lease_ending") return n.days <= 14 ? "talk this week" : "talk early";
  if (n.urgency === "now") return "call now";
  return "soon";
}
