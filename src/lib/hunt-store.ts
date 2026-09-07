import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  HUNT_SEED,
  type House,
  type HuntStage,
  type Letter,
} from "./hunt";

type HuntState = {
  houses: House[];
  letters: Letter[];
  addHouse: (house: Omit<House, "id"> & { id?: string }) => string;
  updateHouse: (id: string, patch: Partial<House>) => void;
  removeHouse: (id: string) => void;
  setStage: (id: string, stage: HuntStage) => void;
  addLetter: (letter: Letter) => void;
};

export const useHuntStore = create<HuntState>()(
  persist(
    (set) => ({
      houses: HUNT_SEED.map((h) => ({ ...h })),
      letters: [],
      addHouse: (house) => {
        const id = house.id ?? `h${Date.now().toString(36)}`;
        set((s) => ({
          houses: [{ ...house, id }, ...s.houses],
        }));
        return id;
      },
      updateHouse: (id, patch) =>
        set((s) => ({
          houses: s.houses.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      removeHouse: (id) =>
        set((s) => ({ houses: s.houses.filter((h) => h.id !== id) })),
      setStage: (id, stage) =>
        set((s) => ({
          houses: s.houses.map((h) => (h.id === id ? { ...h, stage } : h)),
        })),
      addLetter: (letter) =>
        set((s) => ({ letters: [...s.letters, letter] })),
    }),
    {
      name: "porchlight.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ houses: s.houses, letters: s.letters }),
    },
  ),
);
