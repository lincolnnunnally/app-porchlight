import { cn } from "@/lib/utils";

export function Lantern({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-full shadow-[var(--shadow-lantern)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 50% 40%, var(--color-gold-2), var(--color-gold) 45%, #7a4d10)",
      }}
    >
      <svg
        width={size * 0.46}
        height={size * 0.46}
        viewBox="0 0 24 24"
        fill="none"
        className="text-night"
      >
        <path
          d="M8 9.5c0-2.4 1.7-4 4-4s4 1.6 4 4v7.2c0 1.6-1.8 2.8-4 2.8s-4-1.2-4-2.8V9.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="M12 5.5V3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 12.5h6M9 15.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
