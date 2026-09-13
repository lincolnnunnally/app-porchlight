import { useState } from "react";
import { Button } from "./ui/button";
import { Field, Input, Select, Textarea } from "./ui/field";
import {
  OBJECTION_OUTCOMES,
  objectionLabel,
  type Objection,
  type ObjectionOutcome,
  type Party,
} from "@/lib/rental";
import { cn, formatDate } from "@/lib/utils";

const WHO: Record<Party, string> = {
  renter: "Household",
  owner: "Owner",
  manager: "Manager",
};

/** What was said, and the answer once there is one. Both sides read the same words. */
export function ObjectionNote({
  objection,
  className,
}: {
  objection: Objection | null | undefined;
  className?: string;
}) {
  if (!objection) return null;
  const open = objection.outcome === "open";
  return (
    <div
      className={cn(
        "grid gap-1 rounded-md border px-3 py-2 text-sm",
        open ? "border-gold/50 bg-gold/5" : "border-line bg-bg-2",
        className,
      )}
    >
      <p>
        <span className="text-xs tracking-wide text-gold-2 uppercase">
          {WHO[objection.by]} · {formatDate(objection.at)}
        </span>
        <br />
        {objection.reason}
      </p>
      {open ? (
        <p className="text-xs text-muted">Waiting on an answer from the manager.</p>
      ) : (
        <p>
          <span className="text-xs tracking-wide text-teal uppercase">
            {objectionLabel(objection.outcome)}
            {objection.answeredAt ? ` · ${formatDate(objection.answeredAt)}` : ""}
          </span>
          {objection.answer ? (
            <>
              <br />
              {objection.answer}
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}

/** The household (or owner) says what is off. One reason, sent once. */
export function RaiseObjection({
  label,
  placeholder,
  onSend,
}: {
  label: string;
  placeholder: string;
  onSend: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!open) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        onSend(reason.trim());
        setReason("");
        setOpen(false);
      }}
    >
      <Field label="What is off">
        <Textarea
          rows={2}
          autoFocus
          value={reason}
          placeholder={placeholder}
          onChange={(e) => setReason(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="teal">
          Send
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Never mind
        </Button>
      </div>
    </form>
  );
}

type PaymentOutcome = Exclude<ObjectionOutcome, "open" | "reopened" | "declined">;
type WorkOutcome = Exclude<ObjectionOutcome, "open" | "adjusted" | "waived">;

/** The manager closes the loop with an outcome and a reason both sides can read. */
export function AnswerObjection(
  props:
    | {
        kind: "payment";
        amount: number;
        onAnswer: (outcome: PaymentOutcome, answer: string, newAmount?: number) => void;
      }
    | {
        kind: "work";
        onAnswer: (outcome: WorkOutcome, answer: string) => void;
      },
) {
  const options = OBJECTION_OUTCOMES.filter(
    (o) => o.on === "both" || o.on === props.kind,
  );
  const [outcome, setOutcome] = useState<string>(options[0]?.id ?? "stands");
  const [answer, setAnswer] = useState("");
  const [amount, setAmount] = useState(props.kind === "payment" ? String(props.amount) : "");

  return (
    <form
      className="grid gap-2 rounded-md border border-line bg-panel p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!answer.trim()) return;
        if (props.kind === "payment") {
          props.onAnswer(
            outcome as PaymentOutcome,
            answer.trim(),
            outcome === "adjusted" ? Number(amount) || 0 : undefined,
          );
        } else {
          props.onAnswer(outcome as WorkOutcome, answer.trim());
        }
        setAnswer("");
      }}
    >
      <p className="text-xs tracking-wide text-gold-2 uppercase">Answer</p>
      <Field label="Outcome">
        <Select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      {props.kind === "payment" && outcome === "adjusted" ? (
        <Field label="New amount">
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
      ) : null}
      <Field label="Why, in plain words">
        <Textarea
          rows={2}
          value={answer}
          placeholder="Receipt showed cash on the 3rd. Adjusted."
          onChange={(e) => setAnswer(e.target.value)}
        />
      </Field>
      <Button type="submit" size="sm" variant="teal" className="justify-self-start">
        Send the answer
      </Button>
    </form>
  );
}
