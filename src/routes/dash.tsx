import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageThread } from "@/components/message-thread";
import { RentalDisclaimer } from "@/components/attorney-flag";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useHuntStore } from "@/lib/hunt-store";
import {
  HOME_INTENTS,
  LISTING_STATUSES,
  SEATS,
  homeLabel,
  homeRevenue,
  ownerLabel,
  periodLabel,
  type CashKind,
  type HomeIntent,
  type ListingStatus,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/dash")({ component: DashPage });

function DashPage() {
  const deskRole = useRentalStore((s) => s.deskRole);
  const setDeskRole = useRentalStore((s) => s.setDeskRole);
  const role = deskRole ?? "manager";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">Desk</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">
          See what matters. Talk when you need to.
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          One desk, three seats. This device does not log anyone in. Switch
          seats the way you’d hand a notebook across a porch.
        </p>
      </div>
      <nav aria-label="Seat" className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {SEATS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setDeskRole(s.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm",
              role === s.id
                ? "border-gold bg-gold font-semibold text-night"
                : "border-line text-muted",
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>
      <p className="text-sm text-muted">
        {SEATS.find((s) => s.id === role)?.blurb}
      </p>
      {role === "renter" ? <RenterSeat /> : null}
      {role === "owner" ? <OwnerSeat /> : null}
      {role === "manager" ? <ManagerSeat /> : null}
      <RentalDisclaimer />
    </div>
  );
}

function RenterSeat() {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const payments = useRentalStore((s) => s.payments);
  const work = useRentalStore((s) => s.work);
  const deskLeaseId = useRentalStore((s) => s.deskLeaseId);
  const setDeskLease = useRentalStore((s) => s.setDeskLease);
  const claimPayment = useRentalStore((s) => s.claimPayment);
  const upsertWork = useRentalStore((s) => s.upsertWork);
  const [title, setTitle] = useState("");
  const active = leases.filter((l) => l.status === "active" || l.status === "draft");
  const lease = active.find((l) => l.id === deskLeaseId) ?? active[0];
  const home = homes.find((h) => h.id === lease?.homeId);
  const due = payments.filter(
    (p) => p.leaseId === lease?.id && (p.status === "due" || p.status === "late"),
  );

  if (!lease) {
    return (
      <p className="text-muted">
        No occupancy yet.{" "}
        <Link to="/search" className="text-gold-2">
          Search for a house
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <Field label="Preview as">
        <Select value={lease.id} onChange={(e) => setDeskLease(e.target.value)}>
          {active.map((l) => (
            <option key={l.id} value={l.id}>
              {l.household} · {homeLabel(homes, l.homeId)}
            </option>
          ))}
        </Select>
      </Field>
      <section className="grid gap-2 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-display text-2xl">
          {home ? `${home.address}, ${home.city}` : "—"}
        </h2>
        <p className="text-muted">
          {lease.household} · {formatMoney(lease.monthly)} / mo
        </p>
        <p className="text-sm text-muted">{home?.payInstructions}</p>
      </section>
      <section className="grid gap-2">
        <h2 className="font-display text-xl">Rent</h2>
        {due.length === 0 ? (
          <p className="text-sm text-muted">Nothing due right now.</p>
        ) : (
          due.map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel p-4"
            >
              <p>
                {periodLabel(p.period)} · {formatMoney(p.amount)}
                {p.claimedAt ? " · you told us you paid" : ""}
              </p>
              {!p.claimedAt ? (
                <Button size="sm" onClick={() => claimPayment(p.id)}>
                  I paid this
                </Button>
              ) : null}
            </article>
          ))
        )}
      </section>
      <form
        className="grid gap-3 rounded-xl border border-line bg-panel p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          upsertWork({
            homeId: lease.homeId,
            title,
            detail: "",
            status: "needed",
            cost: 0,
            who: lease.household,
            vendorId: "",
            scheduledAt: null,
          });
          setTitle("");
        }}
      >
        <h2 className="font-display text-xl">Something needs hands</h2>
        <Field label="What is wrong">
          <Input
            value={title}
            placeholder="Sink drip"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Button type="submit" variant="teal">
          Ask for the work
        </Button>
        {work.filter((w) => w.homeId === lease.homeId).length ? (
          <ul className="text-sm text-muted">
            {work
              .filter((w) => w.homeId === lease.homeId)
              .map((w) => (
                <li key={w.id}>
                  {w.title} · {w.status}
                </li>
              ))}
          </ul>
        ) : null}
      </form>
      <MessageThread homeId={lease.homeId} from="renter" />
      <Link
        to="/search"
        className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
      >
        Search for another house
      </Link>
    </div>
  );
}

