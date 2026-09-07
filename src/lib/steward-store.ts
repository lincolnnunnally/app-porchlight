import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEMO_EXPENSES,
  DEMO_LOGS,
  EMPTY_STEWARD,
  scoreSeason,
  type Intake,
  type QuizAnswers,
  type Season,
  type StewardState,
} from "./steward";
import type { PacketStatus } from "./templates";
import { uid } from "./utils";

type StewardActions = {
  setQuiz: (patch: Partial<QuizAnswers>) => void;
  finishQuiz: () => Season;
  setIntake: (patch: Partial<Intake>) => void;
  acceptFees: () => void;
  generatePacket: () => boolean;
  advancePacket: () => void;
  addLog: (title: string, detail: string) => void;
  addExpense: (payee: string, category: string, amount: number, receipt: string) => void;
  setOccupancyNote: (note: string) => void;
  setConnector: (name: string, church: string) => string;
  loadDemoDashboard: () => void;
  resetSteward: () => void;
};

export const useStewardStore = create<StewardState & StewardActions>()(
  persist(
    (set, get) => ({
      ...EMPTY_STEWARD,
      setQuiz: (patch) =>
        set((s) => ({ quiz: { ...s.quiz, ...patch } })),
      finishQuiz: () => {
        const season = scoreSeason(get().quiz);
        set({
          season,
          packetStatus: season === "crisis" ? "empty" : get().packetStatus,
        });
        return season;
      },
      setIntake: (patch) =>
        set((s) => ({ intake: { ...s.intake, ...patch } })),
      acceptFees: () => set({ feesAcceptedAt: Date.now() }),
      generatePacket: () => {
        const s = get();
        if (s.season === "crisis") return false;
        if (!s.feesAcceptedAt) return false;
        set({ packetStatus: "draft", packetGeneratedAt: Date.now() });
        return true;
      },
      advancePacket: () => {
        const order: PacketStatus[] = [
          "draft",
          "paralegal",
          "attorney",
          "recorded",
        ];
        const cur = get().packetStatus;
        const i = order.indexOf(cur);
        if (i < 0 || i >= order.length - 1) return;
        const next = order[i + 1];
        if (next === "recorded") {
          set({
            packetStatus: next,
            occupancyNote:
              get().occupancyNote ||
              "Occupant is at home. Porch light on. No rent charged.",
            logs: get().logs.length ? get().logs : DEMO_LOGS,
            expenses: get().expenses.length ? get().expenses : DEMO_EXPENSES,
          });
        } else {
          set({ packetStatus: next });
        }
      },
      addLog: (title, detail) =>
        set((s) => ({
          logs: [
            { id: uid("log"), at: Date.now(), title, detail },
            ...s.logs,
          ],
        })),
      addExpense: (payee, category, amount, receipt) =>
        set((s) => ({
          expenses: [
            {
              id: uid("exp"),
              at: Date.now(),
              payee,
              category,
              amount,
              receipt,
            },
            ...s.expenses,
          ],
        })),
      setOccupancyNote: (occupancyNote) => set({ occupancyNote }),
      setConnector: (name, church) => {
        const code =
          (church || name || "neighbor")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 24) || "neighbor";
        set({
          connectorName: name,
          connectorChurch: church,
          connectorCode: code,
          season: "connector",
        });
        return code;
      },
      loadDemoDashboard: () =>
        set({
          season: "planning",
          feesAcceptedAt: Date.now(),
          packetStatus: "recorded",
          packetGeneratedAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
          occupancyNote:
            "Occupant is at home. Porch light on. No rent charged.",
          logs: DEMO_LOGS,
          expenses: DEMO_EXPENSES,
          intake: {
            ...get().intake,
            homeowner: get().intake.homeowner || "Ms. Carter",
            address: get().intake.address || "201 Maple Dr, Vidalia",
            county: get().intake.county || "Toombs",
            adultChild: get().intake.adultChild || "Dana Carter",
            adultChildContact:
              get().intake.adultChildContact || "dana@example.com",
            remainder: get().intake.remainder || "Dana Carter",
            whoLives: get().intake.whoLives || "Homeowner",
            stayYears: "5+",
          },
        }),
      resetSteward: () => set({ ...EMPTY_STEWARD }),
    }),
    {
      name: "porchlight.steward.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
