import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  STEWARDSHIP_TEMPLATES,
  PACKET_STEPS,
  fillTemplate,
  type PacketStatus,
  type TemplateId,
} from "@/lib/templates";
import { useLegalStore } from "@/lib/legal-store";
import { templateValues } from "@/lib/steward";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/protect/packet")({
  component: PacketPage,
});

function PacketPage() {
  const season = useStewardStore((s) => s.season);
  const intake = useStewardStore((s) => s.intake);
  const status = useStewardStore((s) => s.packetStatus);
  const advancePacket = useStewardStore((s) => s.advancePacket);
  const reviews = useLegalStore((s) => s.reviews);
  const [openId, setOpenId] = useState<TemplateId | null>(
    STEWARDSHIP_TEMPLATES[0]?.id ?? null,
  );
  const values = templateValues(intake);

  if (season === "crisis") {
    return (
      <div className="grid max-w-xl gap-4">
        <h1 className="font-display text-3xl">
          No transfer packet in a crisis season.
        </h1>
        <Link
          to="/protect/crisis"
          className={cn(buttonVariants(), "no-underline")}
        >
          Open the crisis path
        </Link>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="grid max-w-xl gap-4">
        <h1 className="font-display text-3xl">
          Fees first, then a draft. Nothing is invented on this page.
        </h1>
        <Link
          to="/protect/fees"
          className={cn(buttonVariants(), "no-underline")}
        >
          Open the fee schedule
        </Link>
      </div>
    );
  }

  const nextLabel: Partial<Record<PacketStatus, string>> = {
    draft: "Send to paralegal review",
    paralegal: "Mark attorney signed (demo)",
    attorney: "Mark recorded (demo)",
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Locked templates, filled</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Status moves draft → paralegal review → attorney sign → recorded.
          Demo buttons walk the file so you can see the dashboard. In
          production, only the law office moves those gates.
        </p>
      </div>
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {PACKET_STEPS.map((step, i) => {
          const ids = PACKET_STEPS.map((s) => s.id);
          const here = ids.indexOf(status as (typeof ids)[number]);
          const active = here >= i;
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-lg border px-3 py-3 text-sm",
                active
                  ? "border-gold bg-gold/10 text-gold-2"
                  : "border-line text-muted",
              )}
            >
              <span className="block text-xs tabular-nums">{i + 1}</span>
              {step.label}
            </li>
          );
        })}
      </ol>
      <AttorneyFlag>
        Every template below is a placeholder. Georgia’s expanded estate
        definition can still reach trusts and life estates. Do not read a draft
        as a Medicaid result.
      </AttorneyFlag>
      <div className="grid gap-3">
        {STEWARDSHIP_TEMPLATES.map((tpl) => {
          const open = openId === tpl.id;
          return (
            <section
              key={tpl.id}
              className="rounded-lg border border-line bg-panel"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                onClick={() => setOpenId(open ? null : tpl.id)}
                aria-expanded={open}
              >
                <span>
                  <span className="block font-display text-lg">{tpl.title}</span>
                  <span className="text-sm text-muted">{tpl.purpose}</span>
                </span>
                <span className="text-xs tracking-wide text-flag uppercase">
                  Attorney
                </span>
              </button>
              {open ? (
                <pre className="overflow-x-auto whitespace-pre-wrap border-t border-line bg-paper p-4 font-display text-sm leading-relaxed text-paper-ink">
                  {fillTemplate(
                    reviews.find((r) => r.id === tpl.id)?.body ?? tpl.body,
                    values,
                  )}
                </pre>
              ) : null}
            </section>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {status !== "recorded" && nextLabel[status] ? (
          <Button onClick={advancePacket}>{nextLabel[status]}</Button>
        ) : null}
        {status === "recorded" ? (
          <Link
            to="/protect/dashboard"
            className={cn(buttonVariants(), "no-underline")}
          >
            Open the stewardship dashboard
          </Link>
        ) : null}
      </div>
      <Disclaimer />
    </div>
  );
}