function OwnerSeat() {
  const owners = useRentalStore((s) => s.owners);
  const homes = useRentalStore((s) => s.homes);
  const payments = useRentalStore((s) => s.payments);
  const work = useRentalStore((s) => s.work);
  const applications = useRentalStore((s) => s.applications);
  const cashouts = useRentalStore((s) => s.cashouts);
  const deskOwnerId = useRentalStore((s) => s.deskOwnerId);
  const setDeskOwner = useRentalStore((s) => s.setDeskOwner);
  const setListing = useRentalStore((s) => s.setListing);
  const approveApplication = useRentalStore((s) => s.approveApplication);
  const askCashOut = useRentalStore((s) => s.askCashOut);
  const markCashInHunt = useRentalStore((s) => s.markCashInHunt);
  const addHouse = useHuntStore((s) => s.addHouse);
  const owner = owners.find((o) => o.id === deskOwnerId) ?? owners[0];
  const mine = homes.filter((h) => h.ownerId === owner?.id);
  const [talkId, setTalkId] = useState(mine[0]?.id ?? "");
  const [cashHome, setCashHome] = useState(mine[0]?.id ?? "");
  const [kind, setKind] = useState<CashKind>("sale");
  const [askPrice, setAskPrice] = useState("");
  const [cashNote, setCashNote] = useState("");
  const pending = applications.filter(
    (a) =>
      !a.ownerApproved &&
      a.status !== "passed" &&
      a.status !== "housed" &&
      mine.some((h) => h.id === a.homeId),
  );
  const totals = useMemo(() => {
    return mine.reduce(
      (acc, h) => {
        const r = homeRevenue(payments, work, h.id);
        return {
          inAmt: acc.inAmt + r.inAmt,
          outAmt: acc.outAmt + r.outAmt,
          due: acc.due + r.due,
          net: acc.net + r.net,
        };
      },
      { inAmt: 0, outAmt: 0, due: 0, net: 0 },
    );
  }, [mine, payments, work]);

  if (!owner) {
    return (
      <p className="text-muted">
        No owner yet.{" "}
        <Link to="/owners" className="text-gold-2">
          Bring a house
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      <Field label="Owner">
        <Select
          value={owner.id}
          onChange={(e) => setDeskOwner(e.target.value)}
        >
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </Field>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="In" value={formatMoney(totals.inAmt)} />
        <Stat label="Work cost" value={formatMoney(totals.outAmt)} />
        <Stat label="Still due" value={formatMoney(totals.due)} />
        <Stat label="Net" value={formatMoney(totals.net)} />
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-xl">Your houses</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted">None on this seat yet.</p>
        ) : (
          mine.map((h) => {
            const r = homeRevenue(payments, work, h.id);
            return (
              <article
                key={h.id}
                className="grid gap-3 rounded-xl border border-line bg-panel p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl">{h.address}</h3>
                    <p className="text-sm text-muted">
                      {h.city} · {h.bedsBaths} · {h.status} ·{" "}
                      {formatMoney(h.fairRent)} / mo
                    </p>
                  </div>
                  <p className="text-sm text-gold-2">
                    Net {formatMoney(r.net)}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Market">
                    <Select
                      value={h.listing}
                      onChange={(e) =>
                        setListing(h.id, e.target.value as ListingStatus)
                      }
                    >
                      {LISTING_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Intent">
                    <Select
                      value={h.intent}
                      onChange={(e) =>
                        setListing(h.id, h.listing, e.target.value as HomeIntent)
                      }
                    >
                      {HOME_INTENTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <button
                  type="button"
                  className="min-h-11 self-start rounded-full border border-line px-3 text-sm"
                  onClick={() => setTalkId(h.id)}
                >
                  Talk about this house
                </button>
              </article>
            );
          })
        )}
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-xl">Sign off on tenants</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">
            No one waiting on your yes. Manager still walks the house.
          </p>
        ) : (
          pending.map((a) => (
            <article
              key={a.id}
              className="grid gap-2 rounded-lg border border-line bg-panel p-4"
            >
              <h3 className="font-display text-lg">{a.name}</h3>
              <p className="text-sm text-muted">
                {a.household} · {homeLabel(homes, a.homeId)} · {a.phone}
              </p>
              <p className="text-sm text-muted">{a.incomeNote || a.notes}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="teal"
                  onClick={() => approveApplication(a.id, true)}
                >
                  Sign off
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => approveApplication(a.id, false)}
                >
                  Pass
                </Button>
              </div>
            </article>
          ))
        )}
      </section>
      <form
        className="grid gap-3 rounded-xl border border-line bg-panel p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const id = askCashOut(cashHome, kind, askPrice, cashNote);
          if (!id) return;
          setAskPrice("");
          setCashNote("");
        }}
      >
        <h2 className="font-display text-xl">Cash out or sell</h2>
        <p className="text-sm text-muted">
          You decide when. A sale can go quietly into the hunt — not onto a
          listing mill.
        </p>
        <Field label="House">
          <Select
            value={cashHome}
            onChange={(e) => setCashHome(e.target.value)}
          >
            {mine.map((h) => (
              <option key={h.id} value={h.id}>
                {h.address}, {h.city}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="What you want">
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as CashKind)}
          >
            <option value="sale">Quiet sale</option>
            <option value="cash_out">Cash out (keep talking)</option>
          </Select>
        </Field>
        <Field label="Ask (plain words or a number)">
          <Input
            value={askPrice}
            placeholder="$95,000 or what would serve you"
            onChange={(e) => setAskPrice(e.target.value)}
          />
        </Field>
        <Field label="Note">
          <Textarea
            rows={2}
            value={cashNote}
            onChange={(e) => setCashNote(e.target.value)}
          />
        </Field>
        <Button type="submit">Ask to cash out</Button>
      </form>
      {cashouts.filter((c) => c.ownerId === owner.id).length ? (
        <ul className="grid gap-2">
          {cashouts
            .filter((c) => c.ownerId === owner.id)
            .map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel p-4"
              >
                <p className="text-sm">
                  {c.kind === "sale" ? "Sale" : "Cash out"} ·{" "}
                  {homeLabel(homes, c.homeId)} · {c.askPrice || "talk first"} ·{" "}
                  {c.status}
                </p>
                {c.status === "asked" && c.kind === "sale" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const home = homes.find((h) => h.id === c.homeId);
                      if (!home) return;
                      const huntId = addHouse({
                        address: home.address,
                        city: home.city,
                        owner: owner.name,
                        bedsBaths: home.bedsBaths,
                        offer: c.askPrice,
                        notes: `Owner cash-out. ${c.note}`,
                        stage: "watching",
                      });
                      markCashInHunt(c.id, huntId);
                    }}
                  >
                    Put it in the hunt
                  </Button>
                ) : null}
              </li>
            ))}
        </ul>
      ) : null}
      {talkId ? <MessageThread homeId={talkId} from="owner" /> : null}
    </div>
  );
}

