import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CopyNote } from "./copy-note";
import { Button, buttonVariants } from "./ui/button";
import { Field, Input, Select, Textarea } from "./ui/field";
import {
  LETTER_OPTIONS,
  writeLetter,
  type House,
  type LetterKind,
} from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";
import type { PlacePurpose } from "@/lib/lookups";
import {
  countyNameForIntake,
  donateConversationNote,
  giftIntentNote,
  protectHouseAddress,
} from "@/lib/next-steps";
import { useRentalStore } from "@/lib/rental-store";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

/**
 * Finish sell / keep / donate / live on this house. Do not dump the person
 * onto a generic department page with the address left behind.
 */
export function HouseNext({
  want,
  placeId,
  address,
  city,
  hunt,
  ensureHunt,
  ensureRent,
}: {
  want?: PlacePurpose;
  placeId: string;
  address: string;
  city: string;
  hunt?: House;
  ensureHunt: () => void;
  ensureRent: () => void;
}) {
  if (want === "sell") {
    return (
      <SellOnHouse
        placeId={placeId}
        address={address}
        city={city}
        hunt={hunt}
        ensureHunt={ensureHunt}
      />
    );
  }
  if (want === "protect") {
    return (
      <ProtectOnHouse
        placeId={placeId}
        address={address}
        city={city}
      />
    );
  }
  if (want === "donate") {
    return (
      <DonateOnHouse
        placeId={placeId}
        address={address}
        city={city}
        hunt={hunt}
        ensureHunt={ensureHunt}
      />
    );
  }
  if (want === "live") {
    return (
      <LiveOnHouse
        placeId={placeId}
        address={address}
        city={city}
        ensureRent={ensureRent}
      />
    );
  }
  return null;
}

function Panel({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      id="next-step"
      className="grid gap-3 rounded-xl border border-gold/40 bg-panel p-5"
    >
      <p className="text-sm tracking-wide text-gold-2 uppercase">{kicker}</p>
      <h2 className="font-display text-2xl leading-snug">{title}</h2>
      {children}
    </aside>
  );
}

function SellOnHouse({
  placeId,
  address,
  city,
  hunt,
  ensureHunt,
}: {
  placeId: string;
  address: string;
  city: string;
  hunt?: House;
  ensureHunt: () => void;
}) {
  const addLetter = useHuntStore((s) => s.addLetter);
  const setStage = useHuntStore((s) => s.setStage);
  const [kind, setKind] = useState<LetterKind>("cash");
  const house: House = hunt ?? {
    id: placeId,
    address,
    city,
    owner: "unknown",
    bedsBaths: "",
    offer: "",
    notes: "",
    stage: "watching",
  };
  const [body, setBody] = useState(() => writeLetter("cash", house));
  const [saved, setSaved] = useState<string | null>(null);

  function pickKind(next: LetterKind) {
    setKind(next);
    setBody(writeLetter(next, house));
  }

  return (
    <Panel
      kicker="Quiet sale"
      title="Write the owner from this house"
    >
      <p className="text-sm leading-relaxed text-muted">
        Cash as-is, a neighbor note, or sweat equity — the letter stays on this
        record. It is not a listing and not a closed sale.
      </p>
      <Field label="Kind of letter">
        <Select
          value={kind}
          onChange={(e) => pickKind(e.target.value as LetterKind)}
        >
          {LETTER_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Textarea
        rows={12}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="min-h-48 rounded-lg border-line bg-paper font-display text-base leading-relaxed text-paper-ink"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            if (!body.trim()) return;
            ensureHunt();
            addLetter({ houseId: house.id, at: Date.now(), body });
            if (house.stage === "watching") setStage(house.id, "letter");
            setSaved("Saved on this house.");
          }}
        >
          Save on this house
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(body);
              setSaved("Copied. Mail it, or walk it to the porch.");
            } catch {
              setSaved("Select the letter and copy it.");
            }
          }}
        >
          Copy
        </Button>
      </div>
      {saved ? <p className="text-sm text-teal">{saved}</p> : null}
    </Panel>
  );
}

