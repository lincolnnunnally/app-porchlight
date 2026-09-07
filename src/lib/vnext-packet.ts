/**
 * AppEngine vNext packet for Porchlight.
 * Existing live app: hunt / houses / letters at porchlight.unitedundergod.org
 * This packet adds Home Stewardship + fair-rent operations. Do not deploy until owner + attorney say so.
 */

export const VNEXT_PACKET = {
  kind: "vnext_packet" as const,
  app: "Porchlight",
  slug: "porchlight",
  currentVersion: "hunt-houses-letters-v1",
  targetVersion: "stewardship-rentals-vnext",
  productionUrl: "https://porchlight.unitedundergod.org",
  repo: "lincolnnunnally/app-porchlight",
  requestType: "existing_app_improvement",
  doNotDeploy: false,
  purpose:
    "Help working people who paid taxes their whole life keep use of their home and keep family value after death — while hunting off-market houses in Vidalia / Toombs, then operating those homes as fair rent: leases, payments, work, and a waitlist, not a listing machine.",
  audience: [
    "Homeowners 60–75 still living at home, house is primary asset, planning 5+ years ahead",
    "Adult children helping a parent plan early",
    "Church and community connectors who refer, not sell",
    "Existing Porchlight hunters looking for off-market houses in Toombs County",
    "Lincoln operating repaired houses as fair rent for working families",
  ],
  barrierRemoved:
    "Fear and silence around Georgia Medicaid estate recovery, realtor-priced listings, and the mess of operating a small set of homes with a notebook.",
  needAddressed:
    "A clear early plan with an attorney in the loop, a quiet path to a house before it hits the market, and a neighborly ledger once someone lives there.",
  movementTowardLife:
    "Fear → a neighborly plan. A dark house → a porch light that stays on for the person who needs it, then for the next family on the waitlist.",
  appBoundaries: [
    "Do not invent law.",
    "Do not let the app be the lawyer.",
    "Do not generate a transfer packet inside the 5-year look-back / crisis season.",
    "Do not hide fees.",
    "Do not process rent money or run evictions from this app.",
    "Do not create a competing app — this is vNext of Porchlight, not a new brand.",
    "Do not deploy this vNext until owner approval. Live hunt stays as it is.",
  ],
  transformationOutcome:
    "The elder keeps occupancy while they need the home. Family keeps sale proceeds after documented costs and a published stewardship fee. Later, the same house is rented fairly to someone already waiting — leases, payments, and work in one place.",
  toolClassification: "mixed" as const,
  loadedContext: [
    "Live Porchlight SPA (Hunt, Houses, Letters) at porchlight.unitedundergod.org",
    "AppEngine imported ecosystem record: slug porchlight, nextSafeAction create_vnext_packet",
    "Georgia DCH estate recovery materials and Ga. Comp. R. & Regs. Chapter 111-3-8",
    "Owner request: add elderly protection without rebuilding the hunt",
    "Owner request: rental management — payments, contracts, work, waitlist",
    "Owner request: attorney desk, complete drafts, merge to live",
  ],
  improvementRequest:
    "Add Home Stewardship, fair-rent operations, housing search, owner invite, and renter/owner/manager desks (revenue, tenant sign-off, listing, cash-out into the hunt). Keep Hunt / Houses / Letters.",
  nonGoals: [
    "Practice of law",
    "Promising Medicaid eligibility or recovery results",
    "Title grabbing / we-take-the-house language",
    "Pressure tools for pastors",
    "Online rent collection / Stripe in this pass",
    "Eviction mill / credit screening / tenant portal",
    "Production deploy of vNext in this pass",
    "A second housing app brand",
  ],
  providerCostDelta:
    "None in this preview. Continues local-first (localStorage). No new paid providers. Attorney work is a published flat fee to a supervising lawyer, not a cloud invoice.",
  phases: [
    "Preview screens and copy in Grok Build (this packet) — no deploy",
    "Attorney review of every flagged template and Georgia summary",
    "Board / owner approval of fee numbers and lease draft",
    "Merge Hunt + Stewardship + Rentals into app-porchlight when approved",
    "Release gate only after attorney sign-off",
  ],
  attorneyApprovalRequired: [
    "All Georgia estate-recovery explainer copy",
    "$25,000 floor wording",
    "Spouse / child protection wording",
    "5-year look-back wording",
    "Georgia expanded estate definition warning (trusts, life estates still reachable)",
    "Crisis path: Don’t move title. Talk to an elder-law attorney now.",
    "Occupancy template",
    "Maintenance covenant",
    "Later-rent affordable use template",
    "Sale-proceeds waterfall",
    "Fee schedule dollar amounts",
    "Routing cover sheet",
    "Fair rent occupancy / lease draft",
    "Any sentence that could be read as a Medicaid result",
    "Connector referral language",
  ],
  laterNotNow: [
    "Stripe / ACH actually moving money (this pass records cash, check, Zelle, money order)",
    "Real household login (this pass is a desk on the same device)",
    "FCRA credit or eviction consumer reports",
    "Filing a Georgia dispossessory",
    "Automated late-fee mill",
  ],
  releaseGate:
    "Owner approval required. Attorney approval required on flagged copy. Do not mint production. Do not overwrite porchlight.unitedundergod.org until both say yes.",
  monitoringUpdate:
    "Keep existing local-first hunt. Stewardship packets and rental ledgers stay on-device until a later backend is explicitly approved. No PII in unowned databases.",
} as const;
