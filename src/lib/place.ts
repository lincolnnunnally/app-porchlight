import type { House } from "./hunt";
import { normalizePlaceKey } from "./lookups";
import type { RentalHome } from "./rental";

export type PlaceRecord = {
  id: string;
  hunt?: House;
  rent?: RentalHome;
  address: string;
  city: string;
};

export function findPlace(
  placeId: string,
  houses: House[],
  homes: RentalHome[],
): PlaceRecord | null {
  const huntById = houses.find((h) => h.id === placeId);
  const rentById = homes.find((h) => h.id === placeId);
  const seed = huntById ?? rentById;
  if (!seed) return null;
  const key = normalizePlaceKey(seed.address, seed.city);
  const hunt =
    huntById ??
    houses.find((h) => normalizePlaceKey(h.address, h.city) === key);
  const rent =
    rentById ??
    homes.find((h) => normalizePlaceKey(h.address, h.city) === key);
  return {
    id: placeId,
    hunt,
    rent,
    address: seed.address,
    city: seed.city,
  };
}

export function placePath(id: string) {
  return `/place/${id}` as const;
}