function ProtectOnHouse({
  placeId,
  address,
  city,
}: {
  placeId: string;
  address: string;
  city: string;
}) {
  const setIntake = useStewardStore((s) => s.setIntake);

  useEffect(() => {
    setIntake({
      placeId,
      address: protectHouseAddress(address, city),
      county: countyNameForIntake(city),
    });
  }, [placeId, address, city, setIntake]);

  return (
    <Panel
      kicker="Keep use of the home"
      title="Plan while someone is still well"
    >
      <p className="text-sm leading-relaxed text-muted">
        Occupancy stays with the person who lives here. The season quiz only
        sorts planning from crisis. An attorney still signs. We never take the
        house. This address is already on the intake.
      </p>
      <p className="text-sm">
        {protectHouseAddress(address, city)} · {countyNameForIntake(city)} County
      </p>
      <Link
        to="/protect/quiz"
        search={{ place: placeId }}
        className={cn(buttonVariants({ size: "sm" }), "mt-1 self-start no-underline")}
      >
        Start with the season
      </Link>
    </Panel>
  );
}

function DonateOnHouse({
  placeId,
  address,
  city,
  hunt,
  ensureHunt,
}: {
  placeId: string;
  address: string;
  city: string;
  hunt?: House;
  ensureHunt: () => void;
}) {
  const updateHouse = useHuntStore((s) => s.updateHouse);
  const [saved, setSaved] = useState<string | null>(null);
  const note = donateConversationNote(address, city);
  const intent = giftIntentNote(address, city);

  return (
    <Panel
      kicker="A gift of the house"
      title="Give it so someone can live there"
    >
      <p className="text-sm leading-relaxed text-muted">
        A donated house can become a home. A gift to a 501(c)(3) is a legal
        act. We do not issue a tax receipt from this screen, and we do not
        promise a deduction. An attorney still papers the deed. We do not take
        houses.
      </p>
      <CopyNote text={note} label="Copy the conversation note" />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            ensureHunt();
            const prior = hunt?.notes?.trim() ?? "";
            const next = prior.includes("Gift intent")
              ? prior
              : [prior, intent].filter(Boolean).join("\n\n");
            updateHouse(placeId, { notes: next });
            setSaved("Gift intent is on this house. Still not a receipt.");
          }}
        >
          Save gift intent on this house
        </Button>
        <Link
          to="/protect/quiz"
          search={{ place: placeId }}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "no-underline",
          )}
        >
          Sit with Keep first
        </Link>
        <Link
          to="/connect"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "no-underline",
          )}
        >
          Ask a connector
        </Link>
      </div>
      {saved ? <p className="text-sm text-teal">{saved}</p> : null}
    </Panel>
  );
}

function LiveOnHouse({
  placeId,
  address,
  city,
  ensureRent,
}: {
  placeId: string;
  address: string;
  city: string;
  ensureRent: () => void;
}) {
  const upsertWait = useRentalStore((s) => s.upsertWait);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hands, setHands] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <Panel
      kicker="Live here"
      title="Ask to be told about this house"
    >
      <p className="text-sm leading-relaxed text-muted">
        Fair rent, or a house that still needs hands. This is a waitlist, not
        an application, not a credit pull, and not a promise the light is on.
        We call when it is your turn to walk it.
      </p>
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          ensureRent();
          upsertWait({
            name: name.trim(),
            phone: phone.trim(),
            household: name.trim(),
            wants: hands
              ? `This house · sweat equity / I repair with my hands · ${address}, ${city}`
              : `This house · ${address}, ${city}`,
            notes: "Asked from the house page",
            status: "interested",
            homeId: placeId,
            referredBy: "House page",
          });
          setName("");
          setPhone("");
          setSaved("You are on the list for this house.");
        }}
      >
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
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hands}
            onChange={(e) => setHands(e.target.checked)}
          />
          I can put my hands to work (sweat equity)
        </label>
        <Button type="submit">Ask to be told</Button>
      </form>
      {saved ? <p className="text-sm text-teal">{saved}</p> : null}
    </Panel>
  );
}
