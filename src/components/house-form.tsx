import { useEffect, useState } from "react";
import { HouseFactsFields } from "./house-facts";
import { CITIES, STAGES, type House, type HuntStage } from "@/lib/hunt";
import { EMPTY_HOUSE_FACTS, type HouseFacts } from "@/lib/house-facts";
import { useRentalStore } from "@/lib/rental-store";
import { Button } from "./ui/button";
import { Field, Input, Select, Textarea } from "./ui/field";

const blank = {
  address: "",
  city: "Vidalia",
  owner: "",
  bedsBaths: "",
  offer: "",
  notes: "",
  stage: "watching" as HuntStage,
};

export function HouseForm({
  house,
  onSave,
  onCancel,
  onDelete,
}: {
  house: House | null;
  onSave: (row: Omit<House, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState(blank);
  const [facts, setFacts] = useState<HouseFacts>({ ...EMPTY_HOUSE_FACTS });
  const homes = useRentalStore((s) => s.homes);
  const saveHouseFacts = useRentalStore((s) => s.saveHouseFacts);
  const rental = homes.find(
    (h) =>
      h.address.trim().toLowerCase() === form.address.trim().toLowerCase() &&
      h.city === form.city,
  );

  useEffect(() => {
    const match = useRentalStore
      .getState()
      .homes.find((h) => h.id === rental?.id);
    if (match) setFacts(match.facts);
  }, [rental?.id, rental?.factsVersion]);

  useEffect(() => {
    if (house) {
      setForm({
        address: house.address,
        city: house.city,
        owner: house.owner === "unknown" ? "" : house.owner,
        bedsBaths: house.bedsBaths,
        offer: house.offer,
        notes: house.notes,
        stage: house.stage,
      });
    } else {
      setForm(blank);
    }
  }, [house]);

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...form,
          owner: form.owner.trim() || "unknown",
        });
        if (rental) saveHouseFacts(rental.id, facts);
      }}
    >
      <h2 className="font-display text-2xl">
        {house ? "Edit house" : "Add a house"}
      </h2>
      <Field label="Street address">
        <Input
          required
          value={form.address}
          placeholder="412 W First St, Vidalia"
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </Field>
      <Field label="City">
        <Select
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        >
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <Field label="Owner name (if you know it)">
        <Input
          value={form.owner}
          placeholder="May still be unknown"
          onChange={(e) => setForm({ ...form, owner: e.target.value })}
        />
      </Field>
      <Field label="Beds / baths">
        <Input
          value={form.bedsBaths}
          placeholder="3 / 2"
          onChange={(e) => setForm({ ...form, bedsBaths: e.target.value })}
        />
      </Field>
      <Field label="What you might pay">
        <Input
          value={form.offer}
          placeholder="$85,000"
          onChange={(e) => setForm({ ...form, offer: e.target.value })}
        />
      </Field>
      <Field label="Why this one">
        <Textarea
          rows={3}
          value={form.notes}
          placeholder="Roof looks tired. Big lot. Close to the onion plant shift change."
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>
      {rental ? (
        <HouseFactsFields facts={facts} onChange={setFacts} />
      ) : (
        <p className="text-sm text-muted">
          House facts (wifi, trash, lawn, duties) live on the rental house
          record. Bring the house on Owners or add it under Rent when it is
          in operation — leases read that same sheet.
        </p>
      )}
      <Field label="Hunt stage">
        <Select
          value={form.stage}
          onChange={(e) =>
            setForm({ ...form, stage: e.target.value as HuntStage })
          }
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit">Save</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        {house && onDelete ? (
          <Button variant="danger" className="ml-auto" onClick={onDelete}>
            Remove
          </Button>
        ) : null}
      </div>
    </form>
  );
}
