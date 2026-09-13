import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "./ui/button";
import { Field, Input } from "./ui/field";
import { CITIES } from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";
import { PLACE_PURPOSES, type PlacePurpose } from "@/lib/lookups";
import { useRentalStore } from "@/lib/rental-store";
import { cn, uid } from "@/lib/utils";

export function EnterPlaceForm({ compact }: { compact?: boolean }) {
  const navigate = useNavigate();
  const addHouse = useHuntStore((s) => s.addHouse);
  const upsertHome = useRentalStore((s) => s.upsertHome);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vidalia");
  const [purpose, setPurpose] = useState<PlacePurpose>("look");

  return (
    <form
      className="grid gap-4 rounded-xl border border-line bg-panel p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const street = address.trim();
        const town = city.trim() || "Vidalia";
        if (!street) return;
        const id = uid("p");
        addHouse({
          id,
          address: street,
          city: town,
          owner: "unknown",
          bedsBaths: "",
          offer: "",
          notes: "",
          stage: "watching",
        });
        if (purpose === "rent") {
          upsertHome({
            id,
            address: street,
            city: town,
            bedsBaths: "",
            status: "vacant",
            fairRent: 0,
            notes: "",
            payInstructions: "We'll set this together.",
            ownerId: "o1",
            listing: "off_market",
            intent: "rent",
          });
        }
        void navigate({
          to: "/place/$placeId",
          params: { placeId: id },
          search: { want: purpose },
        });
      }}
    >
      {compact ? null : (
        <div>
          <h2 className="font-display text-2xl">Start with an address</h2>
          <p className="mt-1 text-sm text-muted">
            We'll open the house — Street View, the tax assessor, GIS, Zillow,
            and what you can actually do with it. Saving does not dump you back
            on the porch with nothing in your hands.
          </p>
        </div>
      )}
      <Field label="Street address">
        <Input
          required
          value={address}
          placeholder="412 W First St"
          autoComplete="street-address"
          onChange={(e) => setAddress(e.target.value)}
        />
      </Field>
      <Field label="City">
        <Input
          required
          list="porchlight-cities"
          value={city}
          placeholder="Vidalia"
          onChange={(e) => setCity(e.target.value)}
        />
        <datalist id="porchlight-cities">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium text-muted">
          What do you want to do?
        </legend>
        <div className="flex flex-wrap gap-2">
          {PLACE_PURPOSES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPurpose(p.id)}
              className={cn(
                "min-h-11 rounded-full border px-3 text-sm",
                purpose === p.id
                  ? "border-gold bg-gold font-semibold text-night"
                  : "border-line text-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>
      <Button type="submit">Look this place up</Button>
    </form>
  );
}
