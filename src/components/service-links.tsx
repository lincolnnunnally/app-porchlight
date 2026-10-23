import { SERVICE_PAGES } from "@/lib/seo";

/** Plain links to every public service page, so people and crawlers can reach each one. */
export function ServiceLinks({
  className = "flex flex-wrap gap-x-4 gap-y-1",
  itemClassName = "text-muted hover:text-gold-2",
  exclude,
}: {
  className?: string;
  itemClassName?: string;
  exclude?: string;
}) {
  return (
    <nav aria-label="What Porchlight does">
      <ul className={className}>
        {SERVICE_PAGES.filter((p) => p.path !== exclude).map((p) => (
          <li key={p.path}>
            <a href={p.path} className={itemClassName}>
              {p.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
