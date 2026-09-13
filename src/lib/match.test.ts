import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withHouseFactsSpine } from "./house-facts.ts";
import { bestFitsFor, parseWants, scoreMatch } from "./match.ts";
import { vacancyNudges } from "./nudge.ts";
import type { RentalHome, WaitPerson } from "./rental.ts";

const DAY = 1000 * 60 * 60 * 24;

function home(patch: Partial<RentalHome> & { id: string }): RentalHome {
  return withHouseFactsSpine({
    address: "21 Cherry St",
    city: "Vidalia",
    bedsBaths: "2 / 1",
    status: "vacant",
    fairRent: 600,
    notes: "One-story. Honest heat.",
    payInstructions: "",
    ownerId: "o1",
    listing: "available",
    intent: "rent",
    statusChangedAt: Date.now() - 20 * DAY,
    ...patch,
  }) as RentalHome;
}

function person(patch: Partial<WaitPerson> & { id: string }): WaitPerson {
  return {
    name: "Neighbor",
    phone: "",
    household: "",
    wants: "",
    notes: "",
    status: "interested",
    homeId: "",
    addedAt: Date.now() - 5 * DAY,
    referredBy: "",
    ...patch,
  };
}

describe("parseWants", () => {
  it("reads beds, cities, and a ceiling from plain words", () => {
    const w = parseWants("2–3 bed, Lyons or Vidalia, under $750");
    assert.equal(w.bedsMin, 2);
    assert.equal(w.bedsMax, 3);
    assert.deepEqual(w.cities, ["Vidalia", "Lyons"]);
    assert.equal(w.maxRent, 750);
    assert.equal(w.commercial, false);
  });

  it("reads a shop as commercial and a bare dollar figure as a ceiling", () => {
    const w = parseWants("Small storefront in Vidalia, $900");
    assert.equal(w.commercial, true);
    assert.equal(w.maxRent, 900);
  });
});

describe("scoreMatch", () => {
  it("calls a fitting neighbor a strong match with reasons", () => {
    const m = scoreMatch(
      home({ id: "r3" }),
      person({ id: "n", wants: "2 bed, Vidalia, under $750" }),
    );
    assert.equal(m.fit, "strong");
    assert.ok(m.reasons.some((r) => r.includes("Vidalia")));
    assert.ok(m.reasons.some((r) => r.includes("$600")));
    assert.equal(m.blockers.length, 0);
  });

  it("names the blocker when the rent is over their ceiling", () => {
    const m = scoreMatch(
      home({ id: "r2", fairRent: 900 }),
      person({ id: "n", wants: "under $750" }),
    );
    assert.ok(m.blockers[0].includes("over their $750"));
    assert.notEqual(m.fit, "strong");
  });

  it("never matches a family to a commercial space", () => {
    const h = home({ id: "shop" });
    h.facts = { ...h.facts, propertyKind: "commercial" };
    const m = scoreMatch(h, person({ id: "n", wants: "2 bed under $700" }));
    assert.equal(m.fit, "no");
  });

  it("ranks the person who asked for this house first", () => {
    const h = home({ id: "r3" });
    const ranked = bestFitsFor(h, [
      person({ id: "a", wants: "Vidalia, under $700" }),
      person({ id: "b", wants: "anything", homeId: "r3" }),
      person({ id: "c", wants: "3 bed Lyons", status: "housed" }),
    ]);
    assert.equal(ranked[0].person.id, "b");
    assert.equal(ranked.length, 2);
  });
});

describe("vacancyNudges", () => {
  it("counts dark days and who fits, and flags an ending lease", () => {
    const now = Date.now();
    const soon = new Date(now + 10 * DAY);
    const end = `${soon.getFullYear()}-${String(soon.getMonth() + 1).padStart(2, "0")}-${String(soon.getDate()).padStart(2, "0")}`;
    const nudges = vacancyNudges({
      now,
      homes: [
        home({ id: "r3" }),
        home({ id: "r1", address: "312 First Ave", status: "occupied", listing: "off_market" }),
      ],
      leases: [
        {
          id: "l1",
          homeId: "r1",
          household: "Reed family",
          phone: "",
          start: "2026-01-01",
          end,
          monthly: 650,
          deposit: 650,
          depositStatus: "held",
          status: "active",
          terms: "",
        },
      ],
      waitlist: [person({ id: "n", wants: "2 bed Vidalia under $700" })],
    });
    const vac = nudges.find((n) => n.kind === "vacant");
    assert.ok(vac);
    assert.equal(vac.days, 20);
    assert.equal(vac.fits, 1);
    assert.equal(vac.urgency, "now");
    const ending = nudges.find((n) => n.kind === "lease_ending");
    assert.ok(ending);
    assert.equal(ending.days, 10);
  });
});
