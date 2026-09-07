import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  WORK_STATUSES,
  homeLabel,
  parseIso,
  type Vendor,
  type WorkOrder,
  type WorkStatus,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatDate, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/rent/work")({ component: WorkPage });

function WorkPage() {
  const homes = useRentalStore((s) => s.homes);
  const work = useRentalStore((s) => s.work);
  const vendors = useRentalStore((s) => s.vendors);
  const upsertWork = useRentalStore((s) => s.upsertWork);
  const setWorkStatus = useRentalStore((s) => s.setWorkStatus);
  const upsertVendor = useRentalStore((s) => s.upsertVendor);
  const [open, setOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Work that needs hands</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Repair with your hands. Log the cost. Put a day on it. Do not
            over-improve a house someone already lives in.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setVendorOpen(true)}>
            Add a vendor
          </Button>
          <Button onClick={() => setOpen(true)}>Add work</Button>
        </div>
      </div>
      {vendors.length ? (
        <p className="text-sm text-muted">
          Hands:{" "}
          {vendors.map((v) => `${v.name} (${v.trade})`).join(" · ")}
        </p>
      ) : null}
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {WORK_STATUSES.map((col) => {
          const items = work.filter((w) => w.status === col.id);
          return (
            <div
              key={col.id}
              className="min-w-[260px] snap-start rounded-lg border border-line bg-panel/70 p-3 md:min-w-0"
            >
              <h2 className="mb-3 text-sm font-medium text-muted">
                {col.label} · {items.length}
              </h2>
              <div className="grid gap-3">
                {items.length === 0 ? (
                  <p className="px-1 py-8 text-center text-sm text-muted">
                    Nothing here.
                  </p>
                ) : (
                  items.map((w) => (
                    <article
                      key={w.id}
                      className="grid gap-1 rounded-lg border border-line bg-panel p-4"
                    >
                      <h3 className="font-display text-lg leading-snug">
                        {w.title}
                      </h3>
                      <p className="text-sm text-muted">
                        {homeLabel(homes, w.homeId)} · {w.who} ·{" "}
                        {formatMoney(w.cost)}
                      </p>
                      {w.scheduledAt ? (
                        <p className="text-sm text-gold-2">
                          Scheduled {formatDate(w.scheduledAt)}
                        </p>
                      ) : null}
                      <p className="text-sm leading-relaxed text-muted">
                        {w.detail}
                      </p>
                      <Select
                        value={w.status}
                        className="mt-2"
                        onChange={(e) =>
                          setWorkStatus(w.id, e.target.value as WorkStatus)
                        }
                      >
                        {WORK_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </Select>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <WorkForm
          homes={homes}
          vendors={vendors}
          onSave={(row) => {
            upsertWork(row);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
      <Modal open={vendorOpen} onClose={() => setVendorOpen(false)}>
        <VendorForm
          onSave={(row) => {
            upsertVendor(row);
            setVendorOpen(false);
          }}
          onCancel={() => setVendorOpen(false)}
        />
      </Modal>
    </div>
  );
}

function WorkForm({
  homes,
  vendors,
  onSave,
  onCancel,
}: {
  homes: { id: string; address: string; city: string }[];
  vendors: Vendor[];
  onSave: (row: Omit<WorkOrder, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    homeId: homes[0]?.id ?? "",
    title: "",
    detail: "",
    status: "needed" as WorkStatus,
    cost: 0,
    who: vendors[0]?.name ?? "Hands",
    vendorId: vendors[0]?.id ?? "",
    scheduled: "",
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const vendor = vendors.find((v) => v.id === form.vendorId);
        onSave({
          homeId: form.homeId,
          title: form.title,
          detail: form.detail,
          status: form.status,
          cost: Number(form.cost) || 0,
          who: vendor ? `${vendor.name} · ${vendor.trade}` : form.who,
          vendorId: form.vendorId,
          scheduledAt: form.scheduled ? parseIso(form.scheduled) : null,
        });
      }}
    >
      <h2 className="font-display text-2xl">Add work</h2>
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
      <Field label="What needs doing">
        <Input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </Field>
      <Field label="Detail">
        <Textarea
          rows={3}
          value={form.detail}
          onChange={(e) => setForm({ ...form, detail: e.target.value })}
        />
      </Field>
      <Field label="Hands / vendor">
        <Select
          value={form.vendorId}
          onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
        >
          <option value="">Hands</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} · {v.trade}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Scheduled">
        <Input
          type="date"
          value={form.scheduled}
          onChange={(e) => setForm({ ...form, scheduled: e.target.value })}
        />
      </Field>
      <Field label="Cost (documented)">
        <Input
          inputMode="decimal"
          value={String(form.cost)}
          onChange={(e) =>
            setForm({ ...form, cost: Number(e.target.value) || 0 })
          }
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

function VendorForm({
  onSave,
  onCancel,
}: {
  onSave: (row: Omit<Vendor, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    trade: "",
    phone: "",
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
      <h2 className="font-display text-2xl">Add a vendor</h2>
      <Field label="Name">
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>
      <Field label="Trade">
        <Input
          value={form.trade}
          placeholder="Plumbing, paint, electric"
          onChange={(e) => setForm({ ...form, trade: e.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
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

