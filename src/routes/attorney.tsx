import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { CopyNote } from "@/components/copy-note";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
  COUNSEL_CHECKS,
  WORK_PILE,
  engagementLetter,
  filledBody,
} from "@/lib/legal";
import { nextWork, useLegalStore } from "@/lib/legal-store";
import { useStewardStore } from "@/lib/steward-store";
import { LOCKED_TEMPLATES, type TemplateId } from "@/lib/templates";
import { fillTemplate } from "@/lib/templates";
import { templateValues } from "@/lib/steward";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attorney")({ component: AttorneyPage });

function AttorneyPage() {
  const reviews = useLegalStore((s) => s.reviews);
  const checks = useLegalStore((s) => s.checks);
  const attorneyName = useLegalStore((s) => s.attorneyName);
  const barNumber = useLegalStore((s) => s.barNumber);
  const office = useLegalStore((s) => s.office);
  const setAttorney = useLegalStore((s) => s.setAttorney);
  const toggleCheck = useLegalStore((s) => s.toggleCheck);
  const setBody = useLegalStore((s) => s.setBody);
  const setNote = useLegalStore((s) => s.setNote);
  const sign = useLegalStore((s) => s.sign);
  const sendBack = useLegalStore((s) => s.sendBack);
  const reopen = useLegalStore((s) => s.reopen);
  const intake = useStewardStore((s) => s.intake);
  const [openId, setOpenId] = useState<TemplateId | null>(null);
  const [name, setName] = useState(attorneyName);
  const [bar, setBar] = useState(barNumber);
  const [off, setOff] = useState(office);

  const next = nextWork(reviews);
  const currentId = openId ?? next?.id ?? reviews[0]?.id;
  const current = reviews.find((r) => r.id === currentId);
  const meta = WORK_PILE.find((w) => w.id === currentId);
  const locked = LOCKED_TEMPLATES.find((t) => t.id === currentId);
  const signed = reviews.filter((r) => r.status === "signed").length;
  const waiting = reviews.filter((r) => r.status !== "signed").length;
  const checksDone = COUNSEL_CHECKS.every((c) => checks[c.id]);
  const values = templateValues(intake);

  const shown = useMemo(() => {
    if (!current) return "";
    if (current.body.includes("{{")) return fillTemplate(current.body, values);
    return current.body;
  }, [current, values]);

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          Attorney desk
        </p>
        <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
          One pile. Sign it or send it back.
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          You are the lawyer. This desk is the work. Porchlight filled blanks.
          Nothing is an instrument until you say so.
        </p>
      </div>
      <AttorneyFlag>
        Drafts only. Not legal advice from the app. Do not record, serve, or
        tell a family this is signed until you have.
      </AttorneyFlag>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Still in the pile" value={String(waiting)} />
        <Stat label="Signed" value={String(signed)} />
        <Stat
          label="Counseling ticks"
          value={`${COUNSEL_CHECKS.filter((c) => checks[c.id]).length}/${COUNSEL_CHECKS.length}`}
        />
      </section>
      <form
        className="grid gap-3 rounded-xl border border-line bg-panel p-5 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          setAttorney(name, bar, off);
        }}
      >
        <Field label="Your name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Georgia Bar no.">
          <Input value={bar} onChange={(e) => setBar(e.target.value)} />
        </Field>
        <Field label="Office">
          <Input value={off} onChange={(e) => setOff(e.target.value)} />
        </Field>
        <Button type="submit" variant="ghost" className="sm:col-span-3">
          Save who is reviewing
        </Button>
      </form>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Before any signature counts</h2>
        <ul className="grid gap-2">
          {COUNSEL_CHECKS.map((c) => (
            <li key={c.id}>
              <label className="flex min-h-11 items-start gap-3 rounded-lg border border-line bg-panel px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={Boolean(checks[c.id])}
                  onChange={() => toggleCheck(c.id)}
                />
                <span className="text-sm leading-relaxed">{c.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
      <CopyNote
        text={engagementLetter(attorneyName || name || "Counsel")}
        label="Copy the letter that puts this on your desk"
      />
      {current && meta && locked ? (
        <article className="grid gap-4 rounded-xl border border-gold/40 bg-panel p-5">
          <p className="text-xs tracking-wide text-gold-2 uppercase">
            Next · {meta.minutes} · {meta.pile}
          </p>
          <h2 className="font-display text-2xl">{meta.title}</h2>
          <p className="text-muted">{meta.ask}</p>
          <p className="text-sm text-muted">{locked.purpose}</p>
          <Field label="Draft (edit anything)">
            <Textarea
              className="min-h-64 font-mono text-sm"
              value={shown}
              onChange={(e) => setBody(current.id, e.target.value)}
            />
          </Field>
          <Field label="Send-back note (if you will not sign this one)">
            <Textarea
              rows={2}
              value={current.note}
              onChange={(e) => setNote(current.id, e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="teal"
              disabled={!checksDone}
              onClick={() => {
                setBody(current.id, shown);
                sign(current.id);
                const rest = reviews.filter(
                  (r) => r.id !== current.id && r.status !== "signed",
                );
                setOpenId(rest[0]?.id ?? current.id);
              }}
            >
              Sign this one
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                sendBack(current.id);
                const rest = reviews.filter(
                  (r) => r.id !== current.id && r.status !== "signed",
                );
                setOpenId(rest[0]?.id ?? current.id);
              }}
            >
              Send back
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                setBody(current.id, filledBody(current.id, intake))
              }
            >
              Reload blanks from intake
            </Button>
          </div>
          {!checksDone ? (
            <p className="text-sm text-muted">
              Tick the counseling boxes above before a signature will take.
            </p>
          ) : null}
        </article>
      ) : (
        <p className="text-teal">The pile is signed. Recording is still yours.</p>
      )}
      <section className="grid gap-2">
        <h2 className="font-display text-xl">The rest of the pile</h2>
        <ul className="grid gap-2">
          {WORK_PILE.map((w) => {
            const r = reviews.find((x) => x.id === w.id);
            return (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(w.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm",
                    w.id === currentId
                      ? "border-gold bg-gold/10"
                      : "border-line bg-panel",
                  )}
                >
                  <span>
                    {w.title}
                    <span className="mt-0.5 block text-xs text-muted">
                      {w.ask}
                    </span>
                  </span>
                  <span className="shrink-0 text-gold-2">
                    {r?.status === "signed"
                      ? "Signed"
                      : r?.status === "returned"
                        ? "Sent back"
                        : "Needs you"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <Button
        variant="ghost"
        onClick={() => {
          const r = reviews.find((x) => x.id === currentId);
          if (r) reopen(r.id);
        }}
      >
        Reopen this one
      </Button>
      <Disclaimer />
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
