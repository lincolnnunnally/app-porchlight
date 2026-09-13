export type CountySlug =
  | "toombs"
  | "montgomery"
  | "tattnall"
  | "treutlen"
  | "wheeler"
  | "candler";

export type CountyDesk = {
  slug: CountySlug;
  name: string;
  assessor: string;
  assessorSearch: string;
  gis: string;
  taxPay?: string;
};

export type LookupLink = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

export const COUNTY_DESKS: Record<CountySlug, CountyDesk> = {
  toombs: {
    slug: "toombs",
    name: "Toombs County",
    assessor: "https://qpublic.net/ga/toombs/",
    assessorSearch: "https://qpublic.net/ga/toombs/search.html",
    gis: "https://qpublic.net/ga/toombs/",
    taxPay: "https://toombscountypay.com/",
  },
  montgomery: {
    slug: "montgomery",
    name: "Montgomery County",
    assessor: "https://qpublic.net/ga/montgomery/",
    assessorSearch: "https://qpublic.net/ga/montgomery/search.html",
    gis: "https://qpublic.net/ga/montgomery/",
  },
  tattnall: {
    slug: "tattnall",
    name: "Tattnall County",
    assessor: "https://qpublic.net/ga/tattnall/",
    assessorSearch: "https://qpublic.net/ga/tattnall/search.html",
    gis: "https://qpublic.net/ga/tattnall/",
  },
  treutlen: {
    slug: "treutlen",
    name: "Treutlen County",
    assessor: "https://qpublic.net/ga/treutlen/",
    assessorSearch: "https://qpublic.net/ga/treutlen/search.html",
    gis: "https://qpublic.net/ga/treutlen/",
  },
  wheeler: {
    slug: "wheeler",
    name: "Wheeler County",
    assessor: "https://qpublic.net/ga/wheeler/",
    assessorSearch: "https://qpublic.net/ga/wheeler/search.html",
    gis: "https://qpublic.net/ga/wheeler/",
  },
  candler: {
    slug: "candler",
    name: "Candler County",
    assessor: "https://qpublic.net/ga/candler/",
    assessorSearch: "https://qpublic.net/ga/candler/search.html",
    gis: "https://qpublic.net/ga/candler/",
  },
};

const CITY_COUNTY: Record<string, CountySlug> = {
  vidalia: "toombs",
  lyons: "toombs",
  "santa claus": "toombs",
  uvalda: "toombs",
  higgston: "toombs",
  "toombs county": "toombs",
  "mount vernon": "montgomery",
  ailey: "montgomery",
  tarrytown: "montgomery",
  alston: "montgomery",
  "montgomery county": "montgomery",
  reidsville: "tattnall",
  glennville: "tattnall",
  cobbtown: "tattnall",
  collins: "tattnall",
  "tattnall county": "tattnall",
  soperton: "treutlen",
  "treutlen county": "treutlen",
  alamo: "wheeler",
  glenwood: "wheeler",
  "wheeler county": "wheeler",
  metter: "candler",
  pulaski: "candler",
  "candler county": "candler",
};

export function normalizePlaceKey(address: string, city: string) {
  return `${address}, ${city}`
    .toLowerCase()
    .replace(/[.#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function fullAddress(address: string, city: string, state = "GA") {
  const street = address.trim();
  const town = city.trim();
  if (!town) return `${street}, ${state}`;
  const already = new RegExp(`${town}\\b`, "i").test(street);
  return already ? `${street}, ${state}` : `${street}, ${town}, ${state}`;
}

export function countyForCity(city: string): CountyDesk | null {
  const key = city.trim().toLowerCase();
  const slug = CITY_COUNTY[key];
  return slug ? COUNTY_DESKS[slug] : null;
}

function zillowSlug(address: string, city: string) {
  return fullAddress(address, city)
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function googleQuery(q: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export function mapsSearchUrl(address: string, city: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(address, city))}`;
}

export function streetViewUrl(address: string, city: string) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&query=${encodeURIComponent(fullAddress(address, city))}`;
}

export function mapsEmbedUrl(address: string, city: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress(address, city))}&output=embed`;
}

export function streetViewEmbedUrl(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}&cbp=12,0,0,0,0&output=embed`;
}

