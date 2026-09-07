/** Fee schedule shown before any packet is generated. Attorney + board must approve numbers before production. */

export type FeeLine = {
  id: string;
  when: string;
  name: string;
  amount: string;
  note: string;
  attorneyMustApprove: true;
};

export const FEE_SCHEDULE: FeeLine[] = [
  {
    id: "season",
    when: "Before any paperwork",
    name: "Season check and explainer",
    amount: "$0",
    note: "Read, quiz, and decide. No invoice.",
    attorneyMustApprove: true,
  },
  {
    id: "intake",
    when: "Before any paperwork",
    name: "Facts intake",
    amount: "$0",
    note: "Owners, deed, who lives there, intent to stay.",
    attorneyMustApprove: true,
  },
  {
    id: "draft",
    when: "Before any paperwork",
    name: "Draft packet from locked templates",
    amount: "$0",
    note: "We fill blanks. We do not invent terms. Nothing is filed yet.",
    attorneyMustApprove: true,
  },
  {
    id: "attorney",
    when: "If you choose to file",
    name: "Supervising attorney review, paralegal pass, and signature",
    amount: "$1,800 flat",
    note: "Paid to the attorney’s office, not hidden inside a percentage. You see it before a packet is generated.",
    attorneyMustApprove: true,
  },
  {
    id: "recording",
    when: "If you choose to file",
    name: "County recording",
    amount: "At cost",
    note: "Pass-through of the clerk’s fee. Receipts live on the dashboard.",
    attorneyMustApprove: true,
  },
  {
    id: "occupancy",
    when: "While you live there",
    name: "Occupancy",
    amount: "$0",
    note: "You keep the right to live in the home for as long as you need it. We do not charge rent to the person we are protecting.",
    attorneyMustApprove: true,
  },
  {
    id: "maintenance",
    when: "While you live there",
    name: "Repairs and upkeep",
    amount: "At documented cost",
    note: "Receipts in the log. No markup. Family can see every line.",
    attorneyMustApprove: true,
  },
  {
    id: "annual",
    when: "While you live there",
    name: "Annual stewardship accounting",
    amount: "$240 / year",
    note: "Twenty dollars a month for insurance tracking, logs, and a family report. Cancel if occupancy ends and the file is quiet.",
    attorneyMustApprove: true,
  },
  {
    id: "rent",
    when: "Only after occupancy ends, if the family agrees to rent it as affordable housing",
    name: "Operating stewardship on collected rent",
    amount: "8% of rent collected",
    note: "The rest follows the waterfall: operating costs, then family. Never charged while the elder still needs the home.",
    attorneyMustApprove: true,
  },
  {
    id: "sale",
    when: "Only if the home is later sold",
    name: "Stewardship sale fee",
    amount: "3.5% of sale price",
    note: "Instead of a typical 5–6% realtor commission. Documented costs come out. Remainder to named family or beneficiaries. No dual agency games.",
    attorneyMustApprove: true,
  },
];

export const FEE_PRINCIPLES = [
  "No hidden fees. This screen appears before any packet is generated.",
  "The person keeps occupancy rights while they need the home.",
  "Family (or named beneficiaries) keep sale proceeds after documented operating costs and the stewardship fee above.",
  "We do not take title as a prize. People are the purpose.",
];
