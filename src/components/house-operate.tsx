import { useState } from "react";
import { HouseholdRent } from "./household-rent";
import { HouseholdWork } from "./household-work";
import { ListingShare } from "./listing-share";
import { MessageThread } from "./message-thread";
import { Button } from "./ui/button";
import { Field, Input, Select } from "./ui/field";
import {
  LISTING_STATUSES,
  isoInput,
  type Lease,
  type ListingStatus,
  type RentalHome,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatMoney } from "@/lib/utils";

/**
 * Run this house without leaving it: occupancy, lease, rent ledger, work,
 * public listing. Same records as Rent / Desk.
 */
export function HouseOperate({
  home,
  lease,
  seat,
}: {
  home: RentalHome;
  lease?: Lease;
  seat: "owner" | "occupant";
}) {
  const upsertLease = useRentalStore((s) => s.upsertLease);
  const generateDues = useRentalStore((s) => s.generateDues);
  const setPayStatus = useRentalStore((s) => s.setPayStatus);
  const setListing = useRentalStore((s) => s.setListing);
  const payments = useRentalStore((s) => s.payments);
  const [household, setHousehold] = useState("");
  const [phone, setPhone] = useState("");
  const [monthly, setMonthly] = useState(String(home.fairRent || 650));
  const [note, setNote] = useState<string | null>(null);
  const dueHere = payments.filter(
    (p) => p.homeId === home.id && (p.status === "due" || p.status === "late"),
  );

  if (seat === "occupant") {
    if (!lease) {
      return (
        <p className="text-sm text-muted">
          No occupancy on this house yet. The owner writes a lease first.
        </p>
      );
    }
    return (
      <div className="grid gap-5">
        <p className="text-sm text-muted">
          {lease.household} · {formatMoney(lease.monthly)} / mo · {home.payInstructions}
        </p>
        <HouseholdRent lease={lease} home={home} showPayNote />
        <HouseholdWork homeId={home.id} who={lease.household} />
        <MessageThread homeId={home.id} from="renter" />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <Field label="On the market?">
        <Select
          value={home.listing}
          onChange={(e) =>
            setListing(home.id, e.target.value as ListingStatus)
          }
        >
          {LISTING_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <ListingShare home={home} />

      {lease ? (
        <div className="grid gap-3">
          <p className="text-sm text-muted">
            {lease.household}
            {lease.phone ? ` · ${lease.phone}` : ""} ·{" "}
            {formatMoney(lease.monthly)} / mo · {lease.status}
            {dueHere.length ? ` · ${dueHere.length} due` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const n = generateDues();
                setNote(
                  n
                    ? `Opened ${n} month${n === 1 ? "" : "s"} on the ledger.`
                    : "This month is already on the ledger.",
                );
              }}
            >
              Open this month’s rent
            </Button>
          </div>
          <HouseholdRent lease={lease} home={home} from="manager" showPayNote />
          {dueHere.map((p) =>
            p.claimedAt && p.status !== "received" ? (
              <Button
                key={p.id}
                size="sm"
                onClick={() => setPayStatus(p.id, "received")}
              >
                Mark {p.period} received
              </Button>
            ) : null,
          )}
        </div>
      ) : (
        <form
          className="grid gap-3 rounded-lg border border-line bg-bg-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!household.trim()) return;
            const start = isoInput(Date.now());
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            upsertLease({
              homeId: home.id,
              household: household.trim(),
              phone: phone.trim(),
              start,
              end: isoInput(endDate.getTime()),
              monthly: Number(monthly) || 0,
              deposit: Number(monthly) || 0,
              depositStatus: "none",
              status: "draft",
              terms:
                "Fair rent occupancy. Occupant keeps ordinary quiet use. Repairs at documented cost. Attorney still signs.",
            });
            setHousehold("");
            setNote("Draft lease is on this house. Ack house facts before keys.");
          }}
        >
          <h3 className="font-display text-xl">Write a lease on this house</h3>
          <p className="text-sm text-muted">
            A draft occupancy. Not a court filing. Cash, Zelle, or check —
            we confirm it on the ledger. We do not take the rent through a card.
          </p>
          <Field label="Household name">
            <Input
              required
              value={household}
              placeholder="Reed family"
              onChange={(e) => setHousehold(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Fair monthly rent">
            <Input
              inputMode="decimal"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
            />
          </Field>
          <Button type="submit">Save draft lease</Button>
        </form>
      )}

      <HouseholdWork
        homeId={home.id}
        who="Owner"
        from="manager"
      />
      <MessageThread homeId={home.id} from="owner" />
      {note ? <p className="text-sm text-teal">{note}</p> : null}
    </div>
  );
}
