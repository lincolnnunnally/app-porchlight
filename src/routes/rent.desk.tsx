import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RentalDisclaimer } from "@/components/attorney-flag";
import { CopyNote } from "@/components/copy-note";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { HouseFactsSheet } from "@/components/house-facts";
import {
  homeLabel,
  payRequestText,
  periodLabel,
  receiptText,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/rent/desk")({ component: DeskPage });

function DeskPage() {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const payments = useRentalStore((s) => s.payments);
  const work = useRentalStore((s) => s.work);
  const notices = useRentalStore((s) => s.notices);
  const deskLeaseId = useRentalStore((s) => s.deskLeaseId);
  const setDeskLease = useRentalStore((s) => s.setDeskLease);
  const claimPayment = useRentalStore((s) => s.claimPayment);
  const upsertWork = useRentalStore((s) => s.upsertWork);
  const addNotice = useRentalStore((s) => s.addNotice);
  const ackFacts = useRentalStore((s) => s.ackFacts);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const active = leases.filter((l) => l.status === "active" || l.status === "draft");
  const lease =
    active.find((l) => l.id === deskLeaseId) ?? active[0] ?? leases[0];
  const home = homes.find((h) => h.id === lease?.homeId);
  const mine = payments.filter((p) => p.leaseId === lease?.id);
  const due = mine.filter((p) => p.status === "due" || p.status === "late");
  const myWork = work.filter((w) => w.homeId === lease?.homeId);
  const myNotes = notices.filter((n) => n.leaseId === lease?.id);

  if (!lease) {
    return (
      <div className="grid gap-4">
        <h1 className="font-display text-3xl">Household desk</h1>
        <p className="text-muted">No occupancy yet. Start with a lease.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Household desk</h1>
        <p className="mt-1 max-w-2xl text-muted">
          What the family sees: rent due, how to pay, ask for a repair. This is
          a desk on this device — not a login. Anyone here can switch household.
        </p>
      </div>
      <Field label="Preview as">
        <Select
          value={lease.id}
          onChange={(e) => setDeskLease(e.target.value)}
        >
          {active.map((l) => (
            <option key={l.id} value={l.id}>
              {l.household} · {homeLabel(homes, l.homeId)}
            </option>
          ))}
        </Select>
      </Field>
      <section className="grid gap-2 rounded-lg border border-line bg-panel p-5">
        <p className="text-sm tracking-wide text-gold-2 uppercase">Your home</p>
        <h2 className="font-display text-2xl">
          {home ? `${home.address}, ${home.city}` : "—"}
        </h2>
        <p className="text-muted">
          {lease.household} · {formatMoney(lease.monthly)} / mo
        </p>
        <p className="leading-relaxed text-muted">{home?.payInstructions}</p>
        {home ? (
          <HouseFactsSheet
            home={home}
            party="renter"
            ackName={lease.household}
            onAck={() => ackFacts(home.id, "renter", lease.household)}
          />
        ) : null}
      </section>
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
              ) : (
                <Button
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
              )}
              <CopyNote
                text={payRequestText(lease, home, p.period, p.amount)}
                label="Copy how to pay"
              />
            </article>
          ))
        )}
        {mine
          .filter((p) => p.status === "received")
          .slice(0, 1)
          .map((p) => (
            <CopyNote
              key={p.id}
              text={receiptText(p, lease, home)}
              label="Copy last receipt"
            />
          ))}
      </section>
      <section className="grid gap-3 rounded-lg border border-line bg-panel p-5">
        <h2 className="font-display text-xl">Something needs hands</h2>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            upsertWork({
              homeId: lease.homeId,
              title,
              detail,
              status: "needed",
              cost: 0,
              who: lease.household,
              vendorId: "",
              scheduledAt: null,
            });
            setTitle("");
            setDetail("");
            setSent("Work is on the board.");
          }}
        >
          <Field label="What is wrong">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Porch rail wobble"
            />
          </Field>
          <Field label="A little more">
            <Textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="teal">
            Ask for the work
          </Button>
        </form>
        {myWork.length ? (
          <ul className="grid gap-1 text-sm text-muted">
            {myWork.map((w) => (
              <li key={w.id}>
                {w.title} · {w.status}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      {myNotes.length ? (
        <section className="grid gap-2">
          <h2 className="font-display text-xl">Notes</h2>
          <ul className="grid gap-2 text-sm text-muted">
            {myNotes.slice(0, 6).map((n) => (
              <li key={n.id} className="whitespace-pre-wrap rounded-md border border-line p-3">
                {n.body || n.kind}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {sent ? <p className="text-sm text-teal">{sent}</p> : null}
      <RentalDisclaimer />
    </div>
  );
}
