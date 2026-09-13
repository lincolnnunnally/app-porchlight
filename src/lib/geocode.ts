import { createServerFn } from "@tanstack/react-start";

export type GeocodeHit = {
  lat: number;
  lng: number;
  display: string;
};

export const geocodeAddress = createServerFn({ method: "POST" })
  .validator((data: { q: string }) => data)
  .handler(async ({ data }): Promise<GeocodeHit | null> => {
    const q = String(data?.q ?? "").trim();
    if (q.length < 5) return null;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", q);
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Porchlight/1.0 (https://porchlight.unitedundergod.org; lookup for a house record)",
      },
    });
    if (!res.ok) {
      throw new Error(`Could not pin this address (${res.status}).`);
    }
    const rows = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    const hit = rows[0];
    if (!hit) return null;
    return {
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      display: hit.display_name,
    };
  });
