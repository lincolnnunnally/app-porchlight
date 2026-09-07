export const CITIES = [
  "Vidalia",
  "Lyons",
  "Santa Claus",
  "Uvalda",
  "Higgston",
  "Toombs County",
] as const;

export const STAGES = [
  { id: "watching", label: "Watching" },
  { id: "letter", label: "Letter sent" },
  { id: "talking", label: "Talking" },
  { id: "contract", label: "Under contract" },
] as const;

export type HuntStage = (typeof STAGES)[number]["id"];
export type City = (typeof CITIES)[number];

export type House = {
  id: string;
  address: string;
  city: City | string;
  owner: string;
  bedsBaths: string;
  offer: string;
  notes: string;
  stage: HuntStage;
};

export type Letter = {
  houseId: string;
  at: number;
  body: string;
};

export const HUNT_SEED: House[] = [
  {
    id: "h1",
    address: "918 Durden St",
    city: "Vidalia",
    owner: "unknown",
    bedsBaths: "3 / 1",
    offer: "$72,000",
    notes:
      "Vacant looking. Porch light still on at noon. Ask around the block before a letter.",
    stage: "watching",
  },
  {
    id: "h2",
    address: "44 N Broad St",
    city: "Lyons",
    owner: "Ellis family (rumor)",
    bedsBaths: "4 / 2",
    offer: "$95,000",
    notes:
      "Big shade trees. Needs paint and a patient kitchen. Could live in it.",
    stage: "letter",
  },
  {
    id: "h3",
    address: "201 Maple Dr",
    city: "Vidalia",
    owner: "Ms. Carter",
    bedsBaths: "2 / 1",
    offer: "$60,000",
    notes:
      "She mentioned wanting to be nearer her daughter. Keep it human.",
    stage: "talking",
  },
  {
    id: "h4",
    address: "Hwy 280 lot behind the pecan stand",
    city: "Toombs County",
    owner: "unknown",
    bedsBaths: "—",
    offer: "land + shell",
    notes:
      "Not pretty. Good bones if the well is honest. Hunt, don't rush.",
    stage: "watching",
  },
];

export function stageLabel(id: string) {
  return STAGES.find((s) => s.id === id)?.label ?? id;
}

export type LetterKind = "neighbor" | "cash" | "hands";

export const LETTER_OPTIONS: { id: LetterKind; label: string }[] = [
  { id: "neighbor", label: "Warm neighbor" },
  { id: "cash", label: "Cash, as-is" },
  { id: "hands", label: "I repair with my hands" },
];

export function writeLetter(kind: LetterKind, h: House) {
  const who = h.owner === "unknown" ? "neighbor" : h.owner;
  if (kind === "neighbor") {
    return `Dear ${who},

I live and work around Vidalia / Toombs, and I have been hoping to buy a house I can repair with my own hands — not to flip and vanish, but to live in, rent fairly, or sell to someone who will keep it.

Your place at ${h.address} caught my eye. If you have ever thought about selling, even "maybe someday," I would be grateful for a conversation. No pressure and no games.

A porch light is a small honest thing. If you would like to talk, you can reach me.

With respect,
Lincoln`;
  }
  if (kind === "cash") {
    return `Hello ${h.owner === "unknown" ? "" : h.owner},

I am writing about ${h.address} in ${h.city}. I buy houses as-is, in cash, and I handle the repairs myself. You would not need to clean, fix, or stage anything.

If a simple sale would help you, I would like to make a straightforward offer. ${h.offer ? "I am thinking in the range of " + h.offer + "." : "Tell me what would actually serve you."}

I can meet on the porch whenever it is convenient.

Lincoln`;
  }
  return `Hello,

I am looking for a house in Toombs County that still has good bones — something I can repair with my hands instead of waiting on a crew.

${h.address} looks like it might be that kind of place. ${h.notes || ""}

If you own it and have room to talk, I would like to listen first.

Thank you,
Lincoln`;
}
