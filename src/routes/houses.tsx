import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HouseCard } from "@/components/house-card";
import { HouseForm } from "@/components/house-form";
import { HuntStats } from "@/components/hunt-stats";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import type { House } from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";

export const Route = createFileRoute("/houses")({ component: HousesPage });

function HousesPage() {
  const houses = useHuntStore((s) => s.houses);
  const addHouse = useHuntStore((s) => s.addHouse);
  const updateHouse = useHuntStore((s) => s.updateHouse);
  const removeHouse = useHuntStore((s) => s.removeHouse);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<House | null | "new">(null);
  const shown = houses.filter((h) =>
    JSON.stringify(h).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="font-display text-3xl">Houses</h1>
        <p className="mt-1 text-muted">
          Off-market only. Ask around the block before a letter.
        </p>
      </div>
      <HuntStats houses={houses} />
      <div className="flex flex-wrap gap-3">
        <Input
          className="min-w-48 flex-1"
          value={q}
          placeholder="Search address, notes, owner…"
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={() => setEditing("new")}>Add a house</Button>
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-muted">No houses match.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((h) => (
            <HouseCard
              key={h.id}
              house={h}
              onOpen={() => setEditing(h)}
              onLetter={() =>
                navigate({ to: "/letters", search: { house: h.id } })
              }
            />
          ))}
        </div>
      )}
      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        <HouseForm
          house={editing && editing !== "new" ? editing : null}
          onSave={(row) => {
            if (editing && editing !== "new") updateHouse(editing.id, row);
            else addHouse(row);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          onDelete={
            editing && editing !== "new"
              ? () => {
                  removeHouse(editing.id);
                  setEditing(null);
                }
              : undefined
          }
        />
      </Modal>
    </div>
  );
}
