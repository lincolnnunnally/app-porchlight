import { createFileRoute, Link } from "@tanstack/react-router";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { buttonVariants } from "@/components/ui/button";
import { GEORGIA_FACTS, OFFICIAL_LINKS } from "@/lib/georgia";
import { cn } from "@/lib/utils";

type Search = { ref?: string };

export const Route = createFileRoute("/protect/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  component: ProtectHome,
});

function ProtectHome() {
  const { ref } = Route.useSearch();
  return (
    <div className="grid gap-8">
      {ref ? (
        <p className="rounded-lg border border-teal/40 bg-panel px-4 py-3 text-sm text-ink">
          A neighbor sent you this
          {ref ? ` (${ref.replace(/-/g, " ")})` : ""}. No one is selling you
          anything. Read, then take the season quiz if it still feels like the
          right time.
        </p>
      ) : null}

      <section className="grid gap-3">
        <h1 className="max-w-3xl font-display text-3xl leading-tight sm:text-4xl">
          You paid in. Care isn’t free to the state after death. We help you
          plan before that bill lands on the house.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Georgia Medicaid estate recovery is a real program. It is not a rumor,
          and it is not a midnight raid on a living person. This path is for
          families who are still well and can plan five or more years ahead,
          with an attorney in the loop.
        </p>
      </section>

      <AttorneyFlag>
        Every sentence below is an educational summary of published Georgia DCH
        materials and federal statute. It is not a legal opinion about your
        house.
      </AttorneyFlag>

      <section className="grid gap-4">
        {GEORGIA_FACTS.map((fact) => (
          <article
            key={fact.id}
            className="rounded-lg border border-line bg-panel p-5"
          >
            <h2 className="font-display text-xl leading-snug">{fact.title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{fact.body}</p>
            <a
              href={fact.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm"
            >
              Source: {fact.source}
            </a>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="font-display text-2xl">What Porchlight actually does</h2>
        <ul className="mt-3 grid gap-2 text-muted">
          <li>Educates, in plain language, with sources.</li>
          <li>Intakes facts. Does not give legal conclusions.</li>
          <li>
            Fills locked attorney templates — occupancy, upkeep, later rent,
            sale waterfall, fees.
          </li>
          <li>Routes the draft to a supervising attorney and a paralegal.</li>
          <li>
            Tracks the stewardship file after recording: occupancy, logs,
            expenses, the published fee.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink">
          The person keeps occupancy while they need the home. Family keeps sale
          proceeds after documented costs and a fee you see on the next screens.
          We do not take the house.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/protect/quiz"
          className={cn(buttonVariants(), "no-underline")}
        >
          Am I in the right season?
        </Link>
        <Link
          to="/connect"
          className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
        >
          I’m a pastor or neighbor
        </Link>
      </div>

      <section className="grid gap-2">
        <h2 className="font-display text-xl">Read it from the state</h2>
        <ul className="grid gap-1">
          {OFFICIAL_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Disclaimer className="mt-3" />
      </section>
    </div>
  );
}
