import { Field, Input, Select, Textarea } from "./ui/field";
import { Button } from "./ui/button";
import {
  FURNISH_STATUSES,
  PROPERTY_KINDS,
  factsAckFor,
  factsReadyForKeys,
  type FactsParty,
  type HouseFacts,
  type HouseFactsSpine,
} from "@/lib/house-facts";
import { formatDate } from "@/lib/utils";

export function HouseFactsFields({
  facts,
  onChange,
}: {
  facts: HouseFacts;
  onChange: (facts: HouseFacts) => void;
}) {
  const set = (patch: Partial<HouseFacts>) => onChange({ ...facts, ...patch });
  return (
    <fieldset className="grid gap-3">
      <legend className="font-display text-lg">House facts</legend>
      <p className="text-sm text-muted">
        One sheet on this house. Owner and renter see the same words. A later
        listing reads these fields — not a second facts store.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type">
          <Select
            value={facts.propertyKind}
            onChange={(e) =>
              set({ propertyKind: e.target.value as HouseFacts["propertyKind"] })
            }
          >
            {PROPERTY_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Furnished">
          <Select
            value={facts.furnished}
            onChange={(e) =>
              set({ furnished: e.target.value as HouseFacts["furnished"] })
            }
          >
            {FURNISH_STATUSES.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Wifi name">
          <Input
            value={facts.wifiNetwork}
            placeholder="ReedPorch"
            onChange={(e) => set({ wifiNetwork: e.target.value })}
          />
        </Field>
        <Field
          label="Wifi password"
          hint="On the house sheet. Not for a public listing."
        >
          <Input
            value={facts.wifiPassword}
            placeholder="Told at keys"
            onChange={(e) => set({ wifiPassword: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Trash day">
        <Input
          value={facts.trashDay}
          placeholder="Thursday — cans out by 7"
          onChange={(e) => set({ trashDay: e.target.value })}
        />
      </Field>
      <Field label="Lawn — who does it">
        <Input
          value={facts.lawnWho}
          placeholder="Occupant mows. Owner handles trees."
          onChange={(e) => set({ lawnWho: e.target.value })}
        />
      </Field>
      <Field label="Utilities">
        <Textarea
          rows={2}
          value={facts.utilities}
          placeholder="Occupant: power, water, trash. Owner: taxes and insurance."
          onChange={(e) => set({ utilities: e.target.value })}
        />
      </Field>
      <Field label="Occupant duties">
        <Textarea
          rows={2}
          value={facts.renterDuties}
          placeholder="Ordinary quiet use. Tell us when something breaks."
          onChange={(e) => set({ renterDuties: e.target.value })}
        />
      </Field>
      <Field label="Owner duties">
        <Textarea
          rows={2}
          value={facts.ownerDuties}
          placeholder="Repairs that protect occupancy, at documented cost."
          onChange={(e) => set({ ownerDuties: e.target.value })}
        />
      </Field>
      <Field
        label="Rent-to-own"
        hint="Leave blank if there are no rent-to-own terms."
      >
        <Textarea
          rows={2}
          value={facts.rentToOwn}
          placeholder="None — fair rent occupancy only."
          onChange={(e) => set({ rentToOwn: e.target.value })}
        />
      </Field>
    </fieldset>
  );
}

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted">{label}: </span>
      {value || "—"}
    </p>
  );
}

export function HouseFactsSheet({
  home,
  party,
  onAck,
  ackName,
}: {
  home: HouseFactsSpine;
  party?: FactsParty;
  onAck?: () => void;
  ackName?: string;
}) {
  const ownerAck = factsAckFor(home, "owner");
  const renterAck = factsAckFor(home, "renter");
  const mine = party ? factsAckFor(home, party) : undefined;
  const ready = factsReadyForKeys(home);
  const facts = home.facts;

  return (
    <section className="grid gap-2 rounded-lg border border-line bg-bg-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm tracking-wide text-gold-2 uppercase">
            House facts
          </p>
          <h3 className="font-display text-xl">Version {home.factsVersion}</h3>
        </div>
        <span className="rounded-full border border-line px-2 py-0.5 text-xs tracking-wide uppercase text-gold-2">
          {ready ? "Both acked · keys ok" : "Ack before keys"}
        </span>
      </div>
      <p className="text-sm text-muted">
        Same sheet on the house. Owner and renter read these words. Amendments
        make a new version — not a hallway conversation.
      </p>
      <FactLine
        label="Type"
        value={
          PROPERTY_KINDS.find((k) => k.id === facts.propertyKind)?.label ??
          facts.propertyKind
        }
      />
      <FactLine
        label="Furnished"
        value={
          FURNISH_STATUSES.find((k) => k.id === facts.furnished)?.label ??
          facts.furnished
        }
      />
      <FactLine label="Wifi" value={facts.wifiNetwork} />
      <FactLine label="Wifi password" value={facts.wifiPassword} />
      <FactLine label="Trash day" value={facts.trashDay} />
      <FactLine label="Lawn" value={facts.lawnWho} />
      <FactLine label="Utilities" value={facts.utilities} />
      <FactLine label="Occupant duties" value={facts.renterDuties} />
      <FactLine label="Owner duties" value={facts.ownerDuties} />
      <FactLine label="Rent-to-own" value={facts.rentToOwn || "none"} />
      <p className="text-sm text-muted">
        Owner:{" "}
        {ownerAck
          ? `acked ${formatDate(ownerAck.at)} · ${ownerAck.by}`
          : "waiting"}
        {" · "}
        Renter:{" "}
        {renterAck
          ? `acked ${formatDate(renterAck.at)} · ${renterAck.by}`
          : "waiting"}
      </p>
      {party && onAck ? (
        mine ? (
          <p className="text-sm text-teal">
            You acked version {home.factsVersion}
            {ackName ? ` as ${ackName}` : ""}.
          </p>
        ) : (
          <Button type="button" variant="teal" onClick={onAck}>
            Ack this version
            {ackName ? ` · ${ackName}` : ""}
          </Button>
        )
      ) : null}
    </section>
  );
}
