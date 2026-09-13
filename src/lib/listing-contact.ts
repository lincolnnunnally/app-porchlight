import { ownerLabel, type RentalHome } from "./rental";
import { useRentalStore } from "./rental-store";

export const PUBLIC_ORIGIN = "https://porchlight.unitedundergod.org";

export function siteOrigin() {
  if (typeof window === "undefined") return PUBLIC_ORIGIN;
  return window.location.origin || PUBLIC_ORIGIN;
}

/** Owner or steward name + phone for the listing. Never the wifi password. */
export function listingContactFor(home: RentalHome) {
  const owners = useRentalStore.getState().owners;
  const owner = owners.find((o) => o.id === home.ownerId);
  const name = ownerLabel(owners, home.ownerId, "Porchlight");
  return owner?.phone ? `${name} · ${owner.phone}` : name;
}
