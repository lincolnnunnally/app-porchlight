import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { Button, buttonVariants } from "@/components/ui/button";
import { FEE_PRINCIPLES, FEE_SCHEDULE } from "@/lib/fees";
import { intakeComplete } from "@/lib/steward";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/protect/fees")({
  component: FeesPage,
});

function FeesPage() {
  const season = useStewardStore((s) => s.season);
  const intake = useStewardStore((s) => s.intake);
  const feesAcceptedAt = useStewardStore((s) => s.feesAcceptedAt);
  const acceptFees = useStewardStore((s) => s.acceptFees);
  const generatePacket = useStewardStore((s) => s.generatePacket);
  const navigate = useNavigate();
  const [checked, setChecked] = useState(Boolean(feesAcceptedAt));

  if (season === "crisis") {
    return (
      <div className="grid max-w-xl gap-4">
        <h1 className="font-display text-3xl">No packet in a crisis season.</h1>
        <Link
          to="/protect/crisis"
          className={cn(buttonVariants(), "no-underline")}
        >
          Open the crisis path
        </Link>
      </div>
    );
  }

  if (season === "connector") {
    return (
      <div className="grid max-w-xl gap-4">
        <h1 className="font-display text-3xl">
          Connectors refer. The family runs its own packet.
        </h1>
        <p className="text-muted">
          This device is set up as a connector. A homeowner or adult child
          takes the season quiz on their own device, sees these fees, and
          generates the draft themselves.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/protect/quiz"
            className={cn(buttonVariants(), "no-underline")}
          >
            Take the season quiz as the family
          </Link>
          <Link
            to="/connect"
            className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
          >
            Back to Connectors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl">Fees, on the table first</h1>
        <p className="mt-2 text-lg text-muted">
          Nothing is generated until you have seen this. No dual-agency split.
          No surprise percentage later.
        </p>
      </div>
      <AttorneyFlag>
        Dollar amounts are a proposal for owner and attorney approval. They
        are not in force until a supervising lawyer adopts them.
      </AttorneyFlag>
      <ul className="grid gap-2 text-sm text-muted">
        {FEE_PRINCIPLES.map((p) => (
          <li key={p}>— {p}</li>
        ))}
      </ul>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-panel text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">What</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {FEE_SCHEDULE.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3 text-muted">{row.when}</td>
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 font-medium text-gold-2">
                  {row.amount}
                </td>
                <td className="px-4 py-3 text-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-line bg-panel p-4">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-gold"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span className="text-sm leading-relaxed">
          I have read the fee schedule. I understand occupancy stays with the
          person who needs the home, and that a packet is only a draft until an
          attorney signs.
        </span>
      </label>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!checked || !intakeComplete(intake) || season !== "planning"}
          onClick={() => {
            acceptFees();
            const ok = generatePacket();
            if (ok) navigate({ to: "/protect/packet" });
          }}
        >
          Generate the draft packet
        </Button>
        {!intakeComplete(intake) ? (
          <Link
            to="/protect/intake"
            className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
          >
            Finish facts first
          </Link>
        ) : null}
      </div>
      <Disclaimer />
    </div>
  );
}
