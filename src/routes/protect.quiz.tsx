import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Choice } from "@/components/choice";
import { AttorneyFlag } from "@/components/attorney-flag";
import { Button } from "@/components/ui/button";
import type { QuizAnswers } from "@/lib/steward";
import { useStewardStore } from "@/lib/steward-store";

export const Route = createFileRoute("/protect/quiz")({
  component: QuizPage,
});

const STEPS: {
  key: keyof QuizAnswers;
  question: string;
  options: { id: string; title: string; hint?: string }[];
}[] = [
  {
    key: "who",
    question: "Who is this for?",
    options: [
      { id: "self", title: "Me. I own the home and still live in it." },
      { id: "child", title: "A parent. I’m the adult child helping them plan." },
      {
        id: "connector",
        title: "I’m a pastor or neighbor referring a family.",
        hint: "No packet. Share the explainer.",
      },
    ],
  },
  {
    key: "living",
    question: "Where is the homeowner living right now?",
    options: [
      { id: "home", title: "At home.", hint: "This is the planning season we can walk with." },
      {
        id: "facility",
        title: "Nursing home or similar long-term care.",
        hint: "Do not move title from this app.",
      },
    ],
  },
  {
    key: "medicaidWindow",
    question: "Does anyone expect nursing-home or long-term Medicaid inside five years?",
    options: [
      { id: "no", title: "No. We are planning five or more years ahead." },
      {
        id: "yes",
        title: "Yes. Care is needed now, or an application is likely soon.",
      },
      { id: "unsure", title: "Not sure yet." },
    ],
  },
  {
    key: "houseIsPrimary",
    question: "Is the house the main thing of value?",
    options: [
      { id: "yes", title: "Yes. The house is the nest egg." },
      { id: "no", title: "No. There are other significant assets." },
    ],
  },
  {
    key: "stayIntent",
    question: "Does the homeowner intend to stay?",
    options: [
      { id: "years", title: "Yes — for years, if health allows." },
      { id: "soon", title: "A move to care is already being planned." },
      { id: "unsure", title: "We don’t know yet. That’s why we’re here." },
    ],
  },
];

function QuizPage() {
  const quiz = useStewardStore((s) => s.quiz);
  const setQuiz = useStewardStore((s) => s.setQuiz);
  const finishQuiz = useStewardStore((s) => s.finishQuiz);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const value = quiz[current.key];
  const last = step === STEPS.length - 1;

  function choose(id: string) {
    setQuiz({ [current.key]: id } as Partial<QuizAnswers>);
  }

  function next() {
    if (!value) return;
    if (current.key === "who" && value === "connector") {
      navigate({ to: "/connect" });
      return;
    }
    if (!last) {
      setStep((s) => s + 1);
      return;
    }
    const season = finishQuiz();
    if (season === "crisis") navigate({ to: "/protect/crisis" });
    else if (season === "connector") navigate({ to: "/connect" });
    else navigate({ to: "/protect/intake" });
  }

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <div>
        <p className="text-sm text-muted">
          Question {step + 1} of {STEPS.length}
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-gold transition-[width] duration-fast"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
      <h1 className="font-display text-3xl leading-tight">{current.question}</h1>
      <div className="grid gap-2">
        {current.options.map((o) => (
          <Choice
            key={o.id}
            selected={value === o.id}
            title={o.title}
            hint={o.hint}
            onSelect={() => choose(o.id)}
          />
        ))}
      </div>
      <AttorneyFlag>
        This quiz only sorts planning from crisis. It does not decide Medicaid
        eligibility.
      </AttorneyFlag>
      <div className="flex flex-wrap gap-2">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        <Button disabled={!value} onClick={next}>
          {last ? "See my season" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
