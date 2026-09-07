import { cn } from "@/lib/utils";

export function Choice({
  selected,
  title,
  hint,
  onSelect,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "min-h-14 w-full rounded-lg border px-4 py-3 text-left transition-colors duration-fast",
        selected
          ? "border-gold bg-gold/10 text-ink"
          : "border-line bg-panel text-ink hover:border-muted",
      )}
    >
      <span className="block font-medium">{title}</span>
      {hint ? (
        <span className="mt-0.5 block text-sm text-muted">{hint}</span>
      ) : null}
    </button>
  );
}
