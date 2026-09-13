import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { HouseFactsFields } from "@/components/house-facts";
import {
  EMPTY_HOUSE_FACTS,
  type HouseFacts,
} from "@/lib/house-facts";
import {
  HOME_INTENTS,
  HOME_STATUSES,
  LISTING_STATUSES,
  type HomeIntent,
  type HomeStatus,
  type ListingStatus,
  type RentalHome,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/rent/")({ component: RentHomes });

function RentHomes() {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const payments = useRentalStore((s) => s.payments);
  const waitlist = useRentalStore((s) => s.waitlist);
  const work = useRentalStore((s) => s.work);
  const applications = useRentalStore((s) => s.applications);
  const upsertHome = useRentalStore((s) => s.upsertHome);
  const [editing, setEditing] = useState<RentalHome | null | "new">(null);

  const due = payments.filter((p) => p.status === "due" || p.status === "late");
  const openWork = work.filter((w) => w.status !== "done");
  const waiting = waitlist.filter(
    (p) => p.status === "interested" || p.status === "contacted",
  );
  const openApps = applications.filter(
    (a) => a.status !== "housed" && a.status !== "passed",
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Homes in operation</h1>
          <p className="mt-1 max-w-2xl text-muted">
            After a hunt or after occupancy ends: who lives there, what is due,
            what needs hands, who is waiting. Fair rent. Not market max.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>Add a rental</Button>
      </div>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Homes" value={String(homes.length)} />
        <Stat
          label="Occupied"
          value={String(homes.filter((h) => h.status === "occupied").length)}
        />
        <Stat label="Rent due" value={String(due.length)} />
        <Stat label="Open applications" value={String(openApps.length)} />
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        {homes.map((h) => {
          const lease = leases.find(
            (l) => l.homeId === h.id && l.status === "active",
          );
          const open = openWork.filter((w) => w.homeId === h.id).length;
          const waitingHere = waiting.filter(
            (p) => p.homeId === h.id || !p.homeId,
          ).length;
          return (
            <article
              key={h.id}
              className="flex flex-col gap-2 rounded-lg border border-line bg-panel p-5"
            >
              <span
                className={cn(
                  "inline-flex w-fit rounded-full border px-2 py-0.5 text-xs tracking-wide uppercase",
                  h.status === "occupied"
                    ? "border-teal/40 text-teal"
                    : h.status === "turning"
                      ? "border-gold/40 text-gold-2"
                      : "border-watching/40 text-watching",
                )}
              >
                {HOME_STATUSES.find((s) => s.id === h.status)?.label}
              </span>
              <h2 className="font-display text-xl">{h.address}</h2>
              <p className="text-sm text-muted">
                {h.city} · {h.bedsBaths} · {formatMoney(h.fairRent)} / mo
              </p>
              <p className="text-sm text-muted">
                {lease
                  ? `Household: ${lease.household}`
                  : "No active lease — call the waitlist."}
              </p>
              <p className="text-sm leading-relaxed text-muted">{h.notes}</p>
              <p className="text-sm text-muted">{h.payInstructions}</p>
              <p className="text-sm text-muted">
                Facts v{h.factsVersion} · {h.facts.propertyKind} ·{" "}
                {h.facts.furnished}
                {h.facts.trashDay ? ` · trash ${h.facts.trashDay}` : ""}
              </p>
              <p className="text-sm text-muted">
                {open} open work · {waitingHere} neighbors who asked
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => setEditing(h)}
                >
                  Open
                </button>
                {h.status !== "occupied" ? (
                  <Link
                    to="/rent/waitlist"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "no-underline",
                    )}
                  >
                    Call waitlist
                  </Link>
                ) : (
                  <Link
                    to="/rent/desk"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "no-underline",
                    )}
                  >
                    Household desk
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        <HomeForm
          home={editing && editing !== "new" ? editing : null}
          onSave={(row) => {
            upsertHome(
              editing && editing !== "new" ? { ...row, id: editing.id } : row,
            );
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      </Modal>
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

function HomeForm({
  home,
  onSave,
  onCancel,
}: {
  home: RentalHome | null;
  onSave: (row: Omit<RentalHome, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    address: home?.address ?? "",
    city: home?.city ?? "Vidalia",
    bedsBaths: home?.bedsBaths ?? "",
    status: (home?.status ?? "vacant") as HomeStatus,
    fairRent: home?.fairRent ?? 650,
    notes: home?.notes ?? "",
    payInstructions:
      home?.payInstructions ??
      "Cash on the porch, or Zelle to the number we texted.",
    ownerId: home?.ownerId ?? "o1",
    listing: (home?.listing ?? "off_market") as ListingStatus,
    intent: (home?.intent ?? "rent") as HomeIntent,
    facts: (home?.facts ?? { ...EMPTY_HOUSE_FACTS }) as HouseFacts,
    factsVersion: home?.factsVersion ?? 1,
    factsUpdatedAt: home?.factsUpdatedAt ?? null,
    factsHistory: home?.factsHistory ?? [],
    factsAcks: home?.factsAcks ?? [],
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...form, fairRent: Number(form.fairRent) || 0 });
      }}
    >
      <h2 className="font-display text-2xl">
        {home ? "Edit rental" : "Add a rental"}
      </h2>
      <Field label="Street address">
        <Input
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </Field>
      <Field label="City">
        <Input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
      </Field>
      <Field label="Beds / baths">
        <Input
          value={form.bedsBaths}
          onChange={(e) => setForm({ ...form, bedsBaths: e.target.value })}
        />
      </Field>
      <Field label="Fair monthly rent">
        <Input
          inputMode="decimal"
          value={String(form.fairRent)}
          onChange={(e) =>
            setForm({ ...form, fairRent: Number(e.target.value) || 0 })
          }
        />
      </Field>
      <Field label="Status">
        <Select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as HomeStatus })
          }
        >
          {HOME_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="On the market?">
        <Select
          value={form.listing}
          onChange={(e) =>
            setForm({ ...form, listing: e.target.value as ListingStatus })
          }
        >
          {LISTING_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Rent, sale, or both">
        <Select
          value={form.intent}
          onChange={(e) =>
            setForm({ ...form, intent: e.target.value as HomeIntent })
          }
        >
          {HOME_INTENTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="How to pay"
        hint="A note, not a processor. Cash, Zelle, check — you still mark it received."
      >
        <Textarea
          rows={3}
          value={form.payInstructions}
          onChange={(e) =>
            setForm({ ...form, payInstructions: e.target.value })
          }
        />
      </Field>
      <Field label="Notes">
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>
      <HouseFactsFields
        facts={form.facts}
        onChange={(facts) => setForm({ ...form, facts })}
      />
      {home ? (
        <p className="text-sm text-muted">
          Saving a changed sheet makes version {home.factsVersion + 1}. Both
          sides ack that version before keys.
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
