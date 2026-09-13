import { countyForCity } from "./lookups.ts";

/** Georgia county name as Keep intake expects it (Toombs, not Toombs County). */
export function countyNameForIntake(city: string): string {
  const county = countyForCity(city);
  if (!county) return "Other Georgia county";
  return county.name.replace(/ County$/i, "");
}

export function houseLine(address: string, city: string) {
  return `${address.trim()}, ${city.trim()}, GA`;
}

/**
 * A conversation starter for a gift of the house. Not a tax receipt,
 * not a 501(c)(3) acknowledgment, not a deed.
 */
export function donateConversationNote(address: string, city: string) {
  const where = houseLine(address, city);
  return `I want the house at ${where} to become a home for a family who will keep the porch light on.

A gift to a 501(c)(3) is a legal act. Porchlight does not issue a tax receipt from this notebook, and does not promise a deduction. An attorney still papers the deed. We do not take houses.

This note is for a conversation with a lawyer or a charity that can actually receive property.`;
}

export function giftIntentNote(address: string, city: string) {
  return `Gift intent for ${houseLine(address, city)} — not a tax receipt. Attorney still papers the deed.`;
}

export function protectHouseAddress(address: string, city: string) {
  return `${address.trim()}, ${city.trim()}`;
}
