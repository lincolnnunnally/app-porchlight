import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AttorneyFlag, RentalDisclaimer } from "@/components/attorney-flag";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  APP_STATUSES,
  homeLabel,
  type Application,
  type AppStatus,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";

export const Route = createFileRoute("/rent/apply")({
  component: ApplyPage,
});

function ApplyPage() {
  const homes = useRentalStore((s) => s.homes);
  const applications = useRentalStore((s) => s.applications);
  const upsertApp = useRentalStore((s) => s.upsertApp);
  const setAppStatus = useRentalStore((s) => s.setAppStatus);
  const setWalked = useRentalStore((s) => s.setWalked);
  const houseApplication = useRentalStore((s) => s.houseApplication);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Applications</h1>
          <p className="mt-1 max-w-2xl text-muted">
            A walk, a conversation about income, one reference. No credit pull,
            no screening mill, no Social Security number in this box.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>New application</Button>
      </div>
      <AttorneyFlag>
        Fair-housing rules still apply. This checklist is not a consumer report
        and must not be used to disguise a credit or eviction search.
      </AttorneyFlag>
      <div className="grid gap-4">
        {applications.map((a) => (
          <article
            key={a.id}
            className="grid gap-2 rounded-lg border border-line bg-panel p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-xl">{a.name}</h2>
                <p className="text-sm text-muted">
                  {a.household} · {a.phone} · {homeLabel(homes, a.homeId)}
                </p>
              </div>
              <Select
                value={a.status}
                className="w-auto"
                onChange={(e) =>
                  setAppStatus(a.id, e.target.value as AppStatus)
                }
              >
                {APP_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <p className="text-sm text-muted">Income talk: {a.incomeNote || "—"}</p>
            <p className="text-sm text-muted">Reference: {a.references || "—"}</p>
            {a.notes ? (
              <p className="text-sm leading-relaxed text-muted">{a.notes}</p>
            ) : null}
            <p className="text-sm text-muted">
              Owner: {a.ownerApproved ? "signed off" : "waiting on a yes"}
            </p>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={a.walked}
                onChange={(e) => setWalked(a.id, e.target.checked)}
              />
              Walked the house together
            </label>
            {a.status !== "housed" && a.status !== "passed" ? (
              <div>
                <Button
                  variant="teal"
                  disabled={!a.walked || !a.ownerApproved}
                  onClick={() => {
                    const leaseId = houseApplication(a.id);
                    if (leaseId) void navigate({ to: "/rent/leases" });
                  }}
                >
                  Offer occupancy (draft lease)
                </Button>
                {!a.ownerApproved ? (
                  <p className="mt-2 text-sm text-muted">
                    Owner still needs to sign off from the desk.
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
      <RentalDisclaimer />
      <Modal open={open} onClose={() => setOpen(false)}>
        <AppForm
          homes={homes}
          onSave={(row) => {
            upsertApp(row);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function AppForm({
  homes,
  onSave,
  onCancel,
}: {
  homes: { id: string; address: string; city: string }[];
  onSave: (row: Omit<Application, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    homeId: homes.find((h) => h.id !== "r1")?.id ?? homes[0]?.id ?? "",
    waitId: "",
    name: "",
    phone: "",
    household: "",
    incomeNote: "",
    references: "",
    walked: false,
    ownerApproved: false,
    status: "applied" as AppStatus,
    notes: "",
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="font-display text-2xl">New application</h2>
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
          onChange={(e) => setForm({ ...form, household: e.target.value })}
        />
      </Field>
      <Field
        label="Income conversation"
        hint="Can they carry this fair rent. Not a paystub mill."
      >
        <Textarea
          rows={3}
          value={form.incomeNote}
          onChange={(e) => setForm({ ...form, incomeNote: e.target.value })}
        />
      </Field>
      <Field label="One reference">
        <Input
          value={form.references}
          placeholder="Pastor, neighbor, employer"
          onChange={(e) => setForm({ ...form, references: e.target.value })}
        />
      </Field>
      <Field label="Notes">
        <Textarea
          rows={2}
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
