import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { CITIES } from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";
import {
  bedsOf,
  homeLabel,
  isSearchable,
} from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn, formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/search")({ component: SearchPage });

function SearchPage() {
  const homes = useRentalStore((s) => s.homes);
  const hunt = useHuntStore((s) => s.houses);
  const upsertWait = useRentalStore((s) => s.upsertWait);
  const offerFromWait = useRentalStore((s) => s.offerFromWait);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [max, setMax] = useState("");
  const [beds, setBeds] = useState("");
  const [kind, setKind] = useState<"rent" | "sale" | "all">("all");
  const [ask, setAsk] = useState<{ homeId: string; name: string; phone: string } | null>(
    null,
  );
  const [saved, setSaved] = useState<string | null>(null);

  const listings = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const maxN = Number(max) || 0;
    const bedsN = Number(beds) || 0;
    const rentals = homes.filter((h) => {
      if (!isSearchable(h)) return false;
      if (kind === "rent" && h.intent === "sale") return false;
      if (kind === "sale" && h.intent === "rent") return false;
      if (city && h.city !== city) return false;
      if (maxN && h.fairRent > maxN) return false;
      if (bedsN && bedsOf(h.bedsBaths) < bedsN) return false;
      if (
        needle &&
        !`${h.address} ${h.city} ${h.notes}`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
    const buys =
      kind === "rent"
        ? []
        : hunt.filter((h) => {
            if (h.stage === "contract") return false;
            if (city && h.city !== city) return false;
            if (
              needle &&
              !`${h.address} ${h.city} ${h.notes}`.toLowerCase().includes(needle)
            ) {
              return false;
            }
            return true;
          });
    return { rentals, buys };
  }, [homes, hunt, q, city, max, beds, kind]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm tracking-wide text-gold-2 uppercase">Search</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl">
          A house before it becomes a listing
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Fair rent for working families, or a quiet buy from the hunt. Not
          Zillow. Owners put a light on when they are ready.
        </p>
      </div>
      <form
        className="grid gap-3 rounded-xl border border-line bg-panel p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <Field label="Words" className="lg:col-span-2">
          <Input
            value={q}
            placeholder="Porch, Vidalia, one-story"
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
        <Field label="City">
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Anywhere here</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Max rent">
          <Input
            inputMode="decimal"
            value={max}
            placeholder="750"
            onChange={(e) => setMax(e.target.value)}
          />
        </Field>
        <Field label="Beds at least">
          <Select value={beds} onChange={(e) => setBeds(e.target.value)}>
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </Select>
        </Field>
        <fieldset className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
          <legend className="sr-only">Kind</legend>
          {(
            [
              ["all", "All"],
              ["rent", "Fair rent"],
              ["sale", "Quiet sale"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm",
                kind === id
                  ? "border-gold bg-gold font-semibold text-night"
                  : "border-line text-muted",
              )}
              onClick={() => setKind(id)}
            >
              {label}
            </button>
          ))}
        </fieldset>
      </form>
      <section className="grid gap-4">
        <h2 className="font-display text-2xl">Fair rent</h2>
        {listings.rentals.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing on the porch right now. Join the waitlist from Connectors.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.rentals.map((h) => (
              <article
                key={h.id}
                className="grid gap-2 rounded-xl border border-line bg-panel p-5"
              >
                <p className="text-xs tracking-wide text-teal uppercase">
                  {h.status} · {h.intent === "both" ? "rent or sale" : h.intent}
                </p>
                <h3 className="font-display text-xl">{h.address}</h3>
                <p className="text-sm text-muted">
                  {h.city} · {h.bedsBaths} · {formatMoney(h.fairRent)} / mo
                </p>
                <p className="text-sm leading-relaxed text-muted">{h.notes}</p>
                <Button
                  onClick={() =>
                    setAsk({ homeId: h.id, name: "", phone: "" })
                  }
                >
                  Ask to be told
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
      {kind !== "rent" ? (
        <section className="grid gap-4">
          <h2 className="font-display text-2xl">Quiet sale (hunt)</h2>
          {listings.buys.length === 0 ? (
            <p className="text-sm text-muted">No off-market houses match.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {listings.buys.map((h) => (
                <article
                  key={h.id}
                  className="grid gap-2 rounded-xl border border-line bg-panel p-5"
                >
                  <p className="text-xs tracking-wide text-gold-2 uppercase">
                    {h.stage} · {h.offer || "talk first"}
                  </p>
                  <h3 className="font-display text-xl">{h.address}</h3>
                  <p className="text-sm text-muted">
                    {h.city} · {h.bedsBaths} · {h.owner}
                  </p>
                  <p className="text-sm leading-relaxed text-muted">{h.notes}</p>
                  <Link
                    to="/letters"
                    search={{ house: h.id }}
                    className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
                  >
                    Write the owner
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
      {ask ? (
        <form
          className="grid gap-3 rounded-xl border border-gold/40 bg-panel p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ask.name.trim()) return;
            const id = upsertWait({
              name: ask.name,
              phone: ask.phone,
              household: "",
              wants: `Asked from search: ${homeLabel(homes, ask.homeId)}`,
              notes: "Housing search",
              status: "interested",
              homeId: ask.homeId,
              referredBy: "Search",
            });
            offerFromWait(id);
            setSaved("You’re on the list. We call when the light is on.");
            setAsk(null);
          }}
        >
          <h2 className="font-display text-xl">
            Ask about {homeLabel(homes, ask.homeId)}
          </h2>
          <Field label="Your name">
            <Input
              required
              value={ask.name}
              onChange={(e) => setAsk({ ...ask, name: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={ask.phone}
              onChange={(e) => setAsk({ ...ask, phone: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Join the waitlist</Button>
            <Button variant="ghost" onClick={() => setAsk(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      {saved ? <p className="text-sm text-teal">{saved}</p> : null}
    </div>
  );
}
