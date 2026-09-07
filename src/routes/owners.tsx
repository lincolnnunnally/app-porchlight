import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CopyNote } from "@/components/copy-note";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { CITIES } from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";
import {
  HOME_INTENTS,
  ownerInviteNote,
  type HomeIntent,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owners")({ component: OwnersPage });

function OwnersPage() {
  const upsertOwner = useRentalStore((s) => s.upsertOwner);
  const upsertHome = useRentalStore((s) => s.upsertHome);
  const addHouse = useHuntStore((s) => s.addHouse);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vidalia");
  const [bedsBaths, setBedsBaths] = useState("3 / 1");
  const [intent, setIntent] = useState<HomeIntent>("rent");
  const [fairRent, setFairRent] = useState(650);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [inviteFor, setInviteFor] = useState("neighbor");

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          For house owners
        </p>
        <h1 className="mt-1 max-w-3xl font-display text-3xl leading-tight sm:text-5xl">
          Tired of the listing machine?
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          Sit with Porchlight. Sell quietly. Or keep the house, rent it fairly
          to a family already waiting, and cash out when you want. Occupancy
          first if someone still lives there. We do not take houses.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <Pitch
          title="Quiet sale"
          body="No realtor tax if you don’t want one. A neighbor writes a letter you would actually want to read."
        />
        <Pitch
          title="Fair rent"
          body="We repair with our hands, keep rent honest, and you still see the revenue. Sign off on who lives there."
        />
        <Pitch
          title="Cash out later"
          body="When you want the money, put the house in the hunt or take it off market. You decide. Not a lockbox."
        />
      </section>
      <form
        className="grid gap-3 rounded-xl border border-line bg-panel p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !address.trim()) return;
          const ownerId = upsertOwner({ name, phone, notes });
          const homeId = upsertHome({
            address,
            city,
            bedsBaths,
            status: "vacant",
            fairRent: Number(fairRent) || 0,
            notes,
            payInstructions: "We’ll set this together.",
            ownerId,
            listing: "off_market",
            intent,
          });
          if (intent === "sale" || intent === "both") {
            addHouse({
              address,
              city,
              owner: name,
              bedsBaths,
              offer: fairRent ? `$${fairRent}` : "",
              notes: `Owner asked Porchlight. ${notes}`,
              stage: "watching",
            });
          }
          setSaved(
            `On the ledger as off-market (${homeId.slice(0, 6)}). Open the owner desk to put a light on.`,
          );
          setName("");
          setPhone("");
          setAddress("");
          setNotes("");
        }}
      >
        <h2 className="font-display text-2xl">Bring a house</h2>
        <p className="text-sm text-muted">
          Starts off market. You turn the light on from the owner desk when
          you are ready.
        </p>
        <Field label="Your name">
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Street address">
          <Input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>
        <Field label="City">
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Beds / baths">
          <Input
            value={bedsBaths}
            onChange={(e) => setBedsBaths(e.target.value)}
          />
        </Field>
        <Field label="What would serve you">
          <Select
            value={intent}
            onChange={(e) => setIntent(e.target.value as HomeIntent)}
          >
            {HOME_INTENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Fair monthly rent (if renting)"
          hint="Not market max. What keeps the porch light on."
        >
          <Input
            inputMode="decimal"
            value={String(fairRent)}
            onChange={(e) => setFairRent(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Notes">
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <Button type="submit">Add this house</Button>
        {saved ? <p className="text-sm text-teal">{saved}</p> : null}
      </form>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Invite another owner</h2>
        <p className="text-sm text-muted">
          A letter they would actually want to read. Not a flyer. Not a pitch
          deck.
        </p>
        <Field label="Their name (optional)">
          <Input
            value={inviteFor}
            onChange={(e) => setInviteFor(e.target.value)}
          />
        </Field>
        <CopyNote text={ownerInviteNote(inviteFor)} label="Copy the invitation" />
      </section>
      <Link
        to="/dash"
        className={cn(buttonVariants({ variant: "teal" }), "no-underline")}
      >
        Open the owner desk
      </Link>
    </div>
  );
}

function Pitch({ title, body }: { title: string; body: string }) {
  return (
    <article className="grid gap-2 rounded-xl border border-line bg-panel p-5">
      <h2 className="font-display text-xl">{title}</h2>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}
