import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withHouseFactsSpine } from "./house-facts.ts";
import {
  decodeListing,
  encodeListing,
  listingJsonLd,
  listingPath,
  listingText,
  publicListingFrom,
} from "./listing.ts";

const home = withHouseFactsSpine({
  id: "r3",
  address: "21 Cherry St",
  city: "Vidalia",
  bedsBaths: "2 / 1",
  status: "vacant",
  fairRent: 600,
  listing: "available",
  intent: "both",
  notes: "One-story. Honest heat — ready for a family who asked.",
  statusChangedAt: 1_760_000_000_000,
  facts: {
    wifiNetwork: "CherryPorch",
    wifiPassword: "secret-not-public",
    trashDay: "Tuesday",
    lawnWho: "Occupant",
    furnished: "unfurnished" as const,
    utilities: "Occupant: power, water.",
    renterDuties: "Quiet use.",
    ownerDuties: "Repairs at cost.",
    rentToOwn: "",
    propertyKind: "residential" as const,
  },
});

describe("public listing", () => {
  it("projects the house record without the wifi password", () => {
    const listing = publicListingFrom(home);
    assert.equal(listing.address, "21 Cherry St");
    assert.equal(listing.trashDay, "Tuesday");
    assert.equal(JSON.stringify(listing).includes("secret-not-public"), false);
    assert.equal(JSON.stringify(listing).includes("CherryPorch"), false);
  });

  it("round-trips through the share link, unicode included", () => {
    const listing = publicListingFrom(home);
    const path = listingPath(listing);
    assert.ok(path.startsWith("/listing/r3?d="));
    const raw = path.split("?d=")[1];
    const back = decodeListing(raw);
    assert.deepEqual(back, listing);
    assert.equal(decodeListing("not-a-listing"), null);
    assert.equal(decodeListing(encodeListing({ ...listing, address: "" })), null);
  });

  it("writes Google structured data and a paste-ready note", () => {
    const listing = publicListingFrom(home);
    const ld = listingJsonLd(listing, "https://porchlight.unitedundergod.org/listing/r3");
    assert.equal(ld["@type"], "RealEstateListing");
    assert.equal(ld.offers.price, 600);
    assert.equal(ld.about.address.addressLocality, "Vidalia");
    assert.equal(ld.about.numberOfBedrooms, 2);
    const text = listingText(listing, "https://x/listing");
    assert.ok(text.includes("21 Cherry St, Vidalia"));
    assert.ok(text.includes("Trash day: Tuesday"));
    assert.equal(text.includes("secret-not-public"), false);
  });
});
