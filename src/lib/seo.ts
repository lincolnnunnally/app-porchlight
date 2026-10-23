/**
 * Search metadata. Canonicals always use the production host: porchlight.unitedundergod.org
 * is served through a proxy, so the request host is not a safe source for the address.
 *
 * Per AGENTS.md, share tags never go in __root.tsx. The platform head injector replaces
 * og:* and twitter:* on every HTML response, so the per-page ones below are a fallback.
 */
import { PUBLIC_ORIGIN } from "./listing-contact.ts";

export const SITE_URL = PUBLIC_ORIGIN;
export const SITE_NAME = "Porchlight";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Site-wide publisher. Only what the app states about itself. */
export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  description: "Hunt a house before it lists. Keep use of a home. Rent it fairly.",
};

/** The towns the app's search and hunt actually list (lib/hunt.ts CITIES). */
export const LOCAL_AREA = [
  { "@type": "City", name: "Vidalia, GA" },
  { "@type": "City", name: "Lyons, GA" },
  { "@type": "AdministrativeArea", name: "Toombs County, GA" },
];

export const GEORGIA = { "@type": "State", name: "Georgia" };

type Meta = Record<string, unknown>;

export function pageHead({
  title,
  description,
  path,
  jsonLd = [],
}: {
  title: string;
  description: string;
  path: string;
  jsonLd?: object[];
}): { meta: Meta[]; links: { rel: string; href: string }[] } {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...jsonLd.map((ld) => ({ "script:ld+json": ld })),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** For the notebook's working screens: they hold this device's own houses, not public pages. */
export function privateHead(title: string) {
  return {
    meta: [{ title: `${title} · Porchlight` }, { name: "robots", content: "noindex, follow" }],
  };
}

export function serviceLd({
  name,
  description,
  path,
  serviceType,
  areaServed,
  audience,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  areaServed?: object | object[];
  audience?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    url: absoluteUrl(path),
    provider: {
      "@id": `${SITE_URL}/#org`,
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    ...(areaServed ? { areaServed } : {}),
    ...(audience ? { audience: { "@type": "Audience", audienceType: audience } } : {}),
  };
}

/** Every public service page, in footer order. */
export const SERVICE_PAGES = [
  { path: "/off-market-houses", label: "Off-market houses in Vidalia and Toombs" },
  { path: "/search", label: "Find a place to live" },
  { path: "/protect", label: "Keep use of a home (Georgia estate recovery)" },
  { path: "/owners", label: "Sell quietly or rent fairly" },
  { path: "/fair-rent-desk", label: "Run a rental fairly" },
  { path: "/donate-a-house", label: "Donate a house" },
  { path: "/connect", label: "For pastors and neighbors" },
] as const;
