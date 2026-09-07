import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CopyNote } from "@/components/copy-note";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  WAIT_STATUSES,
  homeLabel,
  waitlistNote,
  type WaitPerson,
  type WaitStatus,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/rent/waitlist")({
  component: WaitlistPage,
});

function WaitlistPage() {
  const homes = useRentalStore((s) => s.homes);
  const waitlist = useRentalStore((s) => s.waitlist);
  const upsertWait = useRentalStore((s) => s.upsertWait);
  const setWaitStatus = useRentalStore((s) => s.setWaitStatus);
  const offerFromWait = useRentalStore((s) => s.offerFromWait);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const person = waitlist.find((p) => p.id === noteId);
  const coming = homes.filter((h) => h.status !== "occupied");

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Waitlist</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Neighbors who asked to be told when a porch light comes on. Call
            them before anyone lists it. A pastor can add a name from
            Connectors.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add a neighbor</Button>
      </div>
      {coming.length ? (
        <p className="rounded-lg border border-gold/40 bg-panel px-4 py-3 text-sm">
          Coming up: {coming.map((h) => `${h.address}, ${h.city}`).join(" · ")}.
          Start with people already marked interested.
        </p>
      ) : null}
      <div className="grid gap-3">
        {waitlist.map((p) => (
          <article
            key={p.id}
            className="grid gap-2 rounded-lg border border-line bg-panel p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">{p.name}</h2>
                <p className="text-sm text-muted">
                  {p.household} · {p.phone} · asked {formatDate(p.addedAt)}
                </p>
              </div>
              <Select
                value={p.status}
                className="w-auto"
                onChange={(e) =>
                  setWaitStatus(p.id, e.target.value as WaitStatus)
                }
              >
                {WAIT_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <p className="text-sm text-muted">Wants: {p.wants}</p>
            <p className="text-sm text-muted">
              For: {p.homeId ? homeLabel(homes, p.homeId) : "Any home that fits"}
            </p>
            {p.referredBy ? (
              <p className="text-sm text-muted">Referred by {p.referredBy}</p>
            ) : null}
            {p.notes ? (
              <p className="text-sm leading-relaxed text-muted">{p.notes}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full border border-line px-3 text-sm"
                onClick={() => setNoteId(p.id)}
              >
                Write a porch-light note
              </button>
              {p.status !== "housed" && p.status !== "passed" ? (
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-3 text-sm"
                  onClick={() => {
                    offerFromWait(p.id);
                    void navigate({ to: "/rent/apply" });
                  }}
                >
                  Start an application
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      {person ? (
        <CopyNote
          text={waitlistNote(
            person,
            homes.find((h) => h.id === (person.homeId || coming[0]?.id)),
          )}
          label="Copy note"
        />
      ) : null}
      <Modal open={open} onClose={() => setOpen(false)}>
        <WaitForm
          homes={homes}
          onSave={(row) => {
            upsertWait(row);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function WaitForm({
  homes,
  onSave,
  onCancel,
}: {
  homes: { id: string; address: string; city: string }[];
  onSave: (row: Omit<WaitPerson, "id" | "addedAt">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    household: "",
    wants: "",
    notes: "",
    status: "interested" as WaitStatus,
    homeId: "",
    referredBy: "",
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="font-display text-2xl">Add a neighbor</h2>
      <Field label="Name">
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>
      <Field label="Household">
        <Input
          value={form.household}
          placeholder="Mom + two kids"
          onChange={(e) => setForm({ ...form, household: e.target.value })}
        />
      </Field>
      <Field label="What they need">
        <Input
          value={form.wants}
          placeholder="2 bed, Vidalia, under $750"
          onChange={(e) => setForm({ ...form, wants: e.target.value })}
        />
      </Field>
      <Field label="Home they’re waiting on">
        <Select
          value={form.homeId}
          onChange={(e) => setForm({ ...form, homeId: e.target.value })}
        >
          <option value="">Any home that fits</option>
          {homes.map((h) => (
            <option key={h.id} value={h.id}>
              {h.address}, {h.city}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Referred by">
        <Input
          value={form.referredBy}
          placeholder="Pastor, neighbor"
          onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
        />
      </Field>
      <Field label="Notes">
        <Textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
