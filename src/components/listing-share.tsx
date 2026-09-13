import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import {
  encodeListing,
  listingText,
  listingUrl,
  publicListingFrom,
} from "@/lib/listing";
import { listingContactFor, siteOrigin } from "@/lib/listing-contact";
import { isSearchable, type RentalHome } from "@/lib/rental";
import { cn } from "@/lib/utils";

/**
 * The public listing travels in its own link. Copy it into a Google Business
 * post, a church bulletin, a text — anyone who opens it sees the same facts
 * the house sheet holds, minus the wifi password.
 */
export function ListingShare({
  home,
  compact,
}: {
  home: RentalHome;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  if (!isSearchable(home)) {
    if (compact) return null;
    return (
      <p className="text-sm text-muted">
        {home.status === "occupied"
          ? "Occupied — no public listing while a family lives here."
          : "Off market — set the house to Available to share a public listing."}
      </p>
    );
  }
  const listing = publicListingFrom(home, listingContactFor(home));
  const encoded = encodeListing(listing);
  const url = listingUrl(listing, siteOrigin());

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied("Select and copy from the listing page");
    }
  };

  return (
    <div className={cn("grid gap-2", compact ? "" : "rounded-lg border border-line bg-bg-2 p-4")}>
      {compact ? null : (
        <div>
          <p className="text-sm tracking-wide text-gold-2 uppercase">Public listing</p>
          <p className="text-sm text-muted">
            One link Google, a pastor, or a neighbor can open from any phone.
            It carries the house facts — not the wifi password.
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link
          to="/listing/$homeId"
          params={{ homeId: home.id }}
          search={{ d: encoded }}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "no-underline")}
        >
          Open public listing
        </Link>
        <Button size="sm" variant="ghost" onClick={() => copy(url, "Link copied")}>
          Copy listing link
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copy(listingText(listing, url), "Listing text copied")}
        >
          Copy for Google / Facebook / bulletin
        </Button>
      </div>
      {copied ? <p className="text-sm text-teal">{copied}</p> : null}
    </div>
  );
}
