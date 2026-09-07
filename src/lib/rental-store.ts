import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MOVE_IN_BLANK,
  MOVE_OUT_BLANK,
  RENTAL_SEED,
  periodKey,
  periodDue,
  payRequestText,
  type AppStatus,
  type Application,
  type CashOut,
  type CashKind,
  type CheckItem,
  type DepositStatus,
  type HomeIntent,
  type HomeStatus,
  type Lease,
  type LeaseStatus,
  type ListingStatus,
  type Message,
  type MoveKind,
  type MoveRecord,
  type Notice,
  type Owner,
  type Party,
  type PayMethod,
  type PayStatus,
  type Payment,
  type RentalHome,
  type SeatRole,
  type Vendor,
  type WaitPerson,
  type WaitStatus,
  type WorkOrder,
  type WorkStatus,
} from "./rental";
import { uid } from "./utils";

type RentalData = {
  homes: RentalHome[];
  leases: Lease[];
  payments: Payment[];
  work: WorkOrder[];
  waitlist: WaitPerson[];
  applications: Application[];
  vendors: Vendor[];
  notices: Notice[];
  moves: MoveRecord[];
  owners: Owner[];
  messages: Message[];
  cashouts: CashOut[];
  deskLeaseId: string;
  deskRole: SeatRole;
  deskOwnerId: string;
};

type RentalActions = {
  upsertHome: (row: Omit<RentalHome, "id"> & { id?: string }) => string;
  setHomeStatus: (id: string, status: HomeStatus) => void;
  upsertLease: (row: Omit<Lease, "id"> & { id?: string }) => string;
  setLeaseStatus: (id: string, status: LeaseStatus) => void;
  setDepositStatus: (id: string, status: DepositStatus) => void;
  upsertPayment: (row: Omit<Payment, "id"> & { id?: string }) => string;
  setPayStatus: (id: string, status: PayStatus, method?: PayMethod) => void;
  setPayMethod: (id: string, method: PayMethod) => void;
  claimPayment: (id: string) => void;
  generateDues: () => number;
  upsertWork: (row: Omit<WorkOrder, "id"> & { id?: string }) => string;
  setWorkStatus: (id: string, status: WorkStatus) => void;
  upsertWait: (
    row: Omit<WaitPerson, "id" | "addedAt"> & { id?: string; addedAt?: number },
  ) => string;
  setWaitStatus: (id: string, status: WaitStatus) => void;
  upsertApp: (row: Omit<Application, "id"> & { id?: string }) => string;
  setAppStatus: (id: string, status: AppStatus) => void;
  setWalked: (id: string, walked: boolean) => void;
  offerFromWait: (waitId: string) => string | null;
  houseApplication: (appId: string) => string | null;
  approveApplication: (id: string, approved: boolean) => void;
  setListing: (id: string, listing: ListingStatus, intent?: HomeIntent) => void;
  upsertOwner: (row: Omit<Owner, "id"> & { id?: string }) => string;
  addMessage: (homeId: string, from: Party, body: string) => string;
  askCashOut: (homeId: string, kind: CashKind, askPrice: string, note: string) => string | null;
  markCashInHunt: (id: string, huntId: string) => void;
  upsertVendor: (row: Omit<Vendor, "id"> & { id?: string }) => string;
  addNotice: (row: Omit<Notice, "id" | "at"> & { at?: number }) => string;
  startMove: (leaseId: string, kind: MoveKind) => string | null;
  toggleMoveItem: (moveId: string, itemId: string) => void;
  patchMove: (id: string, patch: Partial<MoveRecord>) => void;
  setDeskLease: (id: string) => void;
  setDeskRole: (role: SeatRole) => void;
  setDeskOwner: (id: string) => void;
};

function patchList<T extends { id: string }>(
  list: T[],
  next: T,
): T[] {
  const i = list.findIndex((h) => h.id === next.id);
  return i >= 0 ? list.map((h) => (h.id === next.id ? next : h)) : [next, ...list];
}

