import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AttorneyFlag,
  RentalDisclaimer,
} from "@/components/attorney-flag";
import { CopyNote } from "@/components/copy-note";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { HouseFactsSheet } from "@/components/house-facts";
import { factsReadyForKeys } from "@/lib/house-facts";
import {
  DEPOSIT_STATUSES,
  LEASE_STATUSES,
  depositReturnDraft,
  homeLabel,
  leaseDraft,
  type DepositStatus,
  type Lease,
  type LeaseStatus,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/rent/leases")({
  component: LeasesPage,
});

function LeasesPage() {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const moves = useRentalStore((s) => s.moves);
  const owners = useRentalStore((s) => s.owners);
  const upsertLease = useRentalStore((s) => s.upsertLease);
  const ackFacts = useRentalStore((s) => s.ackFacts);
  const startMove = useRentalStore((s) => s.startMove);
  const toggleMoveItem = useRentalStore((s) => s.toggleMoveItem);
  const patchMove = useRentalStore((s) => s.patchMove);
  const [editing, setEditing] = useState<Lease | null | "new">(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);
  const draftLease = leases.find((l) => l.id === draftId);
  const depositMove = moves.find((m) => m.id === depositId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Leases</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Simple occupancy for a fair rent. Move-in and move-out live here.
            An attorney still has to approve anything you sign.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>Add a lease</Button>
      </div>
      <AttorneyFlag>
        Lease language is a draft. Georgia landlord-tenant rules (Title 44,
        Chapter 7) apply. This app does not file a dispossessory.
      </AttorneyFlag>
      <div className="grid gap-4">
        {leases.map((l) => {
          const home = homes.find((h) => h.id === l.homeId);
          const related = moves.filter((m) => m.leaseId === l.id);
          return (
            <article
              key={l.id}
              className="grid gap-3 rounded-lg border border-line bg-panel p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl">{l.household}</h2>
                  <p className="text-sm text-muted">
                    {homeLabel(homes, l.homeId)} · {formatMoney(l.monthly)} / mo
                  </p>
                </div>
                <span className="rounded-full border border-line px-2 py-0.5 text-xs tracking-wide uppercase text-gold-2">
                  {LEASE_STATUSES.find((s) => s.id === l.status)?.label}
                </span>
              </div>
              <p className="text-sm text-muted">
                {l.start} → {l.end} · {l.phone} · deposit {formatMoney(l.deposit)}{" "}
                ({DEPOSIT_STATUSES.find((d) => d.id === l.depositStatus)?.label})
              </p>
              {home ? (
                <HouseFactsSheet
                  home={home}
                  party="owner"
                  ackName={
                    owners.find((o) => o.id === home.ownerId)?.name ?? "Owner"
                  }
                  onAck={() =>
                    ackFacts(
                      home.id,
                      "owner",
                      owners.find((o) => o.id === home.ownerId)?.name ?? "Owner",
                    )
                  }
                />
              ) : null}
              {home?.status === "occupied" ? null : (
                <p className="text-sm text-muted">
                  Home is {home?.status ?? "unlisted"}. Occupancy starts when
                  they move in, not when you save this card.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => setEditing(l)}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => setDraftId(l.id)}
                >
                  Draft occupancy
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => startMove(l.id, "in")}
                >
                  Move-in
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => startMove(l.id, "out")}
                >
                  Move-out
                </button>
              </div>
              {related.map((m) => (
                <div
                  key={m.id}
                  className="grid gap-2 rounded-md border border-line bg-bg-2 p-3"
                >
                  <p className="text-sm font-medium">
                    {m.kind === "in" ? "Move-in" : "Move-out"} · {m.date}
                  </p>
                  {m.items.map((item) => {
                    const keysBlocked =
                      m.kind === "in" &&
                      item.id === "k" &&
                      !item.done &&
                      home &&
                      !factsReadyForKeys(home);
                    return (
                      <label
                        key={item.id}
                        className="flex min-h-11 items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          disabled={Boolean(keysBlocked)}
                          onChange={() => toggleMoveItem(m.id, item.id)}
                        />
                        {item.label}
                        {keysBlocked
                          ? " — both sides ack this facts version first"
                          : ""}
                      </label>
                    );
                  })}
                  <Field label="Condition">
                    <Textarea
                      rows={2}
                      value={m.condition}
                      onChange={(e) =>
                        patchMove(m.id, { condition: e.target.value })
                      }
                    />
                  </Field>
                  {m.kind === "out" ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDepositId(m.id)}
                      >
                        Deposit accounting draft
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </article>
          );
        })}
      </div>
      {draftLease ? (
        <CopyNote
          text={leaseDraft(
            draftLease,
            homes.find((h) => h.id === draftLease.homeId),
          )}
          label="Copy occupancy draft"
        />
      ) : null}
      {depositMove ? (
        <div className="grid gap-3">
          <AttorneyFlag>
            Georgia generally requires a security deposit to be returned or
            itemized within one month after the tenancy ends. Counsel must
            approve this draft.
          </AttorneyFlag>
          <CopyNote
            text={depositReturnDraft(
              depositMove,
              leases.find((l) => l.id === depositMove.leaseId),
            )}
            label="Copy deposit draft"
          />
        </div>
      ) : null}
      <RentalDisclaimer />
      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        <LeaseForm
          homes={homes}
          lease={editing && editing !== "new" ? editing : null}
          onSave={(row) => {
            upsertLease(
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

function LeaseForm({
  homes,
  lease,
  onSave,
  onCancel,
}: {
  homes: { id: string; address: string; city: string }[];
  lease: Lease | null;
  onSave: (row: Omit<Lease, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    homeId: lease?.homeId ?? homes[0]?.id ?? "",
    household: lease?.household ?? "",
    phone: lease?.phone ?? "",
    start: lease?.start ?? "",
    end: lease?.end ?? "",
    monthly: lease?.monthly ?? 650,
    deposit: lease?.deposit ?? 650,
    depositStatus: (lease?.depositStatus ?? "held") as DepositStatus,
    status: (lease?.status ?? "draft") as LeaseStatus,
    terms: lease?.terms ?? "",
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...form,
          monthly: Number(form.monthly) || 0,
          deposit: Number(form.deposit) || 0,
        });
      }}
    >
      <h2 className="font-display text-2xl">
        {lease ? "Edit lease" : "Add a lease"}
      </h2>
      <Field label="Home">
        <Select
          value={form.homeId}
          onChange={(e) => setForm({ ...form, homeId: e.target.value })}
        >
          {homes.map((h) => (
            <option key={h.id} value={h.id}>
              {h.address}, {h.city}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Household">
        <Input
          required
          value={form.household}
          onChange={(e) => setForm({ ...form, household: e.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start">
          <Input
            type="date"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />
        </Field>
        <Field label="End">
          <Input
            type="date"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Monthly rent">
          <Input
            inputMode="decimal"
            value={String(form.monthly)}
            onChange={(e) =>
              setForm({ ...form, monthly: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Deposit">
          <Input
            inputMode="decimal"
            value={String(form.deposit)}
            onChange={(e) =>
              setForm({ ...form, deposit: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </div>
      <Field label="Deposit status">
        <Select
          value={form.depositStatus}
          onChange={(e) =>
            setForm({ ...form, depositStatus: e.target.value as DepositStatus })
          }
        >
          {DEPOSIT_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Status">
        <Select
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as LeaseStatus })
          }
        >
          {LEASE_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Notes / terms">
        <Textarea
          rows={3}
          value={form.terms}
          onChange={(e) => setForm({ ...form, terms: e.target.value })}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
