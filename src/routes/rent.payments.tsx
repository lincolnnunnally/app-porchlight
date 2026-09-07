import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AttorneyFlag, RentalDisclaimer } from "@/components/attorney-flag";
import { CopyNote } from "@/components/copy-note";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import {
  PAY_METHODS,
  PAY_STATUSES,
  demandDraftText,
  homeLabel,
  payRequestText,
  periodKey,
  periodLabel,
  receiptText,
  reminderText,
  type PayMethod,
  type PayStatus,
  type Payment,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatDate, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/rent/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const payments = useRentalStore((s) => s.payments);
  const notices = useRentalStore((s) => s.notices);
  const upsertPayment = useRentalStore((s) => s.upsertPayment);
  const setPayStatus = useRentalStore((s) => s.setPayStatus);
  const setPayMethod = useRentalStore((s) => s.setPayMethod);
  const generateDues = useRentalStore((s) => s.generateDues);
  const addNotice = useRentalStore((s) => s.addNotice);
  const [open, setOpen] = useState(false);
  const [paper, setPaper] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const received = payments
    .filter((p) => p.status === "received")
    .reduce((n, p) => n + p.amount, 0);
  const outstanding = payments
    .filter((p) => p.status === "due" || p.status === "late")
    .reduce((n, p) => n + p.amount, 0);

  function paperFor(
    kind: "receipt" | "pay_request" | "reminder" | "demand_draft",
    p: Payment,
  ) {
    const lease = leases.find((l) => l.id === p.leaseId);
    const home = homes.find((h) => h.id === p.homeId);
    if (!lease) return;
    const body =
      kind === "receipt"
        ? receiptText(p, lease, home)
        : kind === "pay_request"
          ? payRequestText(lease, home, p.period, p.amount)
          : kind === "reminder"
            ? reminderText(lease, home, p)
            : demandDraftText(lease, home, p);
    addNotice({ homeId: p.homeId, leaseId: p.leaseId, kind, body });
    setPaper(body);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Payments</h1>
          <p className="mt-1 max-w-2xl text-muted">
            A ledger, not a processor. Mark what came in. Talk first if a week
            is hard. Household can claim a payment from the desk; you confirm
            it here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              const n = generateDues();
              setAdded(
                n ? `Opened ${n} due for this month.` : "This month is already on the ledger.",
              );
            }}
          >
            Open this month
          </Button>
          <Button onClick={() => setOpen(true)}>Add a payment</Button>
        </div>
      </div>
      {added ? <p className="text-sm text-teal">{added}</p> : null}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-line bg-panel px-4 py-3">
          <p className="text-sm text-muted">Received</p>
          <p className="font-display text-2xl text-gold-2">
            {formatMoney(received)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-panel px-4 py-3">
          <p className="text-sm text-muted">Still due</p>
          <p className="font-display text-2xl text-gold-2">
            {formatMoney(outstanding)}
          </p>
        </div>
      </section>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-panel text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Home</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">How</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-line align-top">
                <td className="px-4 py-3">{periodLabel(p.period)}</td>
                <td className="px-4 py-3">{homeLabel(homes, p.homeId)}</td>
                <td className="px-4 py-3 tabular-nums text-gold-2">
                  {formatMoney(p.amount)}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={p.method}
                    onChange={(e) =>
                      setPayMethod(p.id, e.target.value as PayMethod)
                    }
                    className="min-h-11 w-auto"
                  >
                    {PAY_METHODS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={p.status}
                    onChange={(e) =>
                      setPayStatus(p.id, e.target.value as PayStatus)
                    }
                    className="min-h-11 w-auto"
                  >
                    {PAY_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted">
                    {p.claimedAt && p.status !== "received"
                      ? `Household says they paid ${formatDate(p.claimedAt)}. `
                      : null}
                    {p.receivedAt
                      ? `In ${formatDate(p.receivedAt)}. ${p.note}`
                      : p.note}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.status !== "received" ? (
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-3 text-sm"
                        onClick={() => {
                          setPayStatus(p.id, "received");
                          paperFor("receipt", {
                            ...p,
                            status: "received",
                            receivedAt: p.receivedAt ?? Date.now(),
                          });
                        }}
                      >
                        Mark received
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-3 text-sm"
                        onClick={() => paperFor("receipt", p)}
                      >
                        Receipt
                      </button>
                    )}
                    <button
                      type="button"
                      className="min-h-11 rounded-full border border-line px-3 text-sm"
                      onClick={() => paperFor("pay_request", p)}
                    >
                      Pay note
                    </button>
                    {p.status === "late" || p.status === "due" ? (
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-3 text-sm"
                        onClick={() => paperFor("reminder", p)}
                      >
                        Reminder
                      </button>
                    ) : null}
                    {p.status === "late" ? (
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-3 text-sm"
                        onClick={() => paperFor("demand_draft", p)}
                      >
                        Demand draft
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paper ? (
        <div className="grid gap-3">
          {paper.includes("NOT A DISPOSSESSORY") ? (
            <AttorneyFlag>
              This is a conversation record. It is not a magistrate filing.
              Do not serve it.
            </AttorneyFlag>
          ) : null}
          <CopyNote text={paper} />
        </div>
      ) : null}
      {notices.length ? (
        <section className="grid gap-2">
          <h2 className="font-display text-xl">Notes sent</h2>
          <ul className="grid gap-1 text-sm text-muted">
            {notices.slice(0, 8).map((n) => (
              <li key={n.id}>
                {formatDate(n.at)} · {n.kind.replace("_", " ")} ·{" "}
                {homeLabel(homes, n.homeId)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <RentalDisclaimer />
      <Modal open={open} onClose={() => setOpen(false)}>
        <PaymentForm
          homes={homes}
          leases={leases}
          onSave={(row) => {
            upsertPayment(row);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

function PaymentForm({
  homes,
  leases,
  onSave,
  onCancel,
}: {
  homes: { id: string; address: string; city: string }[];
  leases: { id: string; homeId: string; household: string; monthly: number }[];
  onSave: (row: Omit<Payment, "id">) => void;
  onCancel: () => void;
}) {
  const first = leases[0] ?? {
    id: "",
    homeId: homes[0]?.id ?? "",
    monthly: 650,
  };
  const [form, setForm] = useState({
    homeId: first.homeId,
    leaseId: first.id,
    period: periodKey(new Date()),
    amount: first.monthly,
    method: "cash" as PayMethod,
    note: "",
  });
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const [y, m] = form.period.split("-").map(Number);
        onSave({
          homeId: form.homeId,
          leaseId: form.leaseId,
          period: form.period,
          amount: Number(form.amount) || 0,
          due: new Date(y, (m || 1) - 1, 1).getTime(),
          receivedAt: null,
          claimedAt: null,
          status: "due",
          method: form.method,
          note: form.note,
        });
      }}
    >
      <h2 className="font-display text-2xl">Add a payment</h2>
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
      <Field label="Lease">
        <Select
          value={form.leaseId}
          onChange={(e) => setForm({ ...form, leaseId: e.target.value })}
        >
          {leases.map((l) => (
            <option key={l.id} value={l.id}>
              {l.household}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Period (YYYY-MM)">
        <Input
          value={form.period}
          onChange={(e) => setForm({ ...form, period: e.target.value })}
        />
      </Field>
      <Field label="Amount">
        <Input
          inputMode="decimal"
          value={String(form.amount)}
          onChange={(e) =>
            setForm({ ...form, amount: Number(e.target.value) || 0 })
          }
        />
      </Field>
      <Field label="How">
        <Select
          value={form.method}
          onChange={(e) =>
            setForm({ ...form, method: e.target.value as PayMethod })
          }
        >
          {PAY_METHODS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note">
        <Input
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
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
