import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Hammer,
  HeartHandshake,
  KeyRound,
  Search,
  Shield,
} from "lucide-react";
import { EnterPlaceForm } from "@/components/enter-place";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="grid gap-10">
      <section className="grid gap-4 pt-2">
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          Vidalia / Toombs, and families who paid in
        </p>
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          <span className="block min-w-0 max-w-full">Type an address.</span>
          <span className="block min-w-0 max-w-full">
            We’ll look the house up.
          </span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Protect a home. Sell it without a listing machine. Donate it. Rent it
          fairly. Or find a place to live and put your hands to work. One
          house, honest next steps — not a dead record.
        </p>
      </section>

      <EnterPlaceForm />

      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Or start from what you need</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Door
            to="/search"
            icon={<Search className="size-5" strokeWidth={1.75} />}
            kicker="Live here"
            title="Find a place to live"
            body="Fair rent, or a quiet buy that still needs hands."
            action="Search houses"
          />
          <Door
            to="/protect"
            icon={<Shield className="size-5" strokeWidth={1.75} />}
            kicker="Keep"
            title="Protect a home"
            body="Help a parent who is still well plan five years ahead."
            action="Start with the season"
          />
          <Door
            to="/hunt"
            icon={<Hammer className="size-5" strokeWidth={1.75} />}
            kicker="Off-market"
            title="Hunt a house before it lists"
            body="Write a letter the owner would actually want to read."
            action="Open the hunt"
          />
          <Door
            to="/rent"
            icon={<KeyRound className="size-5" strokeWidth={1.75} />}
            kicker="Rent"
            title="Operate the homes you keep"
            body="Occupancy, a house sheet, a lease, and rent you can confirm."
            action="Open rentals"
          />
          <Door
            to="/owners"
            icon={<HeartHandshake className="size-5" strokeWidth={1.75} />}
            kicker="Owners"
            title="Bring a house you already have"
            body="Sell quietly, rent fairly, or cash out later. You keep the keys."
            action="For owners"
          />
        </div>
      </section>
    </div>
  );
}

function Door({
  to,
  icon,
  kicker,
  title,
  body,
  action,
}: {
  to: "/hunt" | "/protect" | "/rent" | "/search" | "/owners";
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-[16.5rem] max-w-[22rem] flex-1 flex-col gap-3 rounded-xl border border-line bg-panel p-6 text-ink no-underline transition-colors duration-fast hover:border-gold/50"
    >
      <span className="flex items-center gap-2 text-sm text-gold-2">
        {icon}
        {kicker}
      </span>
      <h2 className="font-display text-2xl leading-snug">{title}</h2>
      <p className="flex-1 leading-relaxed text-muted">{body}</p>
      <span className={cn(buttonVariants(), "mt-2 self-start")}>{action}</span>
    </Link>
  );
}