function ManagerSeat() {
  const homes = useRentalStore((s) => s.homes);
  const owners = useRentalStore((s) => s.owners);
  const payments = useRentalStore((s) => s.payments);
  const work = useRentalStore((s) => s.work);
  const applications = useRentalStore((s) => s.applications);
  const waitlist = useRentalStore((s) => s.waitlist);
  const [talkId, setTalkId] = useState(homes[0]?.id ?? "");
  const due = payments.filter((p) => p.status === "due" || p.status === "late");
  const openWork = work.filter((w) => w.status !== "done");
  const pending = applications.filter(
    (a) => a.status !== "housed" && a.status !== "passed",
  );

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Homes" value={String(homes.length)} />
        <Stat label="Rent due" value={String(due.length)} />
        <Stat label="Open work" value={String(openWork.length)} />
        <Stat
          label="Waitlist"
          value={String(
            waitlist.filter(
              (p) => p.status === "interested" || p.status === "contacted",
            ).length,
          )}
        />
      </section>
      <section className="grid gap-3">
        {homes.map((h) => (
          <article
            key={h.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line bg-panel p-4"
          >
            <div>
              <h2 className="font-display text-xl">{h.address}</h2>
              <p className="text-sm text-muted">
                {h.city} · {h.status} · {h.listing.replace("_", " ")} ·{" "}
                {ownerLabel(owners, h.ownerId)}
              </p>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-full border border-line px-3 text-sm"
              onClick={() => setTalkId(h.id)}
            >
              Talk
            </button>
          </article>
        ))}
      </section>
      <section className="grid gap-2">
        <h2 className="font-display text-xl">Needs a walk or a sign-off</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Quiet on applications.</p>
        ) : (
          pending.map((a) => (
            <p key={a.id} className="text-sm text-muted">
              {a.name} · {homeLabel(homes, a.homeId)} · walked {a.walked ? "yes" : "no"} ·
              owner {a.ownerApproved ? "signed" : "waiting"}
            </p>
          ))
        )}
      </section>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/rent"
          className={cn(buttonVariants({ variant: "teal" }), "no-underline")}
        >
          Open rentals
        </Link>
        <Link
          to="/search"
          className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
        >
          Search
        </Link>
      </div>
      {talkId ? <MessageThread homeId={talkId} from="manager" /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3">
      <b className="block font-display text-2xl text-gold-2 tabular-nums">
        {value}
      </b>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
