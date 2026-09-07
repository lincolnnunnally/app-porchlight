import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { type Party } from "@/lib/rental";
import { useRentalStore } from "@/lib/rental-store";
import { formatDate } from "@/lib/utils";

const FROM: Record<Party, string> = {
  renter: "Household",
  owner: "Owner",
  manager: "Manager",
};

export function MessageThread({
  homeId,
  from,
}: {
  homeId: string;
  from: Party;
}) {
  const messages = useRentalStore((s) => s.messages);
  const addMessage = useRentalStore((s) => s.addMessage);
  const [body, setBody] = useState("");
  const mine = messages
    .filter((m) => m.homeId === homeId)
    .slice()
    .sort((a, b) => a.at - b.at);

  return (
    <section className="grid gap-3">
      <h2 className="font-display text-xl">Talk about this house</h2>
      <ul className="grid gap-2">
        {mine.length === 0 ? (
          <li className="text-sm text-muted">No notes yet. Say the useful thing.</li>
        ) : (
          mine.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-line bg-panel px-4 py-3"
            >
              <p className="text-xs tracking-wide text-gold-2 uppercase">
                {FROM[m.from]} · {formatDate(m.at)}
              </p>
              <p className="mt-1 leading-relaxed">{m.body}</p>
            </li>
          ))
        )}
      </ul>
      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          addMessage(homeId, from, body.trim());
          setBody("");
        }}
      >
        <Textarea
          rows={3}
          value={body}
          placeholder="A short honest note"
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" variant="ghost">
          Send
        </Button>
      </form>
    </section>
  );
}