export function propertyLookups(address: string, city: string): LookupLink[] {
  const full = fullAddress(address, city);
  const county = countyForCity(city);
  const links: LookupLink[] = [];

  if (county) {
    links.push(
      {
        id: "assessor",
        label: `${county.name} tax assessor`,
        href: county.assessorSearch,
        hint: "Owner name, parcel, assessed value. Search this address on the county page.",
      },
      {
        id: "gis",
        label: `${county.name} GIS / parcel map`,
        href: county.gis,
        hint: "Lot lines and the map the assessor uses.",
      },
    );
    if (county.taxPay) {
      links.push({
        id: "taxpay",
        label: `${county.name} tax bill`,
        href: county.taxPay,
        hint: "What is owed, not just the assessment.",
      });
    }
  } else {
    links.push({
      id: "assessor-find",
      label: "Find the county tax assessor",
      href: "https://dor.georgia.gov/search-county-property-tax-facts-map",
      hint: "We don't have this city mapped yet. Pick the county, then search the address.",
    });
  }

  links.push(
    {
      id: "parcel-google",
      label: "Search this address as a parcel",
      href: googleQuery(`${full} qpublic parcel assessor`),
      hint: "Opens a search for the official record when the county site won't take the address.",
    },
    {
      id: "maps",
      label: "Google Maps",
      href: mapsSearchUrl(address, city),
      hint: "Map, directions, and Street View from the pegman.",
    },
    {
      id: "street",
      label: "Google Street View",
      href: streetViewUrl(address, city),
      hint: "Stand in the road and look at the house.",
    },
    {
      id: "zillow",
      label: "Zillow",
      href: `https://www.zillow.com/homes/${encodeURIComponent(zillowSlug(address, city))}_rb/`,
      hint: "Public listing history and an estimate. Not our number.",
    },
    {
      id: "mls",
      label: "MLS (Realtor.com)",
      href: `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(full)}`,
      hint: "Public MLS view. GAMLS itself is behind a login we don't have.",
    },
    {
      id: "redfin",
      label: "Redfin",
      href: `https://www.redfin.com/stingray/do/query-location?location=${encodeURIComponent(full)}`,
      hint: "Another public listing search.",
    },
    {
      id: "deeds",
      label: "Georgia deeds (GSCCCA)",
      href: "https://search.gsccca.org/",
      hint: "Recorded deeds and liens. Search the owner or the legal description.",
    },
    {
      id: "sos",
      label: "Georgia Secretary of State — business search",
      href: "https://ecorp.sos.ga.gov/BusinessSearch",
      hint: "If the owner is an LLC or corp, look the name up here.",
    },
  );

  return links;
}

export type PlacePurpose =
  | "look"
  | "rent"
  | "sell"
  | "protect"
  | "donate"
  | "live";

export const PLACE_PURPOSES: { id: PlacePurpose; label: string; blurb: string }[] =
  [
    {
      id: "look",
      label: "Look it up",
      blurb: "See the house, the records, and what you could do next.",
    },
    {
      id: "rent",
      label: "Manage it as a rental",
      blurb: "Occupancy, house facts, a lease, and rent on one page.",
    },
    {
      id: "sell",
      label: "Sell without a listing machine",
      blurb: "A quiet letter. Cash as-is. You keep the keys until you don't.",
    },
    {
      id: "protect",
      label: "Keep use of the home",
      blurb: "Plan ahead if Medicaid estate recovery is a worry. An attorney still signs.",
    },
    {
      id: "donate",
      label: "Donate the property",
      blurb: "Give it so someone can live there. A gift is a legal act — we don't paper over that.",
    },
    {
      id: "live",
      label: "I want to live here",
      blurb: "Rent fairly, or buy a house that still needs hands.",
    },
  ];
