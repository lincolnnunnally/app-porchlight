import { countyForCity, propertyLookups } from "@/lib/lookups";

export function PropertyLookups({
  address,
  city,
}: {
  address: string;
  city: string;
}) {
  const links = propertyLookups(address, city);
  const county = countyForCity(city);

  return (
    <section className="grid gap-3">
      <div>
        <h2 className="font-display text-2xl">Look this place up</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          We don't scrape the county, Zillow, or MLS. These open the real pages
          with this address so you can see the owner, the parcel, and what's on
          the market.{" "}
          {county
            ? `${county.name} is the desk for ${city}.`
            : "We don't have this city mapped to a county yet — start with the Georgia map."}
        </p>
      </div>
      <ul className="flex flex-wrap justify-center gap-3">
        {links.map((link) => (
          <li
            key={link.id}
            className="min-w-[16.5rem] max-w-[22rem] flex-1"
          >
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-full flex-col gap-1 rounded-lg border border-line bg-panel p-4 text-ink no-underline hover:border-gold/50"
            >
              <span className="font-medium text-gold-2">{link.label}</span>
              <span className="text-sm leading-relaxed text-muted">
                {link.hint}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
