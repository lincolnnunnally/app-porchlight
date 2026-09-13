import { createFileRoute, Link } from "@tanstack/react-router";
import { RentalDisclaimer } from "@/components/attorney-flag";
import { HouseholdRent } from "@/components/household-rent";
import { HouseholdWork } from "@/components/household-work";
import { MessageThread } from "@/components/message-thread";
import { buttonVariants } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { HouseFactsSheet } from "@/components/house-facts";
import { homeLabel } from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/rent/desk")({ component: DeskPage });

function DeskPage() {
  const homes = useRentalStore((s) => s.homes);
  const owners = useRentalStore((s) => s.owners);
  const leases = useRentalStore((s) => s.leases);
  const notices = useRentalStore((s) => s.notices);
  const deskLeaseId = useRentalStore((s) => s.deskLeaseId);
  const setDeskLease = useRentalStore((s) => s.setDeskLease);
  const ackFacts = useRentalStore((s) => s.ackFacts);

  const active = leases.filter((l) => l.status === "active" || l.status === "draft");
  const lease =
    active.find((l) => l.id === deskLeaseId) ?? active[0] ?? leases[0];
  const home = homes.find((h) => h.id === lease?.homeId);
  const owner = owners.find((o) => o.id === home?.ownerId);
  const steward = owners.find((o) => o.id === "o1");
  const myNotes = notices.filter((n) => n.leaseId === lease?.id);

  if (!lease) {
    return (
      <div className="grid gap-4">
        <h1 className="font-display text-3xl">Household desk</h1>
        <p className="text-muted">No occupancy yet. Start with a lease.</p>
        <Link
          to="/rent/leases"
          className={cn(buttonVariants(), "self-start no-underline")}
        >
          Open leases
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Household desk</h1>
        <p className="mt-1 max-w-2xl text-muted">
          What the family sees: rent due, how to pay, ask for a repair, and a
          way to say when something is off. This is a desk on this device — not
          a login. Anyone here can switch household.
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
        <div className="grid gap-1 rounded-md border border-line bg-bg-2 px-4 py-3 text-sm">
          <p className="text-xs tracking-wide text-gold-2 uppercase">Who to call</p>
          {owner ? (
            <p>
              Owner: {owner.name}
              {owner.phone ? ` · ${owner.phone}` : ""}
            </p>
          ) : null}
          {steward && steward.id !== owner?.id ? (
            <p>
              Porchlight: {steward.name}
              {steward.phone ? ` · ${steward.phone}` : ""}
            </p>
          ) : null}
          <p className="text-muted">
            Talk first if a week is hard. Notes you leave below reach the owner
            and the manager on the Desk.
          </p>
        </div>
        {home ? (
          <HouseFactsSheet
            home={home}
            party="renter"
            leaseId={lease.id}
            ackName={lease.household}
            onAck={() => ackFacts(home.id, "renter", lease.household, lease.id)}
          />
        ) : null}
      </section>
      <HouseholdRent lease={lease} home={home} showPayNote />
      <HouseholdWork homeId={lease.homeId} who={lease.household} />
      <MessageThread homeId={lease.homeId} from="renter" />
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
      <RentalDisclaimer />
    </div>
  );
}
