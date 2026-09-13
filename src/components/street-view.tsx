import { useEffect, useState } from "react";
import {
  fullAddress,
  mapsEmbedUrl,
  mapsSearchUrl,
  streetViewEmbedUrl,
  streetViewUrl,
} from "@/lib/lookups";
import { geocodeAddress, type GeocodeHit } from "@/lib/geocode";

const cache = new Map<string, GeocodeHit | null>();

export function StreetView({
  address,
  city,
}: {
  address: string;
  city: string;
}) {
  const full = fullAddress(address, city);
  const [hit, setHit] = useState<GeocodeHit | null | undefined>(() =>
    cache.has(full) ? cache.get(full) : undefined,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (cache.has(full)) {
      setHit(cache.get(full));
      setError(null);
      return;
    }
    setHit(undefined);
    setError(null);
    void geocodeAddress({ data: { q: full } })
      .then((row) => {
        if (cancelled) return;
        cache.set(full, row);
        setHit(row);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        cache.set(full, null);
        setHit(null);
        setError(err instanceof Error ? err.message : "Could not pin this address.");
      });
    return () => {
      cancelled = true;
    };
  }, [full]);

  const embed =
    hit && Number.isFinite(hit.lat)
      ? streetViewEmbedUrl(hit.lat, hit.lng)
      : mapsEmbedUrl(address, city);

  return (
    <section className="grid gap-3 overflow-hidden rounded-xl border border-line bg-panel">
      <div className="relative min-h-56 bg-bg-2">
        <iframe
          title={`Street view of ${full}`}
          src={embed}
          className="h-64 w-full border-0 sm:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="grid gap-2 px-4 pb-4">
        <p className="text-sm text-muted">
          {hit
            ? "Street View from the road. If the camera is a block off, open Google and drag the pegman."
            : error
              ? error
              : hit === undefined
                ? "Pinning the house on the map…"
                : "We couldn't stand in the road yet. The map is still the address. Open Street View to look yourself."}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={streetViewUrl(address, city)}
            target="_blank"
            rel="noreferrer"
            className="min-h-10 rounded-full border border-line px-3 text-sm leading-10 text-ink no-underline"
          >
            Open Street View
          </a>
          <a
            href={mapsSearchUrl(address, city)}
            target="_blank"
            rel="noreferrer"
            className="min-h-10 rounded-full border border-line px-3 text-sm leading-10 text-ink no-underline"
          >
            Open the map
          </a>
        </div>
      </div>
    </section>
  );
}
