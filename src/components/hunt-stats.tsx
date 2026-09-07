import type { House, HuntStage } from "@/lib/hunt";

export function HuntStats({ houses }: { houses: House[] }) {
  const items: [string, number][] = [
    ["Houses on the hunt", houses.length],
    [
      "Letters sent",
      houses.filter((h) =>
        (["letter", "talking", "contract"] as HuntStage[]).includes(h.stage),
      ).length,
    ],
    ["Talking", houses.filter((h) => h.stage === "talking").length],
    ["Under contract", houses.filter((h) => h.stage === "contract").length],
  ];
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([k, v]) => (
        <div
          key={k}
          className="rounded-lg border border-line bg-panel px-4 py-3"
        >
          <b className="block font-display text-2xl text-gold-2 tabular-nums">
            {v}
          </b>
          <span className="text-sm text-muted">{k}</span>
        </div>
      ))}
    </section>
  );
}