const seededNotices: Notice[] = RENTAL_SEED.notices.map((n) => {
  if (n.body) return n;
  const lease = RENTAL_SEED.leases.find((l) => l.id === n.leaseId);
  const home = RENTAL_SEED.homes.find((h) => h.id === n.homeId);
  const pay = RENTAL_SEED.payments.find((p) => p.status === "due");
  return {
    ...n,
    body: lease
      ? payRequestText(lease, home, pay?.period ?? periodKey(new Date()), pay?.amount ?? 650)
      : n.body,
  };
});

const EMPTY: RentalData = {
  ...RENTAL_SEED,
  notices: seededNotices,
};

export const useRentalStore = create<RentalData & RentalActions>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      upsertHome: (row) => {
        const id = row.id ?? uid("r");
        set((s) => ({ homes: patchList(s.homes, { ...row, id }) }));
        return id;
      },
      setHomeStatus: (id, status) =>
        set((s) => ({
          homes: s.homes.map((h) => (h.id === id ? { ...h, status } : h)),
        })),
      upsertLease: (row) => {
        const id = row.id ?? uid("l");
        set((s) => ({ leases: patchList(s.leases, { ...row, id }) }));
        return id;
      },
      setLeaseStatus: (id, status) =>
        set((s) => ({
          leases: s.leases.map((h) => (h.id === id ? { ...h, status } : h)),
        })),
      setDepositStatus: (id, status) =>
        set((s) => ({
          leases: s.leases.map((h) =>
            h.id === id ? { ...h, depositStatus: status } : h,
          ),
        })),
      upsertPayment: (row) => {
        const id = row.id ?? uid("p");
        set((s) => ({ payments: patchList(s.payments, { ...row, id }) }));
        return id;
      },
      setPayStatus: (id, status, method) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  method: method ?? p.method,
                  receivedAt:
                    status === "received" ? p.receivedAt ?? Date.now() : null,
                }
              : p,
          ),
        })),
      setPayMethod: (id, method) =>
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, method } : p)),
        })),
      claimPayment: (id) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, claimedAt: Date.now() } : p,
          ),
        })),
      generateDues: () => {
        const period = periodKey(new Date());
        let added = 0;
        set((s) => {
          const extra: Payment[] = [];
          for (const lease of s.leases.filter((l) => l.status === "active")) {
            if (s.payments.some((p) => p.leaseId === lease.id && p.period === period)) {
              continue;
            }
            extra.push({
              id: uid("p"),
              homeId: lease.homeId,
              leaseId: lease.id,
              period,
              amount: lease.monthly,
              due: periodDue(period),
              receivedAt: null,
              claimedAt: null,
              status: "due",
              method: "cash",
              note: "",
            });
          }
          added = extra.length;
          return extra.length ? { payments: [...extra, ...s.payments] } : {};
        });
        return added;
      },
      upsertWork: (row) => {
        const id = row.id ?? uid("w");
        set((s) => ({ work: patchList(s.work, { ...row, id }) }));
        return id;
      },
      setWorkStatus: (id, status) =>
        set((s) => ({
          work: s.work.map((h) => (h.id === id ? { ...h, status } : h)),
        })),
      upsertWait: (row) => {
        const id = row.id ?? uid("n");
        set((s) => {
          const prev = s.waitlist.find((h) => h.id === id);
          const next: WaitPerson = {
            ...row,
            referredBy: row.referredBy ?? prev?.referredBy ?? "",
            id,
            addedAt: row.addedAt ?? prev?.addedAt ?? Date.now(),
          };
          return { waitlist: patchList(s.waitlist, next) };
        });
        return id;
      },
      setWaitStatus: (id, status) =>
        set((s) => ({
          waitlist: s.waitlist.map((h) => (h.id === id ? { ...h, status } : h)),
        })),
      upsertApp: (row) => {
        const id = row.id ?? uid("a");
        set((s) => ({ applications: patchList(s.applications, { ...row, id }) }));
        return id;
      },
      setAppStatus: (id, status) =>
        set((s) => ({
          applications: s.applications.map((h) =>
            h.id === id ? { ...h, status } : h,
          ),
        })),
      setWalked: (id, walked) =>
        set((s) => ({
          applications: s.applications.map((h) =>
            h.id === id ? { ...h, walked, status: walked && h.status === "applied" ? "walking" : h.status } : h,
          ),
        })),
      offerFromWait: (waitId) => {
        const person = get().waitlist.find((p) => p.id === waitId);
        if (!person) return null;
        const existing = get().applications.find(
          (a) => a.waitId === waitId && a.status !== "passed" && a.status !== "housed",
        );
        if (existing) {
          set((s) => ({
            waitlist: s.waitlist.map((p) =>
              p.id === waitId ? { ...p, status: "offered" } : p,
            ),
          }));
          return existing.id;
        }
        const id = uid("a");
        set((s) => ({
          waitlist: s.waitlist.map((p) =>
            p.id === waitId ? { ...p, status: "offered" } : p,
          ),
          applications: [
            {
              id,
              homeId: person.homeId,
              waitId,
              name: person.name,
              phone: person.phone,
              household: person.household,
              incomeNote: "",
              references: person.referredBy,
              walked: false,
              status: "applied",
              ownerApproved: false,
              notes: person.notes,
            },
            ...s.applications,
          ],
        }));
        return id;
      },
      houseApplication: (appId) => {
        const app = get().applications.find((a) => a.id === appId);
        if (!app || !app.ownerApproved) return null;
        const home = get().homes.find((h) => h.id === app.homeId);
        const leaseId = uid("l");
        const start = new Date();
        const end = new Date();
        end.setFullYear(end.getFullYear() + 1);
        const pad = (n: number) => String(n).padStart(2, "0");
        const iso = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const monthly = home?.fairRent ?? 0;
        const lease: Lease = {
          id: leaseId,
          homeId: app.homeId,
          household: app.household || app.name,
          phone: app.phone,
          start: iso(start),
          end: iso(end),
          monthly,
          deposit: monthly,
          depositStatus: "held",
          status: "draft",
          terms: "Fair rent occupancy. Talk first. Attorney still signs.",
        };
        const move: MoveRecord = {
          id: uid("m"),
          homeId: app.homeId,
          leaseId,
          kind: "in",
          date: iso(start),
          depositHeld: monthly,
          depositReturned: 0,
          condition: "",
          notes: `From application ${app.name}`,
          items: MOVE_IN_BLANK.map((i) => ({ ...i })),
        };
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === appId ? { ...a, status: "housed" } : a,
          ),
          waitlist: s.waitlist.map((p) =>
            p.id === app.waitId ? { ...p, status: "housed" } : p,
          ),
          leases: [lease, ...s.leases],
          moves: [move, ...s.moves],
          homes: s.homes.map((h) =>
            h.id === app.homeId
              ? { ...h, status: "occupied" as HomeStatus, listing: "off_market" }
              : h,
          ),
        }));
        return leaseId;
      },
      approveApplication: (id, approved) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ownerApproved: approved,
                  status: approved
                    ? a.status === "passed"
                      ? a.status
                      : "offered"
                    : "passed",
                }
              : a,
          ),
        })),
      setListing: (id, listing, intent) =>
        set((s) => ({
          homes: s.homes.map((h) =>
            h.id === id ? { ...h, listing, intent: intent ?? h.intent } : h,
          ),
        })),
      upsertOwner: (row) => {
        const id = row.id ?? uid("o");
        set((s) => ({ owners: patchList(s.owners, { ...row, id }) }));
        return id;
      },
      addMessage: (homeId, from, body) => {
        const id = uid("g");
        set((s) => ({
          messages: [
            { id, homeId, from, body, at: Date.now() },
            ...s.messages,
          ],
        }));
        return id;
      },
      askCashOut: (homeId, kind, askPrice, note) => {
        const home = get().homes.find((h) => h.id === homeId);
        if (!home) return null;
        const id = uid("c");
        set((s) => ({
          cashouts: [
            {
              id,
              homeId,
              ownerId: home.ownerId,
              kind,
              status: "asked",
              askPrice,
              note,
              at: Date.now(),
              huntId: "",
            },
            ...s.cashouts,
          ],
          homes: s.homes.map((h) =>
            h.id === homeId
              ? {
                  ...h,
                  listing: kind === "sale" ? "available" : h.listing,
                  intent:
                    kind === "sale"
                      ? h.intent === "rent"
                        ? "both"
                        : h.intent
                      : h.intent,
                }
              : h,
          ),
        }));
        return id;
      },
      markCashInHunt: (id, huntId) =>
        set((s) => ({
          cashouts: s.cashouts.map((c) =>
            c.id === id ? { ...c, status: "in_hunt", huntId } : c,
          ),
        })),
      upsertVendor: (row) => {
        const id = row.id ?? uid("v");
        set((s) => ({ vendors: patchList(s.vendors, { ...row, id }) }));
        return id;
      },
      addNotice: (row) => {
        const id = uid("t");
        set((s) => ({
          notices: [{ ...row, id, at: row.at ?? Date.now() }, ...s.notices],
        }));
        return id;
      },
      startMove: (leaseId, kind) => {
        const lease = get().leases.find((l) => l.id === leaseId);
        if (!lease) return null;
        const existing = get().moves.find(
          (m) => m.leaseId === leaseId && m.kind === kind,
        );
        if (existing) return existing.id;
        const id = uid("m");
        const items: CheckItem[] =
          kind === "in"
            ? MOVE_IN_BLANK.map((i) => ({ ...i }))
            : MOVE_OUT_BLANK.map((i) => ({ ...i }));
        set((s) => ({
          moves: [
            {
              id,
              homeId: lease.homeId,
              leaseId,
              kind,
              date: new Date().toISOString().slice(0, 10),
              depositHeld: lease.deposit,
              depositReturned: kind === "out" ? lease.deposit : 0,
              condition: "",
              notes: "",
              items,
            },
            ...s.moves,
          ],
        }));
        return id;
      },
      toggleMoveItem: (moveId, itemId) =>
        set((s) => ({
          moves: s.moves.map((m) =>
            m.id === moveId
              ? {
                  ...m,
                  items: m.items.map((i) =>
                    i.id === itemId ? { ...i, done: !i.done } : i,
                  ),
                }
              : m,
          ),
        })),
      patchMove: (id, patch) =>
        set((s) => ({
          moves: s.moves.map((m) => (m.id === id ? { ...m, ...patch, id } : m)),
        })),
      setDeskLease: (id) => set({ deskLeaseId: id }),
      setDeskRole: (role) => set({ deskRole: role }),
      setDeskOwner: (id) => set({ deskOwnerId: id }),
    }),
    {
      name: "porchlight.rent.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<RentalData>;
        const homes = (p.homes ?? current.homes).map((h) => ({
          ...h,
          payInstructions: h.payInstructions ?? "",
          ownerId: h.ownerId ?? "o1",
          listing: h.listing ?? (h.status === "occupied" ? "off_market" : "available"),
          intent: h.intent ?? "rent",
        }));
        const leases = (p.leases ?? current.leases).map((l) => ({
          ...l,
          depositStatus: l.depositStatus ?? ("held" as DepositStatus),
        }));
        const payments = (p.payments ?? current.payments).map((x) => ({
          ...x,
          method: x.method ?? ("cash" as PayMethod),
          claimedAt: x.claimedAt ?? null,
        }));
        const work = (p.work ?? current.work).map((w) => ({
          ...w,
          vendorId: w.vendorId ?? "",
          scheduledAt: w.scheduledAt ?? null,
        }));
        const waitlist = (p.waitlist ?? current.waitlist).map((n) => ({
          ...n,
          referredBy: n.referredBy ?? "",
        }));
        return {
          ...current,
          ...p,
          homes,
          leases,
          payments,
          work,
          waitlist,
          applications: (p.applications ?? current.applications).map((a) => ({
            ...a,
            ownerApproved: a.ownerApproved ?? false,
          })),
          vendors: p.vendors ?? current.vendors,
          notices: p.notices ?? current.notices,
          moves: p.moves ?? current.moves,
          owners: p.owners ?? current.owners,
          messages: p.messages ?? current.messages,
          cashouts: p.cashouts ?? current.cashouts,
          deskLeaseId: p.deskLeaseId ?? current.deskLeaseId,
          deskRole: p.deskRole ?? current.deskRole,
          deskOwnerId: p.deskOwnerId ?? current.deskOwnerId,
        };
      },
    },
  ),
);
