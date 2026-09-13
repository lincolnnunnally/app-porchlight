/**
 * Public listing for a vacancy. One projection of the house record
 * (`listingFacts`) that can travel in its own link, because the notebook
 * lives on one device until accounts are on. The link carries the facts, so
 * a neighbor, a pastor, or Google can open it from anywhere. Wifi password
 * never leaves the house sheet.
 */
import { listingFacts, type HouseFactsSpine } from "./house-facts.ts";

function bedsOf(bedsBaths: string) {
  const n = parseInt(bedsBaths, 10);
  return Number.isFinite(n) ? n : 0;
}

export type PublicListing = {
  homeId: string;
  address: string;
  city: string;
  bedsBaths: string;
  fairRent: number;
  intent: string;
  status: string;
  notes: string;
  propertyKind: string;
  furnished: string;
  trashDay: string;
  lawnWho: string;
  utilities: string;
  renterDuties: string;
  ownerDuties: string;
  rentToOwn: string;
  postedAt: number;
  /** Who to call. Owner or steward name + phone, never the wifi password. */
  contact: string;
};

type ListingSource = HouseFactsSpine & {
  id: string;
  address: string;
  city: string;
  bedsBaths: string;
  fairRent: number;
  listing: string;
  intent: string;
  status: string;
  notes: string;
  statusChangedAt?: number | null;
};

export function publicListingFrom(
  home: ListingSource,
  contact = "",
): PublicListing {
  const facts = listingFacts(home);
  return {
    contact,
    homeId: facts.homeId,
    address: facts.address,
    city: facts.city,
    bedsBaths: facts.bedsBaths,
    fairRent: facts.fairRent,
    intent: facts.intent,
    status: facts.status,
    notes: facts.notes,
    propertyKind: facts.propertyKind,
    furnished: facts.furnished,
    trashDay: facts.trashDay,
    lawnWho: facts.lawnWho,
    utilities: facts.utilities,
    renterDuties: facts.renterDuties,
    ownerDuties: facts.ownerDuties,
    rentToOwn: facts.rentToOwn,
    postedAt: home.statusChangedAt ?? Date.now(),
  };
}

/** Short keys keep the share link readable on a phone. */
const KEYS: [keyof PublicListing, string][] = [
  ["homeId", "i"],
  ["address", "a"],
  ["city", "c"],
  ["bedsBaths", "b"],
  ["fairRent", "r"],
  ["intent", "n"],
  ["status", "s"],
  ["notes", "o"],
  ["propertyKind", "k"],
  ["furnished", "f"],
  ["trashDay", "t"],
  ["lawnWho", "l"],
  ["utilities", "u"],
  ["renterDuties", "d"],
  ["ownerDuties", "w"],
  ["rentToOwn", "x"],
  ["postedAt", "p"],
  ["contact", "m"],
];

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bin, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeListing(listing: PublicListing) {
  const packed: Record<string, unknown> = {};
  for (const [key, short] of KEYS) {
    const value = listing[key];
    if (value === "" || value === undefined || value === null) continue;
    packed[short] = value;
  }
  return toBase64Url(JSON.stringify(packed));
}

export function decodeListing(raw: string | undefined | null): PublicListing | null {
  if (!raw) return null;
  try {
    const packed = JSON.parse(fromBase64Url(raw)) as Record<string, unknown>;
    if (!packed || typeof packed !== "object") return null;
    const out: Record<string, unknown> = {};
    for (const [key, short] of KEYS) out[key] = packed[short];
    if (typeof out.address !== "string" || !out.address) return null;
    return {
      homeId: String(out.homeId ?? ""),
      address: String(out.address),
      city: String(out.city ?? ""),
      bedsBaths: String(out.bedsBaths ?? ""),
      fairRent: Number(out.fairRent) || 0,
      intent: String(out.intent ?? "rent"),
      status: String(out.status ?? "vacant"),
      notes: String(out.notes ?? ""),
      propertyKind: String(out.propertyKind ?? "residential"),
      furnished: String(out.furnished ?? "unfurnished"),
      trashDay: String(out.trashDay ?? ""),
      lawnWho: String(out.lawnWho ?? ""),
      utilities: String(out.utilities ?? ""),
      renterDuties: String(out.renterDuties ?? ""),
      ownerDuties: String(out.ownerDuties ?? ""),
      rentToOwn: String(out.rentToOwn ?? ""),
      postedAt: Number(out.postedAt) || Date.now(),
      contact: String(out.contact ?? ""),
    };
  } catch {
    return null;
  }
}

