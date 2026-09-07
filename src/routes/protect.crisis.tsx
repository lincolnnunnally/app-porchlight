import { createFileRoute, Link } from "@tanstack/react-router";
import { AttorneyFlag, Disclaimer } from "@/components/attorney-flag";
import { buttonVariants } from "@/components/ui/button";
import { OFFICIAL_LINKS } from "@/lib/georgia";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/protect/crisis")({
  component: CrisisPage,
});

function CrisisPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <p className="text-sm tracking-wide text-gold-2 uppercase">
        Crisis path
      </p>
      <h1 className="font-display text-3xl leading-tight sm:text-4xl">
        Don’t move title. Talk to an elder-law attorney now.
      </h1>
      <p className="text-lg leading-relaxed text-muted">
        If nursing-home or long-term Medicaid is already needed — or likely
        inside five years — this app will not generate a transfer packet. A
        gift or bargain transfer inside the look-back can delay the very care
        the family is trying to reach.
      </p>
      <AttorneyFlag>
        That instruction is a guardrail, not a legal strategy. A Georgia
        elder-law attorney has to look at the real facts: spouse, disabled
        child, hardship waiver, homestead, liens. We will not pretend the
        packet is the answer in a scramble.
      </AttorneyFlag>
      <section className="rounded-lg border border-line bg-panel p-5">
        <h2 className="font-display text-xl">What to do this week</h2>
        <ol className="mt-3 grid list-decimal gap-2 pl-5 text-muted">
          <li>Leave the deed alone until counsel says otherwise.</li>
          <li>
            Call a NAELA elder-law attorney, or Georgia Legal Services if money
            is tight.
          </li>
          <li>
            Bring a deed copy, a list of who lives in the home, and any
            Medicaid notices.
          </li>
          <li>
            Sit with the family. This is a hard week. You do not have to solve
            it from a website.
          </li>
        </ol>
      </section>
      <ul className="grid gap-1">
        {OFFICIAL_LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/protect"
          className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
        >
          Still read the explainer
        </Link>
        <Link
          to="/protect/quiz"
          className={cn(buttonVariants({ variant: "ghost" }), "no-underline")}
        >
          Retake the season quiz
        </Link>
      </div>
      <Disclaimer />
    </div>
  );
}
