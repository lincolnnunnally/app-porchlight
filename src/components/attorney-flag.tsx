import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

export function AttorneyFlag({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex gap-3 rounded-lg border border-flag/40 bg-panel px-4 py-3 text-sm text-gold-2",
        className,
      )}
    >
      <Scale className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
      <div className="grid gap-1">
        <p className="font-medium tracking-wide text-gold-2">
          Attorney must approve before production
        </p>
        {children ? <div className="text-muted">{children}</div> : null}
      </div>
    </aside>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      Education, not legal advice. Porchlight does not practice law and does not
      promise a Medicaid result. A supervising Georgia elder-law attorney reviews
      facts before anything is signed or recorded.
    </p>
  );
}

export function RentalDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      A neighborly ledger, not a bank and not a courthouse. Porchlight does not
      collect rent, pull credit, or file a dispossessory. Talk first. An attorney
      reviews anything you would sign or serve.
    </p>
  );
}
