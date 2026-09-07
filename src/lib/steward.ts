import type { PacketStatus } from "./templates";

export type Season = "unknown" | "planning" | "crisis" | "connector";

export type QuizAnswers = {
  who: "" | "self" | "child" | "connector";
  living: "" | "home" | "facility";
  medicaidWindow: "" | "no" | "yes" | "unsure";
  houseIsPrimary: "" | "yes" | "no";
  stayIntent: "" | "years" | "soon" | "unsure";
};

export type Intake = {
  homeowner: string;
  ageRange: string;
  county: string;
  address: string;
  deed: string;
  whoLives: string;
  spouse: string;
  spouseInHome: string;
  childrenInHome: string;
  childNotes: string;
  stayYears: string;
  adultChild: string;
  adultChildContact: string;
  remainder: string;
  filledBy: string;
};

export const EMPTY_QUIZ: QuizAnswers = {
  who: "",
  living: "",
  medicaidWindow: "",
  houseIsPrimary: "",
  stayIntent: "",
};

export const EMPTY_INTAKE: Intake = {
  homeowner: "",
  ageRange: "60-75",
  county: "Toombs",
  address: "",
  deed: "unknown",
  whoLives: "",
  spouse: "no",
  spouseInHome: "n/a",
  childrenInHome: "no",
  childNotes: "",
  stayYears: "5+",
  adultChild: "",
  adultChildContact: "",
  remainder: "",
  filledBy: "",
};

export const AGE_RANGES = ["under 60", "60-75", "76-85", "86+"] as const;

export const DEED_OPTIONS = [
  { id: "sole", label: "Sole owner" },
  { id: "joint-spouse", label: "Joint with spouse" },
  { id: "joint-other", label: "Joint with someone else" },
  { id: "life-estate", label: "Life estate already on the deed" },
  { id: "trust", label: "Already in a trust" },
  { id: "unknown", label: "Not sure yet" },
] as const;

export const COUNTIES = [
  "Toombs",
  "Montgomery",
  "Tattnall",
  "Treutlen",
  "Emanuel",
  "Telfair",
  "Wheeler",
  "Jeff Davis",
  "Appling",
  "Candler",
  "Other Georgia county",
] as const;

export type MaintenanceLog = {
  id: string;
  at: number;
  title: string;
  detail: string;
};

export type Expense = {
  id: string;
  at: number;
  payee: string;
  category: string;
  amount: number;
  receipt: string;
};

export type StewardState = {
  season: Season;
  quiz: QuizAnswers;
  intake: Intake;
  feesAcceptedAt: number | null;
  packetStatus: PacketStatus;
  packetGeneratedAt: number | null;
  logs: MaintenanceLog[];
  expenses: Expense[];
  occupancyNote: string;
  connectorName: string;
  connectorChurch: string;
  connectorCode: string;
};

export const EMPTY_STEWARD: StewardState = {
  season: "unknown",
  quiz: { ...EMPTY_QUIZ },
  intake: { ...EMPTY_INTAKE },
  feesAcceptedAt: null,
  packetStatus: "empty",
  packetGeneratedAt: null,
  logs: [],
  expenses: [],
  occupancyNote: "",
  connectorName: "",
  connectorChurch: "",
  connectorCode: "",
};

export function scoreSeason(q: QuizAnswers): Season {
  if (q.who === "connector") return "connector";
  if (q.living === "facility") return "crisis";
  if (q.medicaidWindow === "yes") return "crisis";
  if (q.stayIntent === "soon" && q.medicaidWindow !== "no") return "crisis";
  if (q.living === "home") return "planning";
  return "unknown";
}

export function intakeComplete(i: Intake) {
  return Boolean(
    i.homeowner.trim() &&
      i.address.trim() &&
      i.county &&
      i.adultChild.trim() &&
      i.adultChildContact.trim(),
  );
}

export function templateValues(i: Intake): Record<string, string> {
  const spouseLine =
    i.spouse === "yes"
      ? `, with spouse ${i.whoLives || "named on intake"}`
      : "";
  return {
    homeowner: i.homeowner || "[homeowner]",
    address: i.address || "[address]",
    county: i.county || "[county]",
    spouseLine,
    spouse: i.spouse === "yes" ? "yes" : "no",
    childrenInHome: i.childrenInHome,
    stayYears: i.stayYears,
    deed: i.deed,
    adultChild: i.adultChild || "[family contact]",
    adultChildContact: i.adultChildContact || "[contact]",
    remainder: i.remainder.trim() || i.adultChild || "[named beneficiaries]",
  };
}

export const DEMO_LOGS: MaintenanceLog[] = [
  {
    id: "l1",
    at: Date.now() - 1000 * 60 * 60 * 24 * 40,
    title: "HVAC filter and porch rail screws",
    detail: "Occupant asked. Hardware-store run. Receipt in envelope.",
  },
  {
    id: "l2",
    at: Date.now() - 1000 * 60 * 60 * 24 * 12,
    title: "Insurance renewal copied to family contact",
    detail: "Policy still names occupant as living in the home. No gap.",
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: "e1",
    at: Date.now() - 1000 * 60 * 60 * 24 * 40,
    payee: "Vidalia Hardware",
    category: "Repair",
    amount: 38.44,
    receipt: "Filter + screws",
  },
  {
    id: "e2",
    at: Date.now() - 1000 * 60 * 60 * 24 * 20,
    payee: "County tax commissioner",
    category: "Taxes",
    amount: 412,
    receipt: "Installment 1 — at cost",
  },
  {
    id: "e3",
    at: Date.now() - 1000 * 60 * 60 * 24 * 5,
    payee: "Porchlight accounting",
    category: "Stewardship fee",
    amount: 20,
    receipt: "Monthly accounting — published schedule",
  },
];
