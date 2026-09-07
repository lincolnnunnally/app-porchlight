export type HomeStatus = "occupied" | "vacant" | "turning";
export type ListingStatus = "available" | "off_market";
export type HomeIntent = "rent" | "sale" | "both";
export type SeatRole = "renter" | "owner" | "manager";
export type Party = SeatRole;
export type LeaseStatus = "draft" | "active" | "ended";
export type PayStatus = "due" | "received" | "late" | "waived";
export type PayMethod = "cash" | "check" | "zelle" | "money_order" | "ach_note";
export type WorkStatus = "needed" | "doing" | "done";
export type WaitStatus =
  | "interested"
  | "contacted"
  | "offered"
  | "housed"
  | "passed";
export type AppStatus = "applied" | "walking" | "offered" | "housed" | "passed";
export type DepositStatus = "none" | "held" | "returned" | "applied";
export type NoticeKind =
  | "pay_request"
  | "receipt"
  | "reminder"
  | "claim"
  | "demand_draft"
  | "deposit_draft";
export type MoveKind = "in" | "out";
export type CashKind = "sale" | "cash_out";
export type CashStatus = "asked" | "in_hunt" | "done";

export type RentalHome = {
  id: string;
  address: string;
  city: string;
  bedsBaths: string;
  status: HomeStatus;
  fairRent: number;
  notes: string;
  payInstructions: string;
  ownerId: string;
  listing: ListingStatus;
  intent: HomeIntent;
};

export type Owner = {
  id: string;
  name: string;
  phone: string;
  notes: string;
};

export type Message = {
  id: string;
  homeId: string;
  at: number;
  from: Party;
  body: string;
};

export type CashOut = {
  id: string;
  homeId: string;
  ownerId: string;
  kind: CashKind;
  status: CashStatus;
  askPrice: string;
  note: string;
  at: number;
  huntId: string;
};

export type Lease = {
  id: string;
  homeId: string;
  household: string;
  phone: string;
  start: string;
  end: string;
  monthly: number;
  deposit: number;
  depositStatus: DepositStatus;
  status: LeaseStatus;
  terms: string;
};

export type Payment = {
  id: string;
  homeId: string;
  leaseId: string;
  period: string;
  amount: number;
  due: number;
  receivedAt: number | null;
  claimedAt: number | null;
  status: PayStatus;
  method: PayMethod;
  note: string;
};

export type WorkOrder = {
  id: string;
  homeId: string;
  title: string;
  detail: string;
  status: WorkStatus;
  cost: number;
  who: string;
  vendorId: string;
  scheduledAt: number | null;
};

export type WaitPerson = {
  id: string;
  name: string;
  phone: string;
  household: string;
  wants: string;
  notes: string;
  status: WaitStatus;
  homeId: string;
  addedAt: number;
  referredBy: string;
};

export type Application = {
  id: string;
  homeId: string;
  waitId: string;
  name: string;
  phone: string;
  household: string;
  incomeNote: string;
  references: string;
  walked: boolean;
  ownerApproved: boolean;
  status: AppStatus;
  notes: string;
};

export type Vendor = {
  id: string;
  name: string;
  trade: string;
  phone: string;
  notes: string;
};

export type Notice = {
  id: string;
  homeId: string;
  leaseId: string;
  kind: NoticeKind;
  at: number;
  body: string;
};

export type CheckItem = { id: string; label: string; done: boolean };

export type MoveRecord = {
  id: string;
  homeId: string;
  leaseId: string;
  kind: MoveKind;
  date: string;
  depositHeld: number;
  depositReturned: number;
  condition: string;
  notes: string;
  items: CheckItem[];
};

export type CalItem = {
  id: string;
  at: number;
  title: string;
  detail: string;
  kind: string;
  href: "/rent/payments" | "/rent/leases" | "/rent/work" | "/rent/apply";
};

export const LISTING_STATUSES: { id: ListingStatus; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "off_market", label: "Off market" },
];

