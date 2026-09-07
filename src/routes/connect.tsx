import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useRentalStore } from "@/lib/rental-store";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/connect")({
  component: ConnectPage,
});

function ConnectPage() {
  const name = useStewardStore((s) => s.connectorName);
  const church = useStewardStore((s) => s.connectorChurch);
  const code = useStewardStore((s) => s.connectorCode);
  const setConnector = useStewardStore((s) => s.setConnector);
  const upsertWait = useRentalStore((s) => s.upsertWait);
  const [localName, setLocalName] = useState(name);
  const [localChurch, setLocalChurch] = useState(church);
  const [copied, setCopied] = useState("Copy the referral note");
  const [family, setFamily] = useState({
    name: "",
    phone: "",
    household: "",
    wants: "",
    notes: "",
  });
  const [saved, setSaved] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://porchlight.unitedundergod.org";
  const link = useMemo(() => {
    const c = code || "neighbor";
    return `${origin}/protect?ref=${encodeURIComponent(c)}`;
  }, [origin, code]);

  const note = `A porch light is a small honest thing.

I’m sharing Porchlight Home Stewardship — not a listing, not a pitch. It explains what Georgia Medicaid estate recovery actually is (after death, not while a person is alive), and it only helps families who are still well and can plan five or more years ahead, with an attorney in the loop.

If care is needed now, do not move the title. Call an elder-law attorney.

If the family is still home and planning: ${link}

If a family needs a fair-rent house: tell Porchlight. We keep a waitlist, not a lead board.

People are the purpose.`;

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          Connector mode
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
          Share the explainer. Do not sell a house.
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          For pastors and neighbors in Vidalia, Lyons, and the churches that
          already sit with families. There is no lead board, no commission, and
          no pressure script.
        </p>
      </div>
      <AttorneyFlag>
        Referral language needs attorney review so it cannot be read as legal
        advice from the pulpit.
      </AttorneyFlag>
      <form
        className="grid gap-3 rounded-lg border border-line bg-panel p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setConnector(localName, localChurch);
        }}
      >
        <Field label="Your name">
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
        </Field>
        <Field label="Church or community (optional)">
          <Input
            value={localChurch}
            onChange={(e) => setLocalChurch(e.target.value)}
          />
        </Field>
        <Button type="submit" variant="teal">
          Make a referral link
        </Button>
      </form>
      {code ? (
        <section className="grid gap-3">
          <p className="text-sm text-muted">
            Link: <span className="text-ink">{link}</span>
          </p>
          <pre className="whitespace-pre-wrap rounded-lg border border-line bg-paper p-4 font-display text-sm leading-relaxed text-paper-ink">
            {note}
          </pre>
          <Button
            variant="ghost"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(note);
                setCopied("Copied");
                setTimeout(() => setCopied("Copy the referral note"), 1200);
              } catch {
                setCopied("Select and copy");
              }
            }}
          >
            {copied}
          </Button>
        </section>
      ) : null}
      <section className="grid gap-3 rounded-lg border border-line bg-panel p-5">
        <h2 className="font-display text-xl">A family needs a house</h2>
        <p className="text-sm leading-relaxed text-muted">
          Put them on the waitlist. Porchlight calls when a light comes on.
          You do not sell. You do not collect a fee.
        </p>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!family.name.trim()) return;
            upsertWait({
              name: family.name,
              phone: family.phone,
              household: family.household,
              wants: family.wants,
              notes: family.notes,
              status: "interested",
              homeId: "",
              referredBy: [localName, localChurch].filter(Boolean).join(" · "),
            });
            setFamily({ name: "", phone: "", household: "", wants: "", notes: "" });
            setSaved("On the waitlist. Thank you.");
          }}
        >
          <Field label="Name">
            <Input
              required
              value={family.name}
              onChange={(e) => setFamily({ ...family, name: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={family.phone}
              onChange={(e) => setFamily({ ...family, phone: e.target.value })}
            />
          </Field>
          <Field label="Household">
            <Input
              value={family.household}
              onChange={(e) =>
                setFamily({ ...family, household: e.target.value })
              }
            />
          </Field>
          <Field label="What they need">
            <Input
              value={family.wants}
              placeholder="One-story, Vidalia, under $750"
              onChange={(e) => setFamily({ ...family, wants: e.target.value })}
            />
          </Field>
          <Field label="Notes">
            <Textarea
              rows={2}
              value={family.notes}
              onChange={(e) => setFamily({ ...family, notes: e.target.value })}
            />
          </Field>
          <Button type="submit">Add to the waitlist</Button>
        </form>
        {saved ? <p className="text-sm text-teal">{saved}</p> : null}
        <Link
          to="/rent/waitlist"
          className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
        >
          Open the waitlist
        </Link>
      </section>
      <section className="rounded-lg border border-line bg-panel p-5">
        <h2 className="font-display text-xl">When not to share this</h2>
        <p className="mt-2 leading-relaxed text-muted">
          If a family is already in a nursing-home Medicaid scramble, this is
          not the tool. Sit with them. Help them call an elder-law attorney.
          Do not move title from the church office.
        </p>
      </section>
      <Link
        to="/protect"
        className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
      >
        Open the explainer
      </Link>
      <Disclaimer />
    </div>
  );
}
