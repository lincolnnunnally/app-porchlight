/**
 * Stronger match: listing + waitlist + house facts, scored in plain words.
 * A neighbor wrote "2–3 bed, Lyons or Vidalia, under $750". We read that,
 * compare it to the house record, and say why it fits or why it does not.
 * Nothing here is a credit pull or a screen. It orders who to call first.
 */
import { CITIES } from "./hunt.ts";
import type { RentalHome, WaitPerson } from "./rental.ts";

// Kept local (not imported from ./rental) so the node test runner can load
// this module without the rest of the rental notebook.
function bedsOf(bedsBaths: string) {
  const n = parseInt(bedsBaths, 10);
  return Number.isFinite(n) ? n : 0;
}

function isSearchable(home: RentalHome) {
  return home.listing === "available" && home.status !== "occupied";
}

export type Wants = {
  bedsMin: number | null;
  bedsMax: number | null;
  maxRent: number | null;
  cities: string[];
  furnished: boolean | null;
  commercial: boolean;
  oneStory: boolean;
};

export type MatchResult = {
  score: number;
  fit: "strong" | "fair" | "weak" | "no";
  reasons: string[];
  blockers: string[];
};

export function parseWants(text: string): Wants {
  const t = text.toLowerCase().replace(/[–—]/g, "-");
  const cities = CITIES.filter((c) => t.includes(c.toLowerCase()));
  const range = t.match(/(\d)\s*(?:-|to|or)\s*(\d)\s*(?:bed|br|bd)/);
  const single = t.match(/(\d)\s*(?:\+\s*)?(?:bed|br|bd)/);
  const bedsMin = range ? Number(range[1]) : single ? Number(single[1]) : null;
  const bedsMax = range
    ? Number(range[2])
    : single && !/\d\s*\+/.test(t)
      ? Number(single[1])
      : null;
  const money = t.match(/(?:under|below|max|up to|<|less than)\s*\$?\s*([\d,]{3,6})/);
  const bare = !money ? t.match(/\$\s*([\d,]{3,6})/) : null;
  const rentRaw = money?.[1] ?? bare?.[1];
  const maxRent = rentRaw ? Number(rentRaw.replace(/,/g, "")) : null;
  const furnished = /unfurnished/.test(t)
    ? false
    : /furnished/.test(t)
      ? true
      : null;
  return {
    bedsMin,
    bedsMax,
    maxRent: maxRent && maxRent > 0 ? maxRent : null,
    cities,
    furnished,
    commercial: /(shop|storefront|commercial|office|warehouse)/.test(t),
    oneStory: /one[- ]story|single[- ]story|no stairs/.test(t),
  };
}

export function scoreMatch(home: RentalHome, person: WaitPerson): MatchResult {
  const wants = parseWants(person.wants);
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 0;

  if (person.homeId && person.homeId === home.id) {
    // Outranks a full city + beds + rent fit: they already chose this porch.
    score += 50;
    reasons.push("asked for this house by name");
  }

  const wantsCommercial = wants.commercial;
  const isCommercial = home.facts.propertyKind === "commercial";
  if (wantsCommercial !== isCommercial) {
    blockers.push(
      isCommercial ? "house is commercial, they want a home" : "they asked for a commercial space",
    );
    return { score: 0, fit: "no", reasons, blockers };
  }

  if (wants.cities.length) {
    if (wants.cities.includes(home.city)) {
      score += 20;
      reasons.push(`${home.city} is on their list`);
    } else {
      score -= 15;
      blockers.push(`they asked for ${wants.cities.join(" or ")}, this is ${home.city}`);
    }
  }

  const beds = bedsOf(home.bedsBaths);
  if (wants.bedsMin !== null && beds) {
    const max = wants.bedsMax ?? Infinity;
    if (beds >= wants.bedsMin && beds <= max) {
      score += 20;
      reasons.push(`${beds} bed fits what they asked`);
    } else if (beds < wants.bedsMin) {
      score -= 20;
      blockers.push(`${beds} bed is fewer than the ${wants.bedsMin} they need`);
    } else {
      score += 5;
      reasons.push(`${beds} bed, more room than they asked`);
    }
  }

  if (wants.maxRent !== null && home.fairRent) {
    if (home.fairRent <= wants.maxRent) {
      score += 20;
      reasons.push(`$${home.fairRent} is under their $${wants.maxRent}`);
    } else {
      score -= 25;
      blockers.push(`$${home.fairRent} is over their $${wants.maxRent}`);
    }
  }

  if (wants.furnished !== null) {
    const isFurnished = home.facts.furnished === "furnished";
    if (wants.furnished === isFurnished) {
      score += 8;
      reasons.push(isFurnished ? "furnished, as asked" : "unfurnished, as asked");
    } else {
      score -= 5;
      blockers.push(isFurnished ? "furnished, they asked for unfurnished" : "unfurnished, they asked for furnished");
    }
  }

  if (wants.oneStory && /one[- ]story|single[- ]story/i.test(home.notes)) {
    score += 6;
    reasons.push("one-story, as asked");
  }

  if (!wants.cities.length && !wants.bedsMin && !wants.maxRent && !person.homeId) {
    score += 5;
    reasons.push("open to any home that fits");
  }

  if (person.status === "housed" || person.status === "passed") {
    return { score: 0, fit: "no", reasons, blockers: [...blockers, `already ${person.status}`] };
  }

  const fit: MatchResult["fit"] =
    blockers.length && score < 20
      ? score <= 0
        ? "no"
        : "weak"
      : score >= 40
        ? "strong"
        : score >= 20
          ? "fair"
          : "weak";
  return { score, fit, reasons, blockers };
}

export type RankedFit = { person: WaitPerson; match: MatchResult };
export type RankedHome = { home: RentalHome; match: MatchResult };

export function bestFitsFor(home: RentalHome, waitlist: WaitPerson[]): RankedFit[] {
  return waitlist
    .filter((p) => p.status !== "housed" && p.status !== "passed")
    .map((person) => ({ person, match: scoreMatch(home, person) }))
    .filter((r) => r.match.fit !== "no")
    .sort((a, b) => b.match.score - a.match.score);
}

export function bestHomesFor(person: WaitPerson, homes: RentalHome[]): RankedHome[] {
  return homes
    .filter((h) => isSearchable(h) || h.id === person.homeId)
    .map((home) => ({ home, match: scoreMatch(home, person) }))
    .filter((r) => r.match.fit !== "no")
    .sort((a, b) => b.match.score - a.match.score);
}
