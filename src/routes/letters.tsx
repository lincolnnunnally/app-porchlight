import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import {
  LETTER_OPTIONS,
  writeLetter,
  type LetterKind,
} from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";

type Search = { house?: string };

export const Route = createFileRoute("/letters")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    house: typeof s.house === "string" ? s.house : undefined,
  }),
  component: LettersPage,
});

function LettersPage() {
  const houses = useHuntStore((s) => s.houses);
  const setStage = useHuntStore((s) => s.setStage);
  const addLetter = useHuntStore((s) => s.addLetter);
  const search = Route.useSearch();
  const [houseId, setHouseId] = useState(search.house ?? houses[0]?.id ?? "");
  const [kind, setKind] = useState<LetterKind>("neighbor");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState("Copy");
  const [saved, setSaved] = useState("Mark letter sent");

  useEffect(() => {
    if (search.house) setHouseId(search.house);
  }, [search.house]);

  const house = useMemo(
    () => houses.find((h) => h.id === houseId),
    [houses, houseId],
  );

  function generate() {
    if (!house) return;
    setBody(writeLetter(kind, house));
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-3xl">Letters</h1>
        <p className="mt-1 text-muted">
          Write a letter the owner would actually want to read.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          className="flex-1"
          value={houseId}
          onChange={(e) => setHouseId(e.target.value)}
        >
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.address}, {h.city}
            </option>
          ))}
        </Select>
        <Select
          value={kind}
          onChange={(e) => setKind(e.target.value as LetterKind)}
        >
          {LETTER_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
        <Button variant="teal" onClick={generate}>
          Write letter
        </Button>
      </div>
      <Textarea
        rows={14}
        value={body}
        placeholder="Pick a house and write a letter the owner would actually want to read."
        onChange={(e) => setBody(e.target.value)}
        className="min-h-52 rounded-lg border-line bg-paper font-display text-base leading-relaxed text-paper-ink placeholder:text-paper-ink/50"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(body);
              setCopied("Copied");
              setTimeout(() => setCopied("Copy"), 1200);
            } catch {
              setCopied("Select and copy");
            }
          }}
        >
          {copied}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (!house || !body) return;
            if (house.stage === "watching") setStage(house.id, "letter");
            addLetter({ houseId: house.id, at: Date.now(), body });
            setSaved("Saved on the hunt");
            setTimeout(() => setSaved("Mark letter sent"), 1400);
          }}
        >
          {saved}
        </Button>
      </div>
    </div>
  );
}
