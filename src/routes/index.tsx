import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Hammer,
  HeartHandshake,
  KeyRound,
  Search,
  Shield,
  Sun,
} from "lucide-react";
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
          A porch light is a small honest thing.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Find a house before it lists. Help an elder keep use of the home.
          Rent it fairly. Owners keep the keys to the market — and cash out
          when they want.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Door
          to="/search"
          icon={<Search className="size-5" strokeWidth={1.75} />}
          kicker="Search"
          title="Find a place to live"
          body="Fair rent and quiet sales in Vidalia / Toombs. Ask to be told when a porch light comes on."
          action="Search houses"
        />
        <Door
          to="/hunt"
          icon={<Hammer className="size-5" strokeWidth={1.75} />}
          kicker="Off-market"
          title="Find a house before it lists"
          body="Buy. Repair with your hands. Live, rent, or sell. Write a letter the owner would actually want to read."
          action="Open the hunt"
        />
        <Door
          to="/protect"
          icon={<Shield className="size-5" strokeWidth={1.75} />}
          kicker="Home stewardship"
          title="Keep use of the home"
          body="Help a parent who is still well plan five years ahead. Occupancy stays with them. An attorney signs. We never take the house."
          action="Start with the season"
        />
        <Door
          to="/rent"
          icon={<KeyRound className="size-5" strokeWidth={1.75} />}
          kicker="Fair rent"
          title="Operate the homes you keep"
          body="Leases, a payment ledger, work that needs hands, and a waitlist of neighbors to call when a light comes on."
          action="Open rentals"
        />
        <Door
          to="/owners"
          icon={<Sun className="size-5" strokeWidth={1.75} />}
          kicker="Owners"
          title="Bring a house. Cash out later."
          body="Sell quietly or rent fairly. Sign off on who lives there. Put it on the market or take it off. You decide."
          action="For owners"
        />
        <Door
          to="/dash"
          icon={<HeartHandshake className="size-5" strokeWidth={1.75} />}
          kicker="Desk"
          title="Renter, owner, manager"
          body="See the house, the money, the work, and talk when you need to. One notebook. Three seats."
          action="Open the desk"
        />
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
  to: "/hunt" | "/protect" | "/rent" | "/search" | "/owners" | "/dash";
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 rounded-xl border border-line bg-panel p-6 text-ink no-underline transition-colors duration-fast hover:border-gold/50"
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