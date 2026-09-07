import { createFileRoute, Link } from "@tanstack/react-router";
import { collectCalendar } from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/rent/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const homes = useRentalStore((s) => s.homes);
  const leases = useRentalStore((s) => s.leases);
  const payments = useRentalStore((s) => s.payments);
  const work = useRentalStore((s) => s.work);
  const moves = useRentalStore((s) => s.moves);
  const applications = useRentalStore((s) => s.applications);
  const items = collectCalendar({
    homes,
    leases,
    payments,
    work,
    moves,
    applications,
  });
  const start = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const end = Date.now() + 1000 * 60 * 60 * 24 * 90;
  const windowed = items.filter((i) => i.at >= start && i.at <= end);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl">Calendar</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Rent due, work days, walks, move-in and move-out. Not a vendor app —
          just the days that matter for a handful of houses.
        </p>
      </div>
      <ol className="grid gap-3">
        {windowed.length === 0 ? (
          <p className="text-sm text-muted">Nothing on the next few weeks.</p>
        ) : (
          windowed.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-panel p-4"
            >
              <div>
                <p className="text-sm text-gold-2">{formatDate(item.at)}</p>
                <h2 className="font-display text-lg">{item.title}</h2>
                <p className="text-sm text-muted">{item.detail}</p>
              </div>
              <Link
                to={item.href}
                className="min-h-11 rounded-full border border-line px-3 py-2 text-sm text-ink no-underline"
              >
                Open
              </Link>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
