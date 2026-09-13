import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CopyNote } from "@/components/copy-note";
import { Button, buttonVariants } from "@/components/ui/button";
import { listingContactFor, PUBLIC_ORIGIN, siteOrigin } from "@/lib/listing-contact";
import { Field, Input } from "@/components/ui/field";
import {
  decodeListing,
  listingJsonLd,
  listingPath,
  listingSummary,
  listingText,
  listingTitle,
  publicListingFrom,
  type PublicListing,
} from "@/lib/listing";
import { isSearchable } from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn, formatDate, formatMoney } from "@/lib/utils";

type ListingSearch = { d?: string };

export const Route = createFileRoute("/listing/$homeId")({
  validateSearch: (search: Record<string, unknown>): ListingSearch => ({
    d: typeof search.d === "string" && search.d ? search.d : undefined,
  }),
  loaderDeps: ({ search }) => ({ d: search.d }),
  loader: ({ deps, params }) => ({
    shared: decodeListing(deps.d),
    homeId: params.homeId,
  }),
  head: ({ loaderData }) => {
    const listing = loaderData?.shared;
    if (!listing) {
      return { meta: [{ title: "Porch light listing · Porchlight" }] };
    }
    const url = `${PUBLIC_ORIGIN}${listingPath(listing)}`;
    return {
      meta: [
        { title: listingTitle(listing) },
        { name: "description", content: listingSummary(listing) },
        { name: "robots", content: "index,follow" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(listingJsonLd(listing, url)),
        },
      ],
    };
  },
  component: ListingPage,
});

function ListingPage() {
  const { shared, homeId } = Route.useLoaderData();
  const homes = useRentalStore((s) => s.homes);
  const upsertWait = useRentalStore((s) => s.upsertWait);
  const local = homes.find((h) => h.id === homeId);
  const listing: PublicListing | null =
    shared ??
    (local && isSearchable(local)
      ? publicListingFrom(local, listingContactFor(local))
      : null);
  const [ask, setAsk] = useState({ name: "", phone: "" });
  const [saved, setSaved] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);

  if (!listing) {
    return (
      <div className="grid max-w-xl gap-3">
        <p className="text-sm tracking-wide text-gold-2 uppercase">Porch light</p>
        <h1 className="font-display text-3xl">This light is not on right now</h1>
        <p className="text-muted">
          Either the house is occupied or off market, or this link did not
          carry the listing. Ask the person who shared it for a fresh link, or
          look at what is on the porch now.
        </p>
        <Link to="/search" className={cn(buttonVariants(), "self-start no-underline")}>
          See what is on the porch
        </Link>
      </div>
    );
  }

  const kind =
    listing.intent === "sale"
      ? "Quiet sale"
      : listing.intent === "both"
        ? "Fair rent or quiet sale"
        : "Fair rent";
  const url = `${siteOrigin()}${listingPath(listing)}`;
  const facts: [string, string][] = [
    ["Type", listing.propertyKind === "commercial" ? "Commercial" : "Residential"],
    ["Furnished", listing.furnished === "furnished" ? "Furnished" : "Unfurnished"],
    ["Trash day", listing.trashDay],
    ["Lawn", listing.lawnWho],
    ["Utilities", listing.utilities],
    ["Occupant duties", listing.renterDuties],
    ["Owner duties", listing.ownerDuties],
    ["Rent-to-own", listing.rentToOwn || "none"],
  ];

  return (
    <article className="mx-auto grid max-w-3xl gap-8">
      <header className="grid gap-3">
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          Porch light on · {kind}
        </p>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          {listing.address}
        </h1>
        <p className="text-lg text-muted">
          {listing.city}, GA
          {listing.bedsBaths ? ` · ${listing.bedsBaths} beds / baths` : ""}
        </p>
        {listing.fairRent ? (
          <p className="font-display text-3xl text-gold-2">
            {formatMoney(listing.fairRent)}
            <span className="text-base text-muted"> / month · fair rent, not market max</span>
          </p>
        ) : null}
        {listing.notes ? (
          <p className="max-w-2xl text-lg leading-relaxed">{listing.notes}</p>
        ) : null}
      </header>

      <section className="grid gap-2 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-display text-2xl">What you are agreeing to</h2>
        <p className="text-sm text-muted">
          The same sheet the owner and the household sign before keys. No
          surprises in the hallway later.
        </p>
        <dl className="grid gap-2 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-bg-2 px-4 py-3">
              <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-3 rounded-xl border border-gold/40 bg-panel p-5">
        <h2 className="font-display text-2xl">Ask to be told</h2>
        <p className="text-sm text-muted">
          No application fee. No credit pull. We call the people already
          waiting first, then walk the house together.
        </p>
        {listing.contact ? (
          <p className="text-sm">
            Call or text <span className="text-gold-2">{listing.contact}</span>
          </p>
        ) : null}
        {local ? (
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!ask.name.trim()) return;
              upsertWait({
                name: ask.name.trim(),
                phone: ask.phone.trim(),
                household: "",
                wants: `Asked from the public listing: ${listing.address}, ${listing.city}`,
                notes: "Public listing",
                status: "interested",
                homeId: local.id,
                referredBy: "Public listing",
              });
              setSaved("You are on the list. We call when it is your turn to walk it.");
              setAsk({ name: "", phone: "" });
            }}
          >
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
            <div className="flex items-end">
              <Button type="submit">Join the waitlist</Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted">
            This link came from a Porchlight notebook on another device. Call
            or text the number above and say which house.
          </p>
        )}
        {saved ? <p className="text-sm text-teal">{saved}</p> : null}
      </section>

      <section className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowText((v) => !v)}>
            {showText ? "Hide the paste-ready note" : "Paste-ready note for Google / a bulletin"}
          </Button>
          {local ? (
            <Link
              to="/place/$placeId"
              params={{ placeId: local.id }}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "no-underline")}
            >
              Open the house record
            </Link>
          ) : null}
        </div>
        {showText ? <CopyNote text={listingText(listing, url)} label="Copy listing text" /> : null}
        <p className="text-xs text-muted">
          Facts as of {formatDate(listing.postedAt)}. A porch light listing is a
          neighborly notice, not a lease, a sale, or legal advice. An attorney
          still signs anything binding.
        </p>
      </section>
    </article>
  );
}
