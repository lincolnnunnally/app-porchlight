import { stageLabel, type House } from "@/lib/hunt";
import { cn } from "@/lib/utils";

const chip: Record<string, string> = {
  watching: "text-watching border-[#33556b]",
  letter: "text-gold border-gold/40",
  talking: "text-teal border-teal/40",
  contract: "text-contract border-[#5d7340]",
};

export function HouseCard({
  house,
  onOpen,
  onLetter,
  draggable,
  onDragStart,
}: {
  house: House;
  onOpen: () => void;
  onLetter: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  return (
    <article
      className="flex flex-col gap-2 rounded-lg border border-line bg-panel p-4"
      draggable={draggable}
      onDragStart={onDragStart}
    >
      <span
        className={cn(
          "inline-flex w-fit rounded-full border px-2 py-0.5 text-[0.7rem] tracking-wide uppercase",
          chip[house.stage] ?? "text-gold-2 border-line",
        )}
      >
        {stageLabel(house.stage)}
      </span>
      <h3 className="font-display text-lg leading-snug">{house.address}</h3>
      <p className="text-sm text-muted">
        {house.city} · {house.bedsBaths || "—"} · {house.offer || "offer TBD"}
      </p>
      <p className="text-sm text-muted">
        {house.owner && house.owner !== "unknown"
          ? `Owner: ${house.owner}`
          : "Owner still unknown"}
      </p>
      {house.notes ? (
        <p className="text-sm leading-relaxed text-muted">{house.notes}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onOpen}
          className="min-h-10 rounded-full border border-line px-3 text-sm text-ink"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onLetter}
          className="min-h-10 rounded-full border border-line px-3 text-sm text-ink"
        >
          Letter
        </button>
      </div>
    </article>
  );
}
