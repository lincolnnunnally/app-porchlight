import { useState } from "react";
import { CopyNote } from "./copy-note";
import { ObjectionNote, RaiseObjection } from "./objection";
import { Button } from "./ui/button";
import {
  objectionOpen,
  payRequestText,
  periodLabel,
  receiptText,
  type Lease,
  type Party,
  type RentalHome,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatMoney } from "@/lib/utils";

/**
 * What the household sees about rent, on the household desk and the Desk
 * renter seat alike: what is due, "I paid this", and a way to say a charge
 * is off that the manager has to answer on Payments.
 */
export function HouseholdRent({
  lease,
  home,
  from = "renter",
  showPayNote,
}: {
  lease: Lease;
  home: RentalHome | undefined;
  from?: Party;
  showPayNote?: boolean;
}) {
  const payments = useRentalStore((s) => s.payments);
  const claimPayment = useRentalStore((s) => s.claimPayment);
  const addNotice = useRentalStore((s) => s.addNotice);
  const objectPayment = useRentalStore((s) => s.objectPayment);
  const [sent, setSent] = useState<string | null>(null);

  const mine = payments.filter((p) => p.leaseId === lease.id);
  const due = mine.filter((p) => p.status === "due" || p.status === "late");
  const answered = mine.filter(
    (p) => p.objection && p.objection.outcome !== "open" && !due.includes(p),
  );
  const lastReceived = mine.filter((p) => p.status === "received").slice(0, 1);

  return (
    <section className="grid gap-3">
      <h2 className="font-display text-xl">Rent</h2>
      {due.length === 0 ? (
        <p className="text-sm text-muted">Nothing due right now. Thank you.</p>
      ) : (
        due.map((p) => (
          <article
            key={p.id}
            className="grid gap-2 rounded-lg border border-line bg-panel p-4"
          >
            <p className="font-display text-lg">
              {periodLabel(p.period)} · {formatMoney(p.amount)} · {p.status}
            </p>
            {p.claimedAt ? (
              <p className="text-sm text-teal">
                You told us you paid. Waiting on the porch ledger.
              </p>
            ) : null}
            <ObjectionNote objection={p.objection} />
            <div className="flex flex-wrap gap-2">
              {!p.claimedAt ? (
                <Button
                  size="sm"
                  onClick={() => {
                    claimPayment(p.id);
                    addNotice({
                      homeId: p.homeId,
                      leaseId: p.leaseId,
                      kind: "claim",
                      body: `${lease.household} says they paid ${periodLabel(p.period)}.`,
                    });
                    setSent("Told the ledger. Cash, Zelle, or check — they mark it received.");
                  }}
                >
                  I paid this
                </Button>
              ) : null}
              {!objectionOpen(p) ? (
                <RaiseObjection
                  label="Something is off"
                  placeholder="I paid $650 on the 3rd, cash on the porch. This still says due."
                  onSend={(reason) => {
                    objectPayment(p.id, from, reason);
                    setSent("Sent. The manager answers on the ledger and you will see it here.");
                  }}
                />
              ) : null}
            </div>
            {showPayNote && home ? (
              <CopyNote
                text={payRequestText(lease, home, p.period, p.amount)}
                label="Copy how to pay"
              />
            ) : null}
          </article>
        ))
      )}
      {answered.length ? (
        <div className="grid gap-2">
          <p className="text-sm text-muted">Answered</p>
          {answered.slice(0, 3).map((p) => (
            <div key={p.id} className="grid gap-1">
              <p className="text-sm">
                {periodLabel(p.period)} · {formatMoney(p.amount)} · {p.status}
              </p>
              <ObjectionNote objection={p.objection} />
            </div>
          ))}
        </div>
      ) : null}
      {showPayNote && home
        ? lastReceived.map((p) => (
            <CopyNote
              key={p.id}
              text={receiptText(p, lease, home)}
              label="Copy last receipt"
            />
          ))
        : null}
      {sent ? <p className="text-sm text-teal">{sent}</p> : null}
    </section>
  );
}