export const HOME_INTENTS: { id: HomeIntent; label: string }[] = [
  { id: "rent", label: "Fair rent" },
  { id: "sale", label: "Quiet sale" },
  { id: "both", label: "Rent or sale" },
];

export const SEATS: { id: SeatRole; label: string; blurb: string }[] = [
  { id: "renter", label: "Renter", blurb: "Your home, rent, and a way to talk." },
  { id: "owner", label: "Owner", blurb: "Revenue, tenants, on or off market, cash out." },
  { id: "manager", label: "Manager", blurb: "The handful of houses in operation." },
];

export const HOME_STATUSES: { id: HomeStatus; label: string }[] = [
  { id: "occupied", label: "Occupied" },
  { id: "turning", label: "Turning" },
  { id: "vacant", label: "Vacant" },
];

export const LEASE_STATUSES: { id: LeaseStatus; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "active", label: "Active" },
  { id: "ended", label: "Ended" },
];

export const PAY_STATUSES: { id: PayStatus; label: string }[] = [
  { id: "due", label: "Due" },
  { id: "received", label: "Received" },
  { id: "late", label: "Late" },
  { id: "waived", label: "Waived" },
];

export const PAY_METHODS: { id: PayMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "check", label: "Check" },
  { id: "zelle", label: "Zelle" },
  { id: "money_order", label: "Money order" },
  { id: "ach_note", label: "Bank note / ACH (recorded)" },
];

export const WORK_STATUSES: { id: WorkStatus; label: string }[] = [
  { id: "needed", label: "Needed" },
  { id: "doing", label: "In the work" },
  { id: "done", label: "Done" },
];

export const WAIT_STATUSES: { id: WaitStatus; label: string }[] = [
  { id: "interested", label: "Interested" },
  { id: "contacted", label: "Contacted" },
  { id: "offered", label: "Offered" },
  { id: "housed", label: "Housed" },
  { id: "passed", label: "Passed" },
];

export const APP_STATUSES: { id: AppStatus; label: string }[] = [
  { id: "applied", label: "Applied" },
  { id: "walking", label: "Walking the house" },
  { id: "offered", label: "Offered" },
  { id: "housed", label: "Housed" },
  { id: "passed", label: "Passed" },
];

export const DEPOSIT_STATUSES: { id: DepositStatus; label: string }[] = [
  { id: "none", label: "None" },
  { id: "held", label: "Held" },
  { id: "returned", label: "Returned" },
  { id: "applied", label: "Applied to rent" },
];

export function monthStamp(offset: number) {
  const d = new Date();
  d.setDate(1);
  d.setHours(12, 0, 0, 0);
  d.setMonth(d.getMonth() + offset);
  return d;
}

export function periodKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function periodLabel(period: string) {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
}

export function periodDue(period: string) {
  const [y, m] = period.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, 1, 12).getTime();
}

export function parseIso(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1, 12).getTime();
}

