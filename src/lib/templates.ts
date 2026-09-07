/** Locked attorney templates. Placeholders only. Do not treat as executed instruments. */

export type PacketStatus =
  | "empty"
  | "draft"
  | "paralegal"
  | "attorney"
  | "recorded";

export const PACKET_STEPS: { id: PacketStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "paralegal", label: "Paralegal review" },
  { id: "attorney", label: "Attorney sign" },
  { id: "recorded", label: "Recorded" },
];

export type TemplateId =
  | "occupancy"
  | "maintenance"
  | "later-rent"
  | "waterfall"
  | "fee"
  | "cover"
  | "georgia-summary"
  | "lookback"
  | "independence"
  | "lease"
  | "deposit"
  | "demand";

export type LockedTemplate = {
  id: TemplateId;
  title: string;
  purpose: string;
  pile: "stewardship" | "rent" | "counsel";
  attorneyMustApprove: true;
  body: string;
};

const BANNER =
  "DRAFT FOR COUNSEL — NOT AN EXECUTED INSTRUMENT. Porchlight does not practice law and does not promise a Medicaid result. Do not record, serve, or treat as signed until a Georgia attorney licensed in this matter has revised and signed.";

export const LOCKED_TEMPLATES: LockedTemplate[] = [
  {
    id: "independence",
    title: "Who is the client",
    purpose: "The lawyer works for the family. Porchlight is not the client.",
    pile: "counsel",
    attorneyMustApprove: true,
    body: `${BANNER}

INDEPENDENT COUNSEL ACKNOWLEDGMENT (DRAFT)

I, ________________________, Georgia Bar No. ________, state:

1. I represent {{homeowner}}{{spouseLine}} as to the home at {{address}}, {{county}} County, Georgia.
2. I do not represent Porchlight Home Stewardship, Lincoln Nunnally, or any steward, hunter, or connector in this matter.
3. I have explained (or will explain before any signing) that a transfer, trust, life estate, or deed change can affect Medicaid eligibility and estate recovery, and that Georgia’s “estate” for recovery is broader than a probate will.
4. I will not take instruction from Porchlight that conflicts with my client’s interest. Occupancy first. People are the purpose.
5. If I cannot take this file, I will say so in writing and will not sign these drafts.

Date: ________    Signature: ________________________    Printed: ________________________`,
  },
  {
    id: "georgia-summary",
    title: "Georgia educational summary",
    purpose: "Sourced facts the family already saw. Counsel keeps or strikes.",
    pile: "counsel",
    attorneyMustApprove: true,
    body: `${BANNER}

GEORGIA MEDICAID ESTATE RECOVERY — EDUCATIONAL SUMMARY

This is education, not advice. Sources are named. Strike any line you will not stand behind.

A. Recovery is after death. Georgia’s Medicaid Estate Recovery Program seeks reimbursement from the estate of a deceased Medicaid member. DCH says no recovery action is taken while the member is living in the home.
   Source: Georgia DCH, Medicaid Estate Recovery. https://medicaid.georgia.gov/programs/third-party-liability/medicaid-estate-recovery

B. Who it can apply to. A person of any age in a nursing facility or similar institution, and a person 55 or older who received nursing-home or home-and-community-based services paid by Medicaid.
   Source: DCH Estate Recovery FAQ (Sept 2025).

C. The $25,000 floor. Estates with a gross value of $25,000 or less are exempt. For deaths on or after July 1, 2018, the Commissioner also waives any claim against the first $25,000 of an estate otherwise subject to recovery, to prevent substantial and unreasonable hardship.
   Source: Ga. Comp. R. & Regs. 111-3-8-.04(18).

D. Spouse and child protections delay recovery while a surviving spouse is alive, while there is a living child under 21, and while there is a living child of any age who is blind or permanently and totally disabled under Title XIX. Additional delays can apply for a qualifying sibling or caregiving child still in the home.
   Source: 42 U.S.C. § 1396p(b)(2); Ga. Comp. R. & Regs. 111-3-8-.04(8)–(9).

E. Georgia counts more than a probate will: joint tenancy, survivorship, life estate, trust, annuity, IRA, homestead, transfer-on-death, and similar arrangements. A simple “put it in a trust” or “keep a life estate” is not, by itself, a shield. A trust provision that denies recovery for medical assistance is void under the DCH rules.
   Source: Ga. Comp. R. & Regs. Chapter 111-3-8; DCH FAQ.

F. The 60-month look-back is about qualifying, not the bill after death. Transfers for less than fair market value can trigger a penalty period of ineligibility. That rule is why Porchlight will not assemble a transfer packet if nursing-home Medicaid is already needed inside five years.
   Source: 42 U.S.C. § 1396p(c); Georgia ABD Medicaid transfer policy.

Counsel signature (only as to lines not struck): ________    Date: ________`,
  },
  {
    id: "lookback",
    title: "Look-back and crisis rule",
    purpose: "The app stops a transfer packet in a crisis. Counsel keeps that stop.",
    pile: "counsel",
    attorneyMustApprove: true,
    body: `${BANNER}

LOOK-BACK / CRISIS INSTRUCTION (DRAFT)

Home: {{address}}, {{county}} County, Georgia
Occupant: {{homeowner}}
Season named on intake: planning (5+ years) or crisis (do not generate a transfer packet).

1. If the occupant already needs nursing-home or similar Medicaid, or will need it inside 60 months, do not use Porchlight drafts to move title, gift the house, or create an under-market transfer.
2. Tell the family: “Don’t move title. Talk to an elder-law attorney now.” Porchlight’s crisis path says the same thing and does not produce a transfer packet.
3. Look-back counseling is yours. The app only refuses to assemble the wrong packet.
4. Hardship waivers, the $25,000 floor, and spouse/child delays are fact-specific. Do not let this app promise any of them.

Counsel: keep / rewrite below.

[ATTORNEY MUST APPROVE BEFORE PRODUCTION]`,
  },
  {
    id: "cover",
    title: "Routing cover sheet",
    purpose: "Hands the draft to a paralegal, then a supervising attorney. The app is not the lawyer.",
    pile: "stewardship",
    attorneyMustApprove: true,
    body: `${BANNER}

ROUTING COVER SHEET

To: Supervising elder-law attorney and paralegal
From: Porchlight Home Stewardship (intake only — not the practice of law)
Re: {{homeowner}} / {{address}}, {{county}} County, Georgia

Season: planning (5+ years). Crisis packets are not generated by this app.
Occupancy intent: stay {{stayYears}}.
Deed status (as stated by family, unverified): {{deed}}
Spouse in home: {{spouse}}
Child in home: {{childrenInHome}}
Family contact: {{adultChild}} · {{adultChildContact}}
Named remainder: {{remainder}}

Please, in this order:
(1) Confirm you represent the homeowner, not Porchlight.
(2) Verify title and facts.
(3) Counsel on Medicaid look-back and Georgia’s expanded estate.
(4) Open the Attorney desk. Sign or send back each draft. One item at a time.
(5) Record only if appropriate, and only after title is verified.

Flat review disclosed to the family: $1,800 to your office if they choose to file. County recording at cost.

The family was told this app does not practice law and does not promise a Medicaid result.

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]`,
  },
  {
    id: "occupancy",
    title: "Occupancy and use",
    purpose: "The homeowner keeps the right to live in the home for as long as they need it.",
    pile: "stewardship",
    attorneyMustApprove: true,
    body: `${BANNER}

OCCUPANCY AND USE AGREEMENT (DRAFT)

This draft is for counsel to finish. It is not a deed, not a lease to Porchlight, and not a Medicaid application.

Parties
Occupant: {{homeowner}}{{spouseLine}}
Home: {{address}}, {{county}} County, Georgia
Family contact: {{adultChild}} · {{adultChildContact}}
Steward named for later operating work only: Porchlight Home Stewardship

Recitals
A. Occupant lives in the Home as a primary residence and intends to stay {{stayYears}}.
B. Occupant asked for a plan so that occupancy is not sold out from under them, and so that family value is not eaten by silence or by a listing machine.
C. Porchlight does not take the house as a prize. Occupancy is $0 to Occupant.

Operative terms (for counsel to keep, strike, or rewrite)

1. Occupancy. Occupant may live in the Home as their primary residence for as long as they need it, including for so long as a qualifying spouse or caregiving household member needs it with them.
2. Not rent. Porchlight charges $0 occupancy to the person being protected. This is not a landlord-tenant relationship as to Occupant.
3. Quiet use. Occupant keeps ordinary quiet use: guests, garden, porch, mail, worship, and the rhythm of a home.
4. No forced move. Occupant is not required to move in order for any later affordable-rent or sale provision to begin. Those provisions stay dark until occupancy ends by Occupant’s choice, relocation that Occupant confirms in writing, or death, and only as an attorney-approved instrument allows.
5. No Medicaid promise. This draft does not transfer Medicaid eligibility, does not promise a look-back result, does not waive any right Occupant has under Georgia or federal law, and does not bind the Department of Community Health.
6. Independent counsel. Occupant has been told to have a Georgia elder-law attorney, who does not represent Porchlight, review this file before anything is signed or recorded.

Signature lines (do not date until counsel says so)

Occupant: ________________________  Date: ________
Spouse (if any): ________________________  Date: ________
Counsel (approving form, not promising a Medicaid result): ________________________  Ga. Bar: ________  Date: ________
Notary: as counsel requires.

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]`,
  },
  {
    id: "maintenance",
    title: "Maintenance covenant",
    purpose: "Upkeep is logged, billed at cost, and visible to the family.",
    pile: "stewardship",
    attorneyMustApprove: true,
    body: `${BANNER}

MAINTENANCE COVENANT (DRAFT)

Home: {{address}}, {{county}} County, Georgia
Occupant: {{homeowner}}
Family contact: {{adultChild}}
Steward (operating log only): Porchlight Home Stewardship

1. Necessary repairs, insurance, taxes, and ordinary upkeep are paid at documented cost. No markup.
2. Each expense is entered on the stewardship log with a date, payee, amount, and receipt note. Occupant and {{adultChild}} may inspect the log at any time.
3. Emergency work that protects occupancy — roof, heat, well, power, access — is authorized without waiting on a family meeting, then reported the same week.
4. Cosmetic work waits for Occupant’s yes.
5. This covenant does not make Porchlight the owner. It does not charge Occupant rent.

Counsel may add insurance minimums, tax-escrow, or a spending cap here: ________

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]`,
  },
  {
    id: "later-rent",
    title: "Later rent for affordable / operating use",
    purpose: "Only after occupancy ends, and only if the family agreed. Keeps the house a home for someone who needs one.",
    pile: "stewardship",
    attorneyMustApprove: true,
    body: `${BANNER}

LATER AFFORDABLE USE (DRAFT — DARK UNTIL OCCUPANCY ENDS)

Home: {{address}}
Occupant while this is dark: {{homeowner}}
Named remainder: {{remainder}}

1. This section does not apply while {{homeowner}} needs the Home.
2. After occupancy ends, if named beneficiaries agree in writing, the Home may be rented at an affordable operating rent rather than forced onto the open market.
3. Collected rent pays documented operating costs first, then the published stewardship operating fee (8% of rent collected, unless counsel writes a different number here: ______), then the remainder per the sale-proceeds waterfall as if it were income of the Home.
4. Prefer a household that will keep the porch light on — a worker, a caregiver, a neighbor — not a vacant investment. Not the highest bidder.
5. Named beneficiaries may instead choose a sale. Rent is never a trap.
6. Any later occupancy with a paying household is a separate attorney-approved fair-rent instrument, not this page.

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]`,
  },
  {
    id: "waterfall",
    title: "Sale-proceeds waterfall",
    purpose: "Family keeps what remains after documented costs and the published fee.",
    pile: "stewardship",
    attorneyMustApprove: true,
    body: `${BANNER}

SALE-PROCEEDS WATERFALL (DRAFT)

Home: {{address}}
Named remainder: {{remainder}}

On a later sale approved by the instrument and the named remainder, proceeds are applied in this order:

1. Ordinary closing costs and taxes due on the sale.
2. Documented stewardship operating costs not yet reimbursed (receipts required; no markup).
3. Published stewardship sale fee of 3.5% of sale price (or this number if counsel strikes 3.5%: ______).
4. Remainder to {{remainder}} as named beneficiaries, in equal shares unless a later attorney-approved designation says otherwise.

Porchlight does not keep residual equity. People are the purpose.
This is not a listing agreement and not dual agency.

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]`,
  },
  {
    id: "fee",
    title: "Stewardship fee disclosure",
    purpose: "The same numbers shown on the fees screen, bound into the packet.",
    pile: "stewardship",
    attorneyMustApprove: true,
    body: `${BANNER}

FEE DISCLOSURE (DRAFT)

Occupant {{homeowner}} and family contact {{adultChild}} were shown these numbers on screen before a packet was generated.

- Season check, intake, draft packet: $0
- Attorney / paralegal review and signature, if they choose to file: $1,800 flat, paid to the attorney’s office
- County recording: at cost
- Occupancy while the home is needed: $0
- Maintenance: documented cost, no markup
- Annual accounting: $240 / year
- Later affordable rent (only after occupancy ends): 8% of rent collected
- Later sale: 3.5% of sale price; remainder to named family / beneficiaries

No other fee is authorized by this draft unless counsel writes it here: ________

Occupant ack. (when counsel says so): ________________________  Date: ________
Family contact: ________________________  Date: ________
Counsel: ________________________  Date: ________

[ATTORNEY MUST APPROVE TEMPLATE TEXT AND DOLLAR AMOUNTS BEFORE PRODUCTION]`,
  },
  {
    id: "lease",
    title: "Fair-rent occupancy",
    purpose: "Georgia residential draft for a later paying household. Not a court paper.",
    pile: "rent",
    attorneyMustApprove: true,
    body: `${BANNER}

FAIR RENT OCCUPANCY (DRAFT — NOT AN EXECUTED LEASE)

This is a neighborly occupancy for a working household after an elder no longer needs the home, or for a house Porchlight already keeps. It is not a Medicaid instrument, not a sale, and not a dispossessory.

Premises: [address], [city], [county] County, Georgia
Household: [names]
Steward / landlord named for this occupancy: Porchlight Home Stewardship (or the owner counsel names)
Term: [start] to [end], then month-to-month unless counsel writes otherwise
Fair monthly rent: $[amount] (operating rent, not market max)
Deposit: $[amount]

1. Quiet use. Occupant keeps ordinary quiet use of the home.
2. Rent. Due on the first. Talk first if a week is hard. No late-fee theater unless counsel writes a lawful fee here: ______
3. Deposit. Held and accounted under O.C.G.A. § 44-7-30 through § 44-7-37 as counsel directs. Return or itemize as the statute requires (generally within one month after the tenancy ends — confirm current text).
4. Repair. Work that protects occupancy is done at documented cost. Occupant says when something is wrong. Cosmetic work waits.
5. Entry. Reasonable notice except emergency.
6. No self-help. No lock-out, no utility cut-off as a way to move someone. Georgia dispossessory is a court action (O.C.G.A. § 44-7-50 and following). This app does not file it.
7. Fair housing. This occupancy will not be used to disguise a credit or eviction mill. No Social Security number is collected in the Porchlight box.
8. Notices. Neighborly reminders and receipts are not court papers. A demand draft is a conversation record until counsel says otherwise.

Signatures (when counsel says so)
Occupant: ________________________  Date: ________
Owner / steward: ________________________  Date: ________
Counsel (form only): ________________________  Ga. Bar: ________  Date: ________

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]`,
  },
  {
    id: "deposit",
    title: "Deposit accounting",
    purpose: "Itemize or return. Not sent until counsel says so.",
    pile: "rent",
    attorneyMustApprove: true,
    body: `${BANNER}

SECURITY DEPOSIT ACCOUNTING (DRAFT)

Georgia generally requires a security deposit to be returned or itemized within one month after the tenancy ends. See O.C.G.A. § 44-7-31 and following. Confirm current text. This draft is not that notice until counsel says so.

Household: [name]
Premises: [address]
Move-out date: [date]
Deposit held: $[amount]
Deductions (each needs a receipt or a lawful basis counsel accepts):
  - ________________________  $______
  - ________________________  $______
Proposed return: $______
Condition notes: ________

Do not mail this until counsel dates it.

[ATTORNEY MUST APPROVE BEFORE THIS IS SENT]`,
  },
  {
    id: "demand",
    title: "Demand draft",
    purpose: "A conversation record. Must not look like a magistrate filing.",
    pile: "rent",
    attorneyMustApprove: true,
    body: `${BANNER}

DEMAND DRAFT — NOT A DISPOSSESSORY

This is a conversation record. It is not a magistrate filing. Georgia dispossessory is a separate court action under O.C.G.A. § 44-7-50 and following. Porchlight does not file it. Do not tape this to a door as if it were a court notice. Do not serve it unless counsel rewrites it as a lawful demand and tells you how.

Household: [name]
Home: [address]
Amount named: $[amount] for [period]
We asked for the rent or an honest plan. We talked first.

If counsel converts this into a demand required before a dispossessory, counsel will write the statutory language, the deadline, and the service method. Until then, this page stays in the file.

[ATTORNEY MUST APPROVE BEFORE ANY DEMAND IS USED]`,
  },
];

export function fillTemplate(body: string, values: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "—");
}

export const STEWARDSHIP_TEMPLATES = LOCKED_TEMPLATES.filter(
  (t) => t.pile === "stewardship",
);
