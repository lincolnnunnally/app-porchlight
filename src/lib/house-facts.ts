export type PropertyKind = "residential" | "commercial";
export type FurnishStatus = "furnished" | "unfurnished";
export type FactsParty = "owner" | "renter";

export type HouseFacts = {
  wifiNetwork: string;
  wifiPassword: string;
  trashDay: string;
  lawnWho: string;
  furnished: FurnishStatus;
  utilities: string;
  renterDuties: string;
  ownerDuties: string;
  rentToOwn: string;
  propertyKind: PropertyKind;
};

export type FactsAck = {
  version: number;
  party: FactsParty;
  at: number;
  by: string;
};

export type HouseFactsSnapshot = {
  version: number;
  at: number;
  facts: HouseFacts;
};

export type HouseFactsSpine = {
  facts: HouseFacts;
  factsVersion: number;
  factsUpdatedAt: number | null;
  factsHistory: HouseFactsSnapshot[];
  factsAcks: FactsAck[];
};

export const EMPTY_HOUSE_FACTS: HouseFacts = {
  wifiNetwork: "",
  wifiPassword: "",
  trashDay: "",
  lawnWho: "",
  furnished: "unfurnished",
  utilities: "",
  renterDuties: "",
  ownerDuties: "",
  rentToOwn: "",
  propertyKind: "residential",
};

export const PROPERTY_KINDS: { id: PropertyKind; label: string }[] = [
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
];

export const FURNISH_STATUSES: { id: FurnishStatus; label: string }[] = [
  { id: "unfurnished", label: "Unfurnished" },
  { id: "furnished", label: "Furnished" },
];

export function normalizeHouseFacts(facts?: Partial<HouseFacts> | null): HouseFacts {
  return { ...EMPTY_HOUSE_FACTS, ...facts };
}

export function emptyHouseFactsSpine(): HouseFactsSpine {
  return {
    facts: { ...EMPTY_HOUSE_FACTS },
    factsVersion: 1,
    factsUpdatedAt: null,
    factsHistory: [],
    factsAcks: [],
  };
}

export function withHouseFactsSpine<T>(
  row: T & Partial<HouseFactsSpine>,
): T & HouseFactsSpine {
  const spine = emptyHouseFactsSpine();
  return {
    ...row,
    facts: normalizeHouseFacts(row.facts),
    factsVersion: row.factsVersion ?? spine.factsVersion,
    factsUpdatedAt: row.factsUpdatedAt ?? spine.factsUpdatedAt,
    factsHistory: row.factsHistory ?? spine.factsHistory,
    factsAcks: row.factsAcks ?? spine.factsAcks,
  };
}

export function factsEqual(a: HouseFacts, b: HouseFacts) {
  return (
    a.wifiNetwork === b.wifiNetwork &&
    a.wifiPassword === b.wifiPassword &&
    a.trashDay === b.trashDay &&
    a.lawnWho === b.lawnWho &&
    a.furnished === b.furnished &&
    a.utilities === b.utilities &&
    a.renterDuties === b.renterDuties &&
    a.ownerDuties === b.ownerDuties &&
    a.rentToOwn === b.rentToOwn &&
    a.propertyKind === b.propertyKind
  );
}

export function applyFactsAmendment<T extends HouseFactsSpine>(
  home: T,
  next: HouseFacts,
  at = Date.now(),
): T {
  const facts = normalizeHouseFacts(next);
  if (home.factsVersion > 0 && factsEqual(home.facts, facts)) {
    return { ...home, facts };
  }
  const previous: HouseFactsSnapshot | null =
    home.factsVersion > 0
      ? {
          version: home.factsVersion,
          at: home.factsUpdatedAt ?? at,
          facts: home.facts,
        }
      : null;
  return {
    ...home,
    facts,
    factsVersion: home.factsVersion + 1,
    factsUpdatedAt: at,
    factsHistory: previous ? [previous, ...home.factsHistory] : home.factsHistory,
  };
}

export function ackHouseFacts<T extends HouseFactsSpine>(
  home: T,
  party: FactsParty,
  by: string,
  at = Date.now(),
): T {
  const rest = home.factsAcks.filter(
    (ack) => !(ack.version === home.factsVersion && ack.party === party),
  );
  return {
    ...home,
    factsAcks: [
      {
        version: home.factsVersion,
        party,
        at,
        by: by.trim() || party,
      },
      ...rest,
    ],
  };
}

export function factsAckFor(home: HouseFactsSpine, party: FactsParty) {
  return home.factsAcks.find(
    (ack) => ack.version === home.factsVersion && ack.party === party,
  );
}

export function factsReadyForKeys(home: HouseFactsSpine) {
  return Boolean(factsAckFor(home, "owner") && factsAckFor(home, "renter"));
}

/**
 * Public listing later reads these fields from the same house record.
 * Wifi password stays on the sheet, never in the listing projection.
 */
export function listingFacts<
  T extends HouseFactsSpine & {
    id: string;
    address: string;
    city: string;
    bedsBaths: string;
    fairRent: number;
    listing: string;
    intent: string;
    status: string;
    notes: string;
  },
>(home: T) {
  const { facts } = home;
  return {
    homeId: home.id,
    address: home.address,
    city: home.city,
    bedsBaths: home.bedsBaths,
    fairRent: home.fairRent,
    listing: home.listing,
    intent: home.intent,
    status: home.status,
    notes: home.notes,
    propertyKind: facts.propertyKind,
    furnished: facts.furnished,
    trashDay: facts.trashDay,
    lawnWho: facts.lawnWho,
    utilities: facts.utilities,
    renterDuties: facts.renterDuties,
    ownerDuties: facts.ownerDuties,
    rentToOwn: facts.rentToOwn,
  };
}

export function houseFactsText(home: HouseFactsSpine, address?: string) {
  const { facts } = home;
  const where = address ? `${address}\n` : "";
  return `${where}HOUSE FACTS · version ${home.factsVersion}
(same sheet on the house record — not a second store)

Type: ${PROPERTY_KINDS.find((k) => k.id === facts.propertyKind)?.label ?? facts.propertyKind}
Furnished: ${FURNISH_STATUSES.find((k) => k.id === facts.furnished)?.label ?? facts.furnished}
Wifi: ${facts.wifiNetwork || "—"} / ${facts.wifiPassword || "—"}
Trash day: ${facts.trashDay || "—"}
Lawn: ${facts.lawnWho || "—"}
Utilities: ${facts.utilities || "—"}
Occupant duties: ${facts.renterDuties || "—"}
Owner duties: ${facts.ownerDuties || "—"}
Rent-to-own: ${facts.rentToOwn || "none"}`;
}