export function isoInput(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const last = monthStamp(-1);
const now = monthStamp(0);
const inThree = Date.now() + 1000 * 60 * 60 * 24 * 3;

const MOVE_IN_ITEMS: CheckItem[] = [
  { id: "k", label: "Keys on the nail", done: true },
  { id: "s", label: "Smoke alarm tested", done: true },
  { id: "w", label: "Water and heat honest", done: true },
  { id: "d", label: "Deposit received", done: true },
  { id: "o", label: "Occupancy signed (attorney)", done: true },
];

export const MOVE_IN_BLANK: CheckItem[] = [
  { id: "k", label: "Keys on the nail", done: false },
  { id: "s", label: "Smoke alarm tested", done: false },
  { id: "w", label: "Water and heat honest", done: false },
  { id: "d", label: "Deposit received", done: false },
  { id: "o", label: "Occupancy signed (attorney)", done: false },
];

export const MOVE_OUT_BLANK: CheckItem[] = [
  { id: "walk", label: "Walk the house together", done: false },
  { id: "keys", label: "Keys back", done: false },
  { id: "cond", label: "Condition noted", done: false },
  { id: "dep", label: "Deposit itemized / returned (attorney)", done: false },
  { id: "vacant", label: "Home marked vacant — call the waitlist", done: false },
];

export const RENTAL_SEED = {
  homes: [
    {
      id: "r1",
      address: "312 First Ave",
      city: "Vidalia",
      bedsBaths: "2 / 1",
      status: "occupied" as HomeStatus,
      fairRent: 650,
      notes:
        "Repaired with our hands last spring. Reed family keeps the porch light on. Fair rent, not market max.",
      payInstructions:
        "Cash on the porch first Saturday, or Zelle 912-555-0100. Memo: Reed / 312 First.",
      ownerId: "o1",
      listing: "off_market" as ListingStatus,
      intent: "rent" as HomeIntent,
    },
    {
      id: "r2",
      address: "8 Oak St",
      city: "Lyons",
      bedsBaths: "3 / 1",
      status: "turning" as HomeStatus,
      fairRent: 725,
      notes:
        "Paint and a patient kitchen. Vacant in two weeks. Call the waitlist before anyone lists it.",
      payInstructions:
        "Cash or Zelle 912-555-0100. Memo: Oak St. Talk first if a week is hard.",
      ownerId: "o1",
      listing: "available" as ListingStatus,
      intent: "rent" as HomeIntent,
    },
    {
      id: "r3",
      address: "21 Cherry St",
      city: "Vidalia",
      bedsBaths: "2 / 1",
      status: "vacant" as HomeStatus,
      fairRent: 600,
      notes:
        "One-story. Honest heat. Ready for a family who asked to be told.",
      payInstructions:
        "Cash or Zelle 912-555-0100. Memo: Cherry St.",
      ownerId: "o1",
      listing: "available" as ListingStatus,
      intent: "both" as HomeIntent,
    },
  ] satisfies RentalHome[],
  leases: [
    {
      id: "l1",
      homeId: "r1",
      household: "Reed family",
      phone: "912-555-0144",
      start: "2026-04-01",
      end: "2027-03-31",
      monthly: 650,
      deposit: 650,
      depositStatus: "held" as DepositStatus,
      status: "active" as LeaseStatus,
      terms:
        "Month-to-month after the first year. Occupant keeps ordinary quiet use. Repairs at documented cost. No late-fee theater — talk first.",
    },
  ] satisfies Lease[],
  payments: [
    {
      id: "p1",
      homeId: "r1",
      leaseId: "l1",
      period: periodKey(last),
      amount: 650,
      due: last.getTime(),
      receivedAt: last.getTime() + 1000 * 60 * 60 * 24 * 3,
      claimedAt: last.getTime() + 1000 * 60 * 60 * 24 * 3,
      status: "received" as PayStatus,
      method: "cash" as PayMethod,
      note: "Cash, porch, receipt given.",
    },
    {
      id: "p2",
      homeId: "r1",
      leaseId: "l1",
      period: periodKey(now),
      amount: 650,
      due: now.getTime(),
      receivedAt: null,
      claimedAt: null,
      status: "due" as PayStatus,
      method: "cash" as PayMethod,
      note: "",
    },
  ] satisfies Payment[],
  work: [
    {
      id: "w1",
      homeId: "r1",
      title: "Porch rail screws",
      detail: "Reed mentioned a wobble. Hardware-store run.",
      status: "needed" as WorkStatus,
      cost: 12,
      who: "Hands — Lincoln",
      vendorId: "v1",
      scheduledAt: null,
    },
    {
      id: "w2",
      homeId: "r2",
      title: "Kitchen paint and a patient cabinet",
      detail: "Turn the unit before the waitlist walk-through. Do not over-improve.",
      status: "doing" as WorkStatus,
      cost: 180,
      who: "Hands",
      vendorId: "v1",
      scheduledAt: inThree,
    },
  ] satisfies WorkOrder[],
  waitlist: [
    {
      id: "n1",
      name: "Tanya Miles",
      phone: "912-555-0190",
      household: "Mom + two kids",
      wants: "2–3 bed, Lyons or Vidalia, under $750",
      notes: "ChurchConnect referral. Works the onion plant second shift.",
      status: "offered" as WaitStatus,
      homeId: "r2",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 21,
      referredBy: "Pastor Ellis, First Baptist Lyons",
    },
    {
      id: "n2",
      name: "Cal Ortiz",
      phone: "912-555-0112",
      household: "Couple",
      wants: "Anything with a porch and honest heat",
      notes: "Helped on a repair Saturday. Quiet, pays on time if the rent is fair.",
      status: "contacted" as WaitStatus,
      homeId: "r2",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
      referredBy: "",
    },
    {
      id: "n3",
      name: "June Harrell",
      phone: "912-555-0166",
      household: "Grandmother + grandson",
      wants: "One-story, Vidalia",
      notes: "Not a scramble. She asked to be told if a light comes on.",
      status: "interested" as WaitStatus,
      homeId: "",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
      referredBy: "Connector",
    },
  ] satisfies WaitPerson[],
  applications: [
    {
      id: "a1",
      homeId: "r2",
      waitId: "n1",
      name: "Tanya Miles",
      phone: "912-555-0190",
      household: "Mom + two kids",
      incomeNote:
        "Second shift at the onion plant. They named $725 themselves. No credit pull.",
      references: "Pastor Ellis, First Baptist Lyons",
      walked: false,
      ownerApproved: false,
      status: "applied" as AppStatus,
      notes: "From the waitlist. Walk 8 Oak when the paint dries.",
    },
  ] satisfies Application[],
  vendors: [
    {
      id: "v1",
      name: "Lincoln",
      trade: "Hands",
      phone: "",
      notes: "Owner. Repair with your hands. Do not over-improve.",
    },
    {
      id: "v2",
      name: "Ray Pell",
      trade: "Plumbing",
      phone: "912-555-0177",
      notes: "Does not overcharge a porch-light house.",
    },
  ] satisfies Vendor[],
  notices: [
    {
      id: "t1",
      homeId: "r1",
      leaseId: "l1",
      kind: "pay_request" as NoticeKind,
      at: Date.now() - 1000 * 60 * 60 * 24 * 2,
      body: "",
    },
  ] satisfies Notice[],
  moves: [
    {
      id: "m1",
      homeId: "r1",
      leaseId: "l1",
      kind: "in" as MoveKind,
      date: "2026-04-01",
      depositHeld: 650,
      depositReturned: 0,
      condition: "Honest 2/1. New smoke alarm. Porch needs a later rail screw.",
      notes: "Keys on the nail.",
      items: MOVE_IN_ITEMS,
    },
  ] satisfies MoveRecord[],
  owners: [
    {
      id: "o1",
      name: "Porchlight Steward",
      phone: "912-555-0100",
      notes: "Lincoln. Repair with your hands. Fair rent, not market max.",
    },
    {
      id: "o2",
      name: "Ellis family",
      phone: "912-555-0133",
      notes: "Considering a quiet sale or fair rent. No listing machine.",
    },
  ] satisfies Owner[],
  messages: [
    {
      id: "g1",
      homeId: "r1",
      at: Date.now() - 1000 * 60 * 60 * 24 * 2,
      from: "manager" as Party,
      body: "Porch rail is on the board. Hardware-store run this week.",
    },
    {
      id: "g2",
      homeId: "r1",
      at: Date.now() - 1000 * 60 * 60 * 18,
      from: "renter" as Party,
      body: "Thank you. We noticed it Saturday. No rush if the screws hold.",
    },
  ] satisfies Message[],
  cashouts: [] as CashOut[],
  deskLeaseId: "l1",
  deskRole: "manager" as SeatRole,
  deskOwnerId: "o1",
};

// Fill notice body after helpers exist below via a getter on seed use.
export function bedsOf(bedsBaths: string) {
  const n = parseInt(bedsBaths, 10);
  return Number.isFinite(n) ? n : 0;
}

export function isSearchable(home: RentalHome) {
  return home.listing === "available" && home.status !== "occupied";
}

export function ownerInviteNote(name: string) {
  const who = name.trim() || "neighbor";
  return `Dear ${who},

A porch light is a small honest thing.

If you have a house in Vidalia or Toombs and you are tired of the listing machine, sit with us. Sell quietly — no realtor tax if you don’t want one. Or keep the house, rent it fairly to a family already waiting, and cash out when you want.

If someone still lives there, they stay. Occupancy first. We do not take houses.

Porchlight
porchlight.unitedundergod.org`;
}

export function ownerLabel(owners: Owner[], id: string, fallback = "Unassigned") {
  return owners.find((o) => o.id === id)?.name ?? fallback;
}

export function homeRevenue(
  payments: { homeId: string; amount: number; status: PayStatus }[],
  work: { homeId: string; cost: number }[],
  homeId: string,
) {
  const inAmt = payments
    .filter((p) => p.homeId === homeId && p.status === "received")
    .reduce((n, p) => n + p.amount, 0);
  const outAmt = work
    .filter((w) => w.homeId === homeId)
    .reduce((n, w) => n + w.cost, 0);
  const due = payments
    .filter((p) => p.homeId === homeId && (p.status === "due" || p.status === "late"))
    .reduce((n, p) => n + p.amount, 0);
  return { inAmt, outAmt, due, net: inAmt - outAmt };
}

export function homeLabel(
  homes: RentalHome[],
  id: string,
  fallback = "Any home",
) {
  const h = homes.find((x) => x.id === id);
  return h ? `${h.address}, ${h.city}` : fallback;
}

export function waitlistNote(person: WaitPerson, home?: RentalHome) {
  const place = home
    ? `${home.address} in ${home.city}`
    : "a house we keep for working families";
  return `Hello ${person.name.split(" ")[0]},

A porch light is coming on at ${place}. Fair rent, repaired with our hands, no listing game.

You asked to be told. If you still need a home, we can walk it this week. No pressure.

Porchlight`;
}

export function leaseDraft(lease: Lease, home?: RentalHome) {
  return `FAIR RENT OCCUPANCY (DRAFT — NOT AN EXECUTED LEASE)

Home: ${home ? `${home.address}, ${home.city}` : "[address]"}
Household: ${lease.household || "[household]"}
Term: ${lease.start || "[start]"} to ${lease.end || "[end]"}
Monthly rent: $${lease.monthly || 0} (fair operating rent, not market max)
Deposit: $${lease.deposit || 0} (${lease.depositStatus})

1. Occupant keeps ordinary quiet use of the home.
2. Rent is due on the first. Talk first if a week is hard. No late-fee theater.
3. Repairs that protect occupancy are done at documented cost.
4. This is not a Medicaid instrument and not a sale.

[ATTORNEY MUST APPROVE TEMPLATE TEXT BEFORE PRODUCTION]

${lease.terms || ""}`;
}

export function receiptText(
  payment: Payment,
  lease?: Lease,
  home?: RentalHome,
) {
  const method =
    PAY_METHODS.find((m) => m.id === payment.method)?.label ?? payment.method;
  return `PORCHLIGHT RECEIPT (not a bank statement)

Household: ${lease?.household ?? "—"}
Home: ${home ? `${home.address}, ${home.city}` : "—"}
Period: ${periodLabel(payment.period)}
Amount: $${payment.amount}
How: ${method}
When: ${payment.receivedAt ? new Date(payment.receivedAt).toLocaleDateString() : "pending"}
Note: ${payment.note || "—"}

Thank you. The porch light stays on.`;
}

export function payRequestText(
  lease: Lease,
  home: RentalHome | undefined,
  period: string,
  amount: number,
) {
  return `Hello ${lease.household.split(" ")[0]},

Rent for ${periodLabel(period)} is $${amount} for ${home ? `${home.address}, ${home.city}` : "your home"}.

${home?.payInstructions || "Cash on the porch, or the Zelle we already use."}

Talk first if a week is hard. No late-fee theater.

Porchlight`;
}

export function reminderText(
  lease: Lease,
  home: RentalHome | undefined,
  payment: Payment,
) {
  return `Hello ${lease.household.split(" ")[0]},

Checking in on ${periodLabel(payment.period)} rent ($${payment.amount}) at ${home ? home.address : "the house"}.

This is a neighborly reminder, not a court paper. If the week is hard, say so. We would rather have a plan than a scene.

Porchlight`;
}

export function demandDraftText(
  lease: Lease,
  home: RentalHome | undefined,
  payment: Payment,
) {
  return `DEMAND DRAFT — NOT A DISPOSSESSORY — ATTORNEY MUST APPROVE

This is a conversation record. It is not a magistrate filing. Georgia dispossessory is a separate court action. Porchlight does not file it.

Household: ${lease.household}
Home: ${home ? `${home.address}, ${home.city}` : "—"}
Amount named: $${payment.amount} for ${periodLabel(payment.period)}
We asked for the rent or an honest plan. We talked first.

Do not serve this paper. Do not tape it to a door as if it were a court notice.

[ATTORNEY MUST APPROVE BEFORE ANY DEMAND IS USED]`;
}

export function depositReturnDraft(move: MoveRecord, lease?: Lease) {
  return `DEPOSIT ACCOUNTING DRAFT — ATTORNEY MUST APPROVE

Georgia generally requires a security deposit to be returned or itemized within one month after the tenancy ends (see O.C.G.A. § 44-7-31 and following). This draft is not that notice until counsel says so.

Household: ${lease?.household ?? "—"}
Move-out date: ${move.date}
Deposit held: $${move.depositHeld}
Proposed return: $${move.depositReturned}
Condition: ${move.condition || "—"}
Notes: ${move.notes || "—"}

[ATTORNEY MUST APPROVE BEFORE THIS IS SENT]`;
}

export function collectCalendar(input: {
  homes: RentalHome[];
  leases: Lease[];
  payments: Payment[];
  work: WorkOrder[];
  moves: MoveRecord[];
  applications: Application[];
}): CalItem[] {
  const items: CalItem[] = [];
  for (const p of input.payments) {
    items.push({
      id: `pay-${p.id}`,
      at: p.due,
      title: `${periodLabel(p.period)} rent · ${p.status}`,
      detail: `${homeLabel(input.homes, p.homeId)} · $${p.amount}`,
      kind: "rent",
      href: "/rent/payments",
    });
  }
  for (const l of input.leases) {
    if (l.start) {
      items.push({
        id: `ls-${l.id}`,
        at: parseIso(l.start),
        title: `Lease starts · ${l.household}`,
        detail: homeLabel(input.homes, l.homeId),
        kind: "lease",
        href: "/rent/leases",
      });
    }
    if (l.end) {
      items.push({
        id: `le-${l.id}`,
        at: parseIso(l.end),
        title: `Lease ends · ${l.household}`,
        detail: "Talk early. Call the waitlist before anyone lists it.",
        kind: "lease",
        href: "/rent/leases",
      });
    }
  }
  for (const w of input.work) {
    if (w.scheduledAt) {
      items.push({
        id: `wk-${w.id}`,
        at: w.scheduledAt,
        title: w.title,
        detail: `${homeLabel(input.homes, w.homeId)} · ${w.who}`,
        kind: "work",
        href: "/rent/work",
      });
    }
  }
  for (const m of input.moves) {
    const [y, mo, d] = m.date.split("-").map(Number);
    items.push({
      id: `mv-${m.id}`,
      at: new Date(y, (mo || 1) - 1, d || 1, 12).getTime(),
      title: m.kind === "in" ? "Move-in" : "Move-out",
      detail: homeLabel(input.homes, m.homeId),
      kind: "move",
      href: "/rent/leases",
    });
  }
  for (const a of input.applications) {
    if (a.status === "walking" || a.status === "applied") {
      items.push({
        id: `ap-${a.id}`,
        at: inThree,
        title: `Walk with ${a.name}`,
        detail: homeLabel(input.homes, a.homeId),
        kind: "walk",
        href: "/rent/apply",
      });
    }
  }
  return items.sort((a, b) => a.at - b.at);
}
