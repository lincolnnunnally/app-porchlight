import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { COUNSEL_CHECKS, WORK_PILE, type ReviewStatus } from "./legal";
import { LOCKED_TEMPLATES, type TemplateId } from "./templates";

export type Review = {
  id: TemplateId;
  status: ReviewStatus;
  body: string;
  note: string;
  at: number | null;
};

type LegalState = {
  attorneyName: string;
  barNumber: string;
  office: string;
  reviews: Review[];
  checks: Record<string, boolean>;
  setAttorney: (name: string, bar: string, office: string) => void;
  setBody: (id: TemplateId, body: string) => void;
  setNote: (id: TemplateId, note: string) => void;
  sign: (id: TemplateId) => void;
  sendBack: (id: TemplateId) => void;
  reopen: (id: TemplateId) => void;
  toggleCheck: (id: string) => void;
};

function seedReviews(): Review[] {
  return LOCKED_TEMPLATES.map((t) => ({
    id: t.id,
    status: "needs_you" as ReviewStatus,
    body: t.body,
    note: "",
    at: null,
  }));
}

function seedChecks() {
  return Object.fromEntries(COUNSEL_CHECKS.map((c) => [c.id, false]));
}

export const useLegalStore = create<LegalState>()(
  persist(
    (set) => ({
      attorneyName: "",
      barNumber: "",
      office: "",
      reviews: seedReviews(),
      checks: seedChecks(),
      setAttorney: (attorneyName, barNumber, office) =>
        set({ attorneyName, barNumber, office }),
      setBody: (id, body) =>
        set((s) => ({
          reviews: s.reviews.map((r) => (r.id === id ? { ...r, body } : r)),
        })),
      setNote: (id, note) =>
        set((s) => ({
          reviews: s.reviews.map((r) => (r.id === id ? { ...r, note } : r)),
        })),
      sign: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id
              ? { ...r, status: "signed" as ReviewStatus, at: Date.now() }
              : r,
          ),
        })),
      sendBack: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id
              ? { ...r, status: "returned" as ReviewStatus, at: Date.now() }
              : r,
          ),
        })),
      reopen: (id) =>
        set((s) => ({
          reviews: s.reviews.map((r) =>
            r.id === id
              ? { ...r, status: "needs_you" as ReviewStatus }
              : r,
          ),
        })),
      toggleCheck: (id) =>
        set((s) => ({ checks: { ...s.checks, [id]: !s.checks[id] } })),
    }),
    {
      name: "porchlight.legal.v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<LegalState>;
        const byId = new Map(
          (p.reviews ?? []).map((r) => [r.id, r] as const),
        );
        const reviews = LOCKED_TEMPLATES.map((t) => {
          const old = byId.get(t.id);
          return old
            ? {
                ...old,
                body: old.body || t.body,
                note: old.note ?? "",
                status: old.status ?? "needs_you",
              }
            : {
                id: t.id,
                status: "needs_you" as ReviewStatus,
                body: t.body,
                note: "",
                at: null,
              };
        });
        return {
          ...current,
          ...p,
          reviews,
          checks: { ...seedChecks(), ...(p.checks ?? {}) },
          attorneyName: p.attorneyName ?? current.attorneyName,
          barNumber: p.barNumber ?? current.barNumber,
          office: p.office ?? current.office,
        };
      },
    },
  ),
);

export function nextWork(reviews: Review[]) {
  const order = WORK_PILE.map((w) => w.id);
  for (const id of order) {
    const r = reviews.find((x) => x.id === id);
    if (r && r.status !== "signed") return r;
  }
  return null;
}
