import { useState } from "react";
import { ObjectionNote, RaiseObjection } from "./objection";
import { Button } from "./ui/button";
import { Field, Input, Textarea } from "./ui/field";
import { WORK_STATUSES, objectionOpen, type Party } from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatDate } from "@/lib/utils";

/**
 * "Something needs hands" plus the list of work on this house. When a job is
 * marked done and it is not, the household says so here; the manager has to
 * answer on Work. Shared by the household desk and the Desk renter seat.
 */
export function HouseholdWork({
  homeId,
  who,
  from = "renter",
  compact,
}: {
  homeId: string;
  who: string;
  from?: Party;
  compact?: boolean;
}) {
  const work = useRentalStore((s) => s.work);
  const upsertWork = useRentalStore((s) => s.upsertWork);
  const pushBackWork = useRentalStore((s) => s.pushBackWork);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const mine = work.filter((w) => w.homeId === homeId);

  return (
    <section className="grid gap-3 rounded-lg border border-line bg-panel p-5">
      <h2 className="font-display text-xl">Something needs hands</h2>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          upsertWork({
            homeId,
            title: title.trim(),
            detail: detail.trim(),
            status: "needed",
            cost: 0,
            who,
            vendorId: "",
            scheduledAt: null,
          });
          setTitle("");
          setDetail("");
          setSent("Work is on the board.");
        }}
      >
        <Field label="What is wrong">
          <Input
            value={title}
            placeholder="Porch rail wobble"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        {compact ? null : (
          <Field label="A little more">
            <Textarea
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </Field>
        )}
        <Button type="submit" variant="teal" className="justify-self-start">
          Ask for the work
        </Button>
      </form>
      {mine.length ? (
        <ul className="grid gap-2">
          {mine.map((w) => (
            <li key={w.id} className="grid gap-2 rounded-md border border-line bg-bg-2 px-3 py-2 text-sm">
              <p>
                <span className="font-medium">{w.title}</span>
                <span className="text-muted">
                  {" · "}
                  {WORK_STATUSES.find((s) => s.id === w.status)?.label}
                  {w.scheduledAt ? ` · ${formatDate(w.scheduledAt)}` : ""}
                </span>
              </p>
              <ObjectionNote objection={w.objection} />
              {w.status === "done" && !objectionOpen(w) ? (
                <RaiseObjection
                  label="Not fixed"
                  placeholder="Still drips under the sink after the fix."
                  onSend={(reason) => {
                    pushBackWork(w.id, from, reason);
                    setSent("Sent. It goes back on the board and the manager answers.");
                  }}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {sent ? <p className="text-sm text-teal">{sent}</p> : null}
    </section>
  );
}