export function listingPath(listing: PublicListing) {
  return `/listing/${encodeURIComponent(listing.homeId || "house")}?d=${encodeListing(listing)}`;
}

export function listingUrl(listing: PublicListing, origin: string) {
  return `${origin.replace(/\/$/, "")}${listingPath(listing)}`;
}

export function listingTitle(listing: PublicListing) {
  const kind =
    listing.intent === "sale"
      ? "Quiet sale"
      : listing.intent === "both"
        ? "Fair rent or quiet sale"
        : "Fair rent";
  return `${listing.address}, ${listing.city} · ${kind} · Porchlight`;
}

export function listingSummary(listing: PublicListing) {
  const bits = [
    listing.bedsBaths ? `${listing.bedsBaths} beds / baths` : "",
    listing.fairRent ? `$${listing.fairRent} / month` : "",
    listing.propertyKind === "commercial" ? "Commercial" : "Residential",
    listing.furnished === "furnished" ? "Furnished" : "Unfurnished",
  ].filter(Boolean);
  return `${bits.join(" · ")}. ${listing.notes || "A porch light is on in " + listing.city + "."}`.trim();
}

/** Plain text you can paste into a Google Business post, a church bulletin, or a text. */
export function listingText(listing: PublicListing, url?: string) {
  const line = (label: string, value: string) =>
    value ? `${label}: ${value}\n` : "";
  return `PORCH LIGHT ON — ${listing.address}, ${listing.city}, GA
${listing.intent === "sale" ? "Quiet sale" : listing.intent === "both" ? "Fair rent or quiet sale" : "Fair rent"}${listing.fairRent ? ` · $${listing.fairRent} / month` : ""}${listing.bedsBaths ? ` · ${listing.bedsBaths} beds / baths` : ""}
${listing.propertyKind === "commercial" ? "Commercial" : "Residential"} · ${listing.furnished === "furnished" ? "Furnished" : "Unfurnished"}

${listing.notes ? listing.notes + "\n\n" : ""}${line("Trash day", listing.trashDay)}${line("Lawn", listing.lawnWho)}${line("Utilities", listing.utilities)}${line("Occupant duties", listing.renterDuties)}${line("Owner duties", listing.ownerDuties)}${line("Rent-to-own", listing.rentToOwn)}
Repaired with our hands. Fair rent, not market max. Ask to be told, no pressure.
${listing.contact ? `Call or text: ${listing.contact}\n` : ""}${url ? `\n${url}\n` : ""}
Porchlight · porchlight.unitedundergod.org`;
}

/** schema.org for Google. A listing, an offer, and the place. */
export function listingJsonLd(listing: PublicListing, url: string) {
  const beds = bedsOf(listing.bedsBaths);
  const bathMatch = listing.bedsBaths.split("/")[1];
  const baths = bathMatch ? Number(bathMatch.trim()) : NaN;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listingTitle(listing),
    description: listingSummary(listing),
    url,
    datePosted: new Date(listing.postedAt).toISOString().slice(0, 10),
    offers: {
      "@type": "Offer",
      price: listing.fairRent,
      priceCurrency: "USD",
      businessFunction:
        listing.intent === "sale"
          ? "http://purl.org/goodrelations/v1#Sell"
          : "http://purl.org/goodrelations/v1#LeaseOut",
      availability: "https://schema.org/InStock",
    },
    about: {
      "@type": listing.propertyKind === "commercial" ? "Place" : "Accommodation",
      name: `${listing.address}, ${listing.city}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: listing.address,
        addressLocality: listing.city,
        addressRegion: "GA",
        addressCountry: "US",
      },
      ...(beds ? { numberOfBedrooms: beds } : {}),
      ...(Number.isFinite(baths) ? { numberOfBathroomsTotal: baths } : {}),
      ...(listing.furnished === "furnished"
        ? { amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Furnished", value: true }] }
        : {}),
    },
    provider: {
      "@type": "Organization",
      name: "Porchlight",
      url: "https://porchlight.unitedundergod.org",
    },
  };
}
