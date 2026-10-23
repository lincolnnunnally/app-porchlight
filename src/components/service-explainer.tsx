import type { ReactNode } from "react";
import { ServiceLinks } from "@/components/service-links";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** A plain-language page for one thing Porchlight does, with a way into the notebook. */
export function ServiceExplainer({
  path,
  kicker,
  title,
  intro,
  whoFor,
  youGet,
  steps,
  note,
  cta,
}: {
  path: string;
  kicker: string;
  title: string;
  intro: string;
  whoFor: string[];
  youGet: string[];
  steps: string[];
  note?: ReactNode;
  cta: { href: string; label: string }[];
}) {
  return (
    <article className="grid max-w-3xl gap-8">
      <header className="grid gap-3">
        <p className="text-sm tracking-wide text-gold-2 uppercase">{kicker}</p>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h1>
        <p className="text-lg leading-relaxed text-muted">{intro}</p>
        <div className="flex flex-wrap gap-3">
          {cta.map((c, i) => (
            <a
              key={c.href}
              href={c.href}
              className={cn(
                buttonVariants({ variant: i === 0 ? "primary" : "ghost" }),
                "no-underline",
              )}
            >
              {c.label}
            </a>
          ))}
        </div>
      </header>
      <section className="grid gap-2">
        <h2 className="font-display text-2xl">Who it is for</h2>
        <ul className="grid list-disc gap-1.5 pl-5 text-muted">
          {whoFor.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
      <section className="grid gap-2">
        <h2 className="font-display text-2xl">What you get</h2>
        <ul className="grid list-disc gap-1.5 pl-5 text-muted">
          {youGet.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
      <section className="grid gap-2">
        <h2 className="font-display text-2xl">How it works</h2>
        <ol className="grid list-decimal gap-1.5 pl-5 text-muted">
          {steps.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </section>
      {note ? (
        <section className="rounded-lg border border-line bg-panel p-5 text-muted">{note}</section>
      ) : null}
      <section className="grid gap-2 border-t border-line pt-6">
        <h2 className="font-display text-xl">More on Porchlight</h2>
        <ServiceLinks
          exclude={path}
          className="grid gap-2 sm:grid-cols-2"
          itemClassName="text-gold-2"
        />
      </section>
    </article>
  );
}
