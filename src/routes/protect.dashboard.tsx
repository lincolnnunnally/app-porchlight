import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useStewardStore } from "@/lib/steward-store";
import { formatDate, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/protect/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const status = useStewardStore((s) => s.packetStatus);
  const intake = useStewardStore((s) => s.intake);
  const occupancyNote = useStewardStore((s) => s.occupancyNote);
  const logs = useStewardStore((s) => s.logs);
  const expenses = useStewardStore((s) => s.expenses);
  const addLog = useStewardStore((s) => s.addLog);
  const addExpense = useStewardStore((s) => s.addExpense);
  const loadDemoDashboard = useStewardStore((s) => s.loadDemoDashboard);
  const [logTitle, setLogTitle] = useState("");
  const [logDetail, setLogDetail] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState("");

  if (status !== "recorded") {
    return (
      <div className="grid max-w-xl gap-4">
        <h1 className="font-display text-3xl">After filing</h1>
        <p className="text-muted">
          Occupancy, maintenance, expenses, and the published fee live here
          once a supervising attorney has signed and the file is recorded.
        </p>
        <Button variant="ghost" onClick={loadDemoDashboard}>
          Preview a recorded stewardship
        </Button>
      </div>
    );
  }

  const feeYtd = expenses
    .filter((e) => e.category === "Stewardship fee")
    .reduce((n, e) => n + e.amount, 0);
  const operating = expenses
    .filter((e) => e.category !== "Stewardship fee")
    .reduce((n, e) => n + e.amount, 0);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-3xl">Stewardship file</h1>
        <p className="mt-1 text-muted">
          {intake.homeowner || "Occupant"} · {intake.address || "home"} ·{" "}
          {intake.county} County
        </p>
      </div>
      <AttorneyFlag>
        Dashboard labels and any “later rent / sale” notes need attorney
        approval. Occupancy remains $0 while the person needs the home.
      </AttorneyFlag>
      <section className="grid gap-3 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-display text-xl">Occupancy</h2>
        <p className="leading-relaxed text-ink">
          {occupancyNote || "Occupant is at home. No rent charged."}
        </p>
        <p className="text-sm text-muted">
          Later affordable rent and any sale stay dark until occupancy ends.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Published fee collected YTD" value={formatMoney(feeYtd)} />
        <Stat label="Documented operating costs" value={formatMoney(operating)} />
        <Stat label="Sale / later rent" value="None yet" />
      </section>
      <section className="grid gap-4">
        <h2 className="font-display text-xl">Maintenance log</h2>
        <form
          className="grid gap-3 rounded-lg border border-line bg-panel p-4 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!logTitle.trim()) return;
            addLog(logTitle.trim(), logDetail.trim());
            setLogTitle("");
            setLogDetail("");
          }}
        >
          <Field label="What happened">
            <Input
              value={logTitle}
              onChange={(e) => setLogTitle(e.target.value)}
            />
          </Field>
          <Field label="Note">
            <Input
              value={logDetail}
              onChange={(e) => setLogDetail(e.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" size="sm">
              Add log
            </Button>
          </div>
        </form>
        <ul className="grid gap-2">
          {logs.map((l) => (
            <li
              key={l.id}
              className="rounded-lg border border-line bg-bg-2 px-4 py-3"
            >
              <p className="text-xs text-muted">{formatDate(l.at)}</p>
              <p className="font-medium">{l.title}</p>
              {l.detail ? (
                <p className="text-sm text-muted">{l.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-4">
        <h2 className="font-display text-xl">Expenses</h2>
        <form
          className="grid gap-3 rounded-lg border border-line bg-panel p-4 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(amount);
            if (!payee.trim() || !Number.isFinite(n)) return;
            addExpense(payee.trim(), "Repair", n, receipt.trim());
            setPayee("");
            setAmount("");
            setReceipt("");
          }}
        >
          <Field label="Payee">
            <Input value={payee} onChange={(e) => setPayee(e.target.value)} />
          </Field>
          <Field label="Amount">
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Field label="Receipt note">
            <Input
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" size="sm">
              Add expense
            </Button>
          </div>
        </form>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-panel text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Payee</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="px-4 py-3 text-muted">{formatDate(e.at)}</td>
                  <td className="px-4 py-3">{e.payee}</td>
                  <td className="px-4 py-3 text-muted">{e.category}</td>
                  <td className="px-4 py-3 tabular-nums text-gold-2">
                    {formatMoney(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-muted">{e.receipt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-2xl text-gold-2">{value}</p>
    </div>
  );
}
