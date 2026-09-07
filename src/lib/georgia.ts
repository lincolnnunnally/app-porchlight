/**
 * Educational summary of Georgia Medicaid estate recovery.
 * Not legal advice. Every claim is sourced. Flagged for attorney review
 * before production copy is locked.
 */

export type Fact = {
  id: string;
  title: string;
  body: string;
  source: string;
  sourceUrl: string;
  attorneyMustApprove: true;
};

export const GEORGIA_FACTS: Fact[] = [
  {
    id: "after-death",
    title: "It happens after death, not while you are alive.",
    body: "Georgia’s Medicaid Estate Recovery Program seeks reimbursement from the estate of a deceased Medicaid member. The Department of Community Health says funds are recovered after death for the cost of qualifying long-term care and related services. No recovery action is taken while the member is living in the home.",
    source: "Georgia DCH, Medicaid Estate Recovery",
    sourceUrl:
      "https://medicaid.georgia.gov/programs/third-party-liability/medicaid-estate-recovery",
    attorneyMustApprove: true,
  },
  {
    id: "who",
    title: "Who it can apply to.",
    body: "It can apply to a person of any age who was in a nursing facility or similar medical institution, and to a person age 55 or older who received nursing-home or home-and-community-based services paid by Medicaid. Qualifying expenses can include nursing facility, personal care, home and community-based services, and hospital and prescription drugs tied to that care.",
    source: "Georgia DCH estate recovery FAQ, Sept 2025",
    sourceUrl:
      "https://medicaid.georgia.gov/document/document/estate-recovery-frequently-asked-questions-september-25-2025/download",
    attorneyMustApprove: true,
  },
  {
    id: "floor",
    title: "The $25,000 floor.",
    body: "Estates with a gross value of $25,000 or less are exempt. For deaths on or after July 1, 2018, the Commissioner also waives any claim against the first $25,000 of an estate that is otherwise subject to recovery, to prevent substantial and unreasonable hardship.",
    source: "Ga. Comp. R. & Regs. 111-3-8-.04(18); DCH overview",
    sourceUrl: "https://rules.sos.state.ga.us/gac/111-3-8-.04",
    attorneyMustApprove: true,
  },
  {
    id: "family",
    title: "Spouse and child protections delay recovery.",
    body: "Recovery is delayed while a surviving spouse is alive, while there is a living child under 21, and while there is a living child of any age who is blind or permanently and totally disabled under Title XIX. Additional delays can apply while a qualifying sibling or a caregiving child still lives in the home under the conditions in the DCH rules.",
    source: "42 U.S.C. § 1396p(b)(2); Ga. Comp. R. & Regs. 111-3-8-.04(8)–(9)",
    sourceUrl: "https://rules.sos.state.ga.us/gac/111-3-8-.04",
    attorneyMustApprove: true,
  },
  {
    id: "estate-def",
    title: "Georgia counts more than a probate will.",
    body: "For estate recovery, Georgia defines the estate as real and personal property under the probate code plus property passing by joint tenancy, right of survivorship, life estate, trust, annuity, IRA, homestead, transfer-on-death, or any other arrangement. A simple “put it in a trust” or “keep a life estate” is not, by itself, a shield. The DCH rules also say a trust provision that denies recovery for medical assistance is void.",
    source: "Ga. Comp. R. & Regs. 111-3-8; DCH FAQ",
    sourceUrl:
      "https://medicaid.georgia.gov/document/document/estate-recovery-frequently-asked-questions-september-25-2025/download",
    attorneyMustApprove: true,
  },
  {
    id: "lookback",
    title: "The 5-year look-back is about qualifying, not the bill after death.",
    body: "When someone applies for long-term-care Medicaid, Georgia looks back 60 months at transfers made for less than fair market value. Giving the house away inside that window can trigger a penalty period of ineligibility. That rule is separate from estate recovery, and it is why this service will not assemble a transfer packet if nursing-home Medicaid is already needed inside five years.",
    source: "42 U.S.C. § 1396p(c); Georgia ABD Medicaid transfer policy",
    sourceUrl: "https://pamms.dhs.ga.gov/dfcs/medicaid/2316/",
    attorneyMustApprove: true,
  },
];

export const OFFICIAL_LINKS = [
  {
    label: "Georgia Medicaid Estate Recovery",
    href: "https://medicaid.georgia.gov/programs/third-party-liability/medicaid-estate-recovery",
  },
  {
    label: "DCH rules, Chapter 111-3-8",
    href: "https://rules.sos.state.ga.us/gac/111-3-8",
  },
  {
    label: "Find a NAELA elder-law attorney",
    href: "https://www.naela.org/findlawyer",
  },
  {
    label: "Georgia Legal Services Program",
    href: "https://www.glsp.org/",
  },
];

export const NOT_LEGAL_ADVICE =
  "This is education, not legal advice. Porchlight does not practice law and does not promise any Medicaid result. A supervising Georgia elder-law attorney has to review your facts before anything is signed or recorded.";
