import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { HouseFactsFields, HouseFactsSheet } from "@/components/house-facts";
import { HouseForm } from "@/components/house-form";
import { HouseNext } from "@/components/house-next";
import { HouseOperate } from "@/components/house-operate";
import { Modal } from "@/components/modal";
import { PropertyLookups } from "@/components/property-lookups";
import { StreetView } from "@/components/street-view";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { stageLabel, STAGES, type HuntStage } from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";
import type { HouseFacts } from "@/lib/house-facts";
import {
  PLACE_PURPOSES,
  type PlacePurpose,
} from "@/lib/lookups";
import { findPlace } from "@/lib/place";
import { HOME_STATUSES, type HomeStatus } from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { cn, formatMoney } from "@/lib/utils";

type PlaceSearch = { want?: PlacePurpose };

export const Route = createFileRoute("/place/$placeId")({
  component: PlacePage,
  validateSearch: (search: Record<string, unknown>): PlaceSearch => ({
    want:
      typeof search.want === "string" &&
      PLACE_PURPOSES.some((p) => p.id === search.want)
        ? (search.want as PlacePurpose)
        : undefined,
  }),
});

function PlacePage() {
  const { placeId } = Route.useParams();
  const { want } = Route.useSearch();
  const navigate = useNavigate();
  const houses = useHuntStore((s) => s.houses);
  const addHouse = useHuntStore((s) => s.addHouse);
  const updateHouse = useHuntStore((s) => s.updateHouse);
  const setStage = useHuntStore((s) => s.setStage);
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const payments = useRentalStore((s) => s.payments);
  const upsertHome = useRentalStore((s) => s.upsertHome);
  const setHomeStatus = useRentalStore((s) => s.setHomeStatus);
  const saveHouseFacts = useRentalStore((s) => s.saveHouseFacts);
  const ackFacts = useRentalStore((s) => s.ackFacts);
  // On the server the persisted stores have no `persist` API (no storage),
  // so guard it: SSR renders the "opening" state and the client hydrates.
  const [hydrated, setHydrated] = useState(
    () =>
      Boolean(useHuntStore.persist?.hasHydrated?.()) &&
      Boolean(useRentalStore.persist?.hasHydrated?.()),
  );
  const [editing, setEditing] = useState(false);
  const [factsDraft, setFactsDraft] = useState<HouseFacts | null>(null);
  const [factsSaved, setFactsSaved] = useState(false);
  const [seat, setSeat] = useState<"look" | "owner" | "occupant">("look");

  useEffect(() => {
    let alive = true;
    if (
      useHuntStore.persist?.hasHydrated?.() &&
      useRentalStore.persist?.hasHydrated?.()
    ) {
      setHydrated(true);
      return;
    }
    void Promise.all([
      useHuntStore.persist.rehydrate(),
      useRentalStore.persist.rehydrate(),
    ]).then(() => {
      if (alive) setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const place = useMemo(
    () => findPlace(placeId, houses, homes),
    [placeId, houses, homes],
  );

  useEffect(() => {
    if (place?.rent) setFactsDraft(place.rent.facts);
    else setFactsDraft(null);
    setFactsSaved(false);
  }, [place?.rent]);

  useEffect(() => {
    if (
      want === "sell" ||
      want === "protect" ||
      want === "donate" ||
      want === "live"
    ) {
      document.getElementById("next-step")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [want]);

  if (!place && !hydrated) {
    return <p className="text-muted">Opening the notebook…</p>;
  }

  if (!place) {
    return (
      <div className="grid gap-3">
        <h1 className="font-display text-3xl">This place isn't here</h1>
        <p className="max-w-xl text-muted">
          The record isn't on this device. If you entered it on another phone,
          it didn't travel — accounts for a shared notebook are not on yet.
        </p>
        <Link to="/" className={cn(buttonVariants(), "no-underline")}>
          Enter an address
        </Link>
      </div>
    );
  }

  const { hunt, rent, address, city } = place;
  const lease = leases.find(
    (l) => l.homeId === rent?.id && (l.status === "active" || l.status === "draft"),
  );
  const due = payments.filter(
    (p) =>
      p.homeId === rent?.id && (p.status === "due" || p.status === "late"),
  );

  function operateAsRental() {
    upsertHome({
      id: placeId,
      address,
      city,
      bedsBaths: hunt?.bedsBaths || rent?.bedsBaths || "",
      status: rent?.status ?? "vacant",
      fairRent: rent?.fairRent ?? 0,
      notes: hunt?.notes || rent?.notes || "",
      payInstructions: rent?.payInstructions || "We'll set this together.",
      ownerId: rent?.ownerId || "o1",
      listing: rent?.listing ?? "off_market",
      intent: rent?.intent ?? "rent",
    });
  }

  function watchAsHunt() {
    if (useHuntStore.getState().houses.some((h) => h.id === placeId)) return;
    addHouse({
      id: placeId,
      address,
      city,
      owner: hunt?.owner || "unknown",
      bedsBaths: rent?.bedsBaths || hunt?.bedsBaths || "",
      offer: hunt?.offer || "",
      notes: rent?.notes || hunt?.notes || "",
      stage: hunt?.stage ?? "watching",
    });
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm tracking-wide text-gold-2 uppercase">
            The house
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">
            {address}
          </h1>
          <p className="mt-1 text-muted">
            {city}, GA
            {hunt ? ` · ${stageLabel(hunt.stage)}` : ""}
            {rent
              ? ` · ${HOME_STATUSES.find((s) => s.id === rent.status)?.label}`
              : ""}
          </p>
          {rent?.sample || hunt?.sample ? (
            <p className="mt-2 text-sm text-gold-2">
              Sample on this device — not a real occupancy or hunt. Your own
              addresses are yours.
            </p>
          ) : null}
        </div>
        <Button variant="ghost" onClick={() => setEditing(true)}>
          Edit address
        </Button>
      </div>

      <StreetView address={address} city={city} />

      {rent ? (
        <nav aria-label="Who is looking" className="flex flex-wrap gap-2">
          {(
            [
              ["look", "Looking it up"],
              ["owner", "Owner / manager"],
              ["occupant", "Occupant"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSeat(id)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm",
                seat === id
                  ? "border-gold bg-gold font-semibold text-night"
                  : "border-line text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      ) : null}

      <HouseNext
        want={want}
        placeId={placeId}
        address={address}
        city={city}
        hunt={hunt}
        ensureHunt={watchAsHunt}
        ensureRent={operateAsRental}
      />

      <section className="grid gap-3">
        <h2 className="font-display text-2xl">What you can do</h2>
        <p className="max-w-2xl text-sm text-muted">
          One house. Several honest next steps. Pick the one that serves the
          people in it.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <IdeaCard
            title="Manage it as a rental"
            body="Vacant or occupied, a house sheet, a lease, and rent you can confirm."
            action={rent ? "On this page, below" : "Start a rental record"}
            onClick={() => {
              if (!rent) operateAsRental();
              document.getElementById("rental-desk")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />
          <IdeaCard
            title="Sell without a listing machine"
            body="Write a letter the owner would actually want to read. Cash as-is if that's the truth."
            action="Write a letter"
            onClick={() => {
              if (!hunt) watchAsHunt();
              void navigate({
                to: "/place/$placeId",
                params: { placeId },
                search: { want: "sell" },
              });
            }}
          />
          <IdeaCard
            title="Keep use of the home"
            body="If Medicaid estate recovery is a worry, plan while someone is still well."
            action="Start with the season"
            onClick={() =>
              void navigate({
                to: "/place/$placeId",
                params: { placeId },
                search: { want: "protect" },
              })
            }
          />
          <IdeaCard
            title="Donate the property"
            body="Give it so someone can live there. A gift to a charity is a legal act."
            action="How a gift works"
            onClick={() =>
              void navigate({
                to: "/place/$placeId",
                params: { placeId },
                search: { want: "donate" },
              })
            }
          />
          <IdeaCard
            title="I want to live here"
            body="Fair rent, or a house that still needs hands. Ask to be told when the light is on."
            action="Ask to be told"
            onClick={() => {
              if (!rent) operateAsRental();
              void navigate({
                to: "/place/$placeId",
                params: { placeId },
                search: { want: "live" },
              });
            }}
          />
        </div>
      </section>

      <PropertyLookups address={address} city={city} />

      {hunt ? (
        <section className="grid gap-3 rounded-xl border border-line bg-panel p-5">
          <h2 className="font-display text-2xl">Hunt</h2>
          <p className="text-sm text-muted">
            {hunt.owner && hunt.owner !== "unknown"
              ? `Owner: ${hunt.owner}`
              : "Owner still unknown — the assessor page is the first place to look."}
            {hunt.offer ? ` · Might pay ${hunt.offer}` : ""}
          </p>
          {hunt.notes ? (
            <p className="text-sm leading-relaxed text-muted">{hunt.notes}</p>
          ) : null}
          <Field label="Stage">
            <Select
              value={hunt.stage}
              onChange={(e) => setStage(hunt.id, e.target.value as HuntStage)}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            onClick={() =>
              void navigate({
                to: "/place/$placeId",
                params: { placeId },
                search: { want: "sell" },
              })
            }
          >
            Write a letter
          </Button>
        </section>
      ) : (
        <Button variant="ghost" onClick={watchAsHunt}>
          Also watch this in the hunt
        </Button>
      )}

      {rent ? (
        <section
          id="rental-desk"
          className="grid gap-4 rounded-xl border border-line bg-panel p-5"
        >
          <div>
            <h2 className="font-display text-2xl">Rental desk</h2>
            <p className="mt-1 text-sm text-muted">
              {formatMoney(rent.fairRent)} / mo
              {lease ? ` · ${lease.household}` : " · no active lease"}
              {due.length ? ` · ${due.length} rent due` : ""}
            </p>
          </div>
          <Field label="Occupancy">
            <Select
              value={rent.status}
              onChange={(e) =>
                setHomeStatus(rent.id, e.target.value as HomeStatus)
              }
            >
              {HOME_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          {seat === "look" ? (
            <p className="text-sm text-muted">
              Lookups and next steps are above. Switch to Owner / manager to
              write a lease, confirm rent, or share a listing. Occupant sees
              wifi, trash, and what is due.
            </p>
          ) : seat === "occupant" ? (
            <>
              <HouseFactsSheet
                home={rent}
                party="renter"
                leaseId={lease?.id}
                ackName={lease?.household ?? "Occupant"}
                onAck={() =>
                  ackFacts(
                    rent.id,
                    "renter",
                    lease?.household ?? "Occupant",
                    lease?.id,
                  )
                }
              />
              <HouseOperate home={rent} lease={lease} seat="occupant" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted">{rent.payInstructions}</p>
              <HouseOperate home={rent} lease={lease} seat="owner" />
              <HouseFactsSheet
                home={rent}
                party="owner"
                ackName="Owner"
                onAck={() => ackFacts(rent.id, "owner", "Owner")}
              />
              {factsDraft ? (
                <form
                  className="grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveHouseFacts(rent.id, factsDraft);
                    setFactsSaved(true);
                  }}
                >
                  <HouseFactsFields facts={factsDraft} onChange={setFactsDraft} />
                  <Button type="submit">Save house facts</Button>
                  {factsSaved ? (
                    <p className="text-sm text-teal">
                      Saved on this house. Occupant still needs to ack the
                      version before keys.
                    </p>
                  ) : null}
                </form>
              ) : null}
            </>
          )}
        </section>
      ) : (
        <Button onClick={operateAsRental}>Keep a rental record here</Button>
      )}

      <p className="text-sm text-muted">
        This notebook lives on this device until accounts are on. It is not
        legal advice, a listing, or a closed sale.
      </p>

      <Modal open={editing} onClose={() => setEditing(false)}>
        <HouseForm
          house={
            hunt ?? {
              id: placeId,
              address,
              city,
              owner: "unknown",
              bedsBaths: rent?.bedsBaths ?? "",
              offer: "",
              notes: rent?.notes ?? "",
              stage: "watching",
            }
          }
          onSave={(row) => {
            if (hunt) updateHouse(hunt.id, row);
            else addHouse({ ...row, id: placeId });
            if (rent) {
              upsertHome({
                ...rent,
                address: row.address,
                city: row.city,
                bedsBaths: row.bedsBaths || rent.bedsBaths,
                notes: row.notes || rent.notes,
              });
            }
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}

function IdeaCard({
  title,
  body,
  action,
  onClick,
}: {
  title: string;
  body: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex min-w-[16.5rem] max-w-[22rem] flex-1 flex-col gap-2 rounded-xl border border-line bg-bg-2 p-5 text-left text-ink"
      onClick={onClick}
    >
      <h3 className="font-display text-xl">{title}</h3>
      <p className="flex-1 text-sm leading-relaxed text-muted">{body}</p>
      <span className={cn(buttonVariants({ size: "sm" }), "self-start")}>
        {action}
      </span>
    </button>
  );
}
