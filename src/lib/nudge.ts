/**
 * Vacancy nudge: a dark house costs somebody a home. Say how long the light
 * has been off, who is waiting, and what to do next. Reads the same records
 * Homes, Leases and the Waitlist already use.
 */
import { bestFitsFor } from "./match.ts";
import type { Lease, RentalHome, WaitPerson } from "./rental.ts";

const DAY = 1000 * 60 * 60 * 24;

function daysBetween(from: number, to: number) {
  return Math.max(0, Math.floor((to - from) / DAY));
}

function parseIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1, 12).getTime();
}

export type NudgeKind = "vacant" | "turning" | "lease_ending" | "dark";

export type Nudge = {
  id: string;
  homeId: string;
  kind: NudgeKind;
  days: number;
  fits: number;
  strong: number;
  headline: string;
  detail: string;
  urgency: "now" | "soon" | "watch";
};

const ENDING_WINDOW_DAYS = 45;

export function vacancyNudges(input: {
  homes: RentalHome[];
  leases: Lease[];
  waitlist: WaitPerson[];
  now?: number;
}): Nudge[] {
  const now = input.now ?? Date.now();
  const out: Nudge[] = [];
  for (const home of input.homes) {
    const fits = bestFitsFor(home, input.waitlist);
    const strong = fits.filter((f) => f.match.fit === "strong").length;
    const label = `${home.address}, ${home.city}`;
    const since = home.statusChangedAt ?? null;
    const days = since ? daysBetween(since, now) : 0;
    const active = input.leases.find(
      (l) => l.homeId === home.id && l.status === "active",
    );
    const draft = input.leases.find(
      (l) => l.homeId === home.id && l.status === "draft",
    );

    if (home.status === "vacant" && !draft) {
      const dark = home.listing !== "available";
      out.push({
        id: `vac-${home.id}`,
        homeId: home.id,
        kind: dark ? "dark" : "vacant",
        days,
        fits: fits.length,
        strong,
        headline: dark
          ? `${label} is vacant and off market${days ? ` · ${days} day${days === 1 ? "" : "s"}` : ""}`
          : `${label} is vacant${days ? ` · ${days} day${days === 1 ? "" : "s"} dark` : ""}`,
        detail: fits.length
          ? `${fits.length} neighbor${fits.length === 1 ? "" : "s"} waiting fit${fits.length === 1 ? "s" : ""}${strong ? ` · ${strong} strong` : ""}. Call them before anyone lists it.`
          : dark
            ? "Nobody on the waitlist fits yet. Turn the light on so someone can ask."
            : "Nobody on the waitlist fits yet. Share the listing and ask a connector.",
        urgency: days >= 14 || strong > 0 ? "now" : "soon",
      });
    } else if (home.status === "turning" && !draft) {
      out.push({
        id: `turn-${home.id}`,
        homeId: home.id,
        kind: "turning",
        days,
        fits: fits.length,
        strong,
        headline: `${label} is turning${days ? ` · ${days} day${days === 1 ? "" : "s"}` : ""}`,
        detail: fits.length
          ? `${fits.length} waiting fit${fits.length === 1 ? "s" : ""}. Walk the house with the best fit while the paint dries.`
          : "Finish the work, then call the waitlist or share the listing.",
        urgency: days >= 21 ? "now" : "soon",
      });
    }

    if (active?.end) {
      const endsIn = Math.ceil((parseIso(active.end) - now) / DAY);
      if (endsIn <= ENDING_WINDOW_DAYS && endsIn >= -7) {
        out.push({
          id: `end-${active.id}`,
          homeId: home.id,
          kind: "lease_ending",
          days: endsIn,
          fits: fits.length,
          strong,
          headline:
            endsIn < 0
              ? `${label} · ${active.household}'s lease ended ${-endsIn} day${endsIn === -1 ? "" : "s"} ago`
              : `${label} · ${active.household}'s lease ends in ${endsIn} day${endsIn === 1 ? "" : "s"}`,
          detail:
            "Talk early: stay, month-to-month, or a move-out date. If they go, the waitlist gets the first call.",
          urgency: endsIn <= 14 ? "now" : "soon",
        });
      }
    }
  }
  const rank = { now: 0, soon: 1, watch: 2 };
  return out.sort((a, b) => rank[a.urgency] - rank[b.urgency] || b.days - a.days);
}
