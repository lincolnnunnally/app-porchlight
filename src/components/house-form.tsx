import { useEffect, useState } from "react";
import { CITIES, STAGES, type House, type HuntStage } from "@/lib/hunt";
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
