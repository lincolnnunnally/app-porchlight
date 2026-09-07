/** Work the attorney actually has to finish. Drafts only. Not executed instruments. */

import { GEORGIA_FACTS, NOT_LEGAL_ADVICE } from "./georgia";
import { FEE_SCHEDULE } from "./fees";
import { fillTemplate, LOCKED_TEMPLATES, type TemplateId } from "./templates";
import type { Intake } from "./steward";
import { templateValues } from "./steward";

export type ReviewStatus = "needs_you" | "returned" | "signed";

export type CounselCheck = {
  id: string;
  label: string;
};

export const COUNSEL_CHECKS: CounselCheck[] = [
  {
    id: "client",
    label: "I represent the homeowner (and spouse, if any), not Porchlight.",
  },
  {
    id: "lookback",
    label: "I will counsel on the 60-month Medicaid transfer look-back before any gift or under-market transfer.",
  },
  {
    id: "estate",
    label: "I will counsel that Georgia’s expanded estate can still reach trusts, life estates, TOD, and joint title.",
  },
  {
    id: "title",
    label: "I will not record until title is verified (or I have said in writing why we may proceed).",
  },
  {
    id: "crisis",
    label: "I will not sign a transfer packet if nursing-home Medicaid is already needed inside five years.",
  },
  {
    id: "fees",
    label: "The fee numbers are acceptable, or I have written the numbers I will allow.",
  },
];

export type WorkItem = {
  id: TemplateId;
  pile: "stewardship" | "rent" | "counsel";
  title: string;
  ask: string;
  minutes: string;
};

export const WORK_PILE: WorkItem[] = [
  {
    id: "independence",
    pile: "counsel",
    title: "Who is the client",
    ask: "Sign that you represent the family, not Porchlight.",
    minutes: "5 min",
  },
  {
    id: "georgia-summary",
    pile: "counsel",
    title: "Georgia educational summary",
    ask: "Confirm the six sourced facts, or strike a line.",
    minutes: "10 min",
  },
  {
    id: "lookback",
    pile: "counsel",
    title: "Look-back and crisis rule",
    ask: "Keep or rewrite the five-year stop. Do not soften it.",
    minutes: "8 min",
  },
  {
    id: "cover",
    pile: "stewardship",
    title: "Routing cover sheet",
    ask: "This is how a file lands on your desk. Fix the asks.",
    minutes: "5 min",
  },
  {
    id: "occupancy",
    pile: "stewardship",
    title: "Occupancy and use",
    ask: "This is the heart: they stay. Edit until you would sign it.",
    minutes: "20 min",
  },
  {
    id: "maintenance",
    pile: "stewardship",
    title: "Maintenance covenant",
    ask: "Cost, no markup, family can see every receipt.",
    minutes: "10 min",
  },
  {
    id: "later-rent",
    pile: "stewardship",
    title: "Later affordable use",
    ask: "Must stay dark while they need the home.",
    minutes: "12 min",
  },
  {
    id: "waterfall",
    pile: "stewardship",
    title: "Sale-proceeds waterfall",
    ask: "Family keeps the rest. Check the 3.5%.",
    minutes: "10 min",
  },
  {
    id: "fee",
    pile: "stewardship",
    title: "Fee disclosure",
    ask: "Same numbers the family sees. Change them here if you must.",
    minutes: "8 min",
  },
  {
    id: "lease",
    pile: "rent",
    title: "Fair-rent occupancy",
    ask: "Georgia residential draft. Not a dispossessory. Not a bank.",
    minutes: "20 min",
  },
  {
    id: "deposit",
    pile: "rent",
    title: "Deposit accounting",
    ask: "Itemize or return. Cite O.C.G.A. § 44-7-31 et seq.",
    minutes: "8 min",
  },
  {
    id: "demand",
    pile: "rent",
    title: "Demand draft",
    ask: "A conversation record. Must not look like a court paper.",
    minutes: "8 min",
  },
];

export function engagementLetter(name: string) {
  const who = name.trim() || "Counsel";
  return `Dear ${who},

Porchlight does not practice law. We filled blanks from a family intake and from locked drafts. Nothing is an instrument until you say so.

What we need from you, in this order:

1. Confirm you represent the homeowner, not Porchlight.
2. Counsel on the 60-month look-back and on Georgia’s expanded estate.
3. Open the Attorney desk. One item is waiting. Edit it. Sign it or send it back. Then the next one.
4. Do not record until title is verified.
5. Do not sign a transfer packet in a crisis season.

The desk is built so you never hunt through the app. The pile is the work.

Flat review we disclosed to the family: $1,800 to your office, if they choose to file. County recording at cost.

With respect,
Porchlight
porchlight.unitedundergod.org`;
}

export function filledBody(id: TemplateId, intake: Intake) {
  const t = LOCKED_TEMPLATES.find((x) => x.id === id);
  if (!t) return "";
  return fillTemplate(t.body, templateValues(intake));
}

export function georgiaHandout() {
  const facts = GEORGIA_FACTS.map(
    (f, i) => `${i + 1}. ${f.title}\n${f.body}\nSource: ${f.source}\n${f.sourceUrl}`,
  ).join("\n\n");
  return `GEORGIA MEDICAID ESTATE RECOVERY — EDUCATIONAL SUMMARY (DRAFT)

${NOT_LEGAL_ADVICE}

${facts}

Counsel: strike any sentence you will not stand behind. Date and sign only the lines that remain.

[ATTORNEY MUST APPROVE BEFORE THIS IS SHOWN AS PRODUCTION COPY]`;
}

export function feeHandout() {
  const lines = FEE_SCHEDULE.map(
    (f) => `- ${f.name} (${f.when}): ${f.amount}. ${f.note}`,
  ).join("\n");
  return `FEE DISCLOSURE (DRAFT)

Shown to the family before any packet is generated.

${lines}

No other fee is authorized by this draft unless counsel writes it here: ________

[ATTORNEY MUST APPROVE TEMPLATE TEXT AND DOLLAR AMOUNTS BEFORE PRODUCTION]`;
}
