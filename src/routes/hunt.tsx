import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HouseCard } from "@/components/house-card";
import { HouseForm } from "@/components/house-form";
import { HuntStats } from "@/components/hunt-stats";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { STAGES, type House } from "@/lib/hunt";
import { useHuntStore } from "@/lib/hunt-store";

export const Route = createFileRoute("/hunt")({ component: HuntPage });

function HuntPage() {
  const houses = useHuntStore((s) => s.houses);
  const addHouse = useHuntStore((s) => s.addHouse);
  const updateHouse = useHuntStore((s) => s.updateHouse);
  const removeHouse = useHuntStore((s) => s.removeHouse);
  const setStage = useHuntStore((s) => s.setStage);
  const navigate = useNavigate();
  const [editing, setEditing] = useState<House | null | "new">(null);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Hunt</h1>
          <p className="mt-1 text-muted">
            Drag a card to move it along. On a phone, open the house and change
            the stage.
          </p>
        </div>
        <Button onClick={() => setEditing("new")}>Add a house</Button>
      </div>
      <HuntStats houses={houses} />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {STAGES.map((stage) => {
          const col = houses.filter((h) => h.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="min-w-[260px] snap-start rounded-lg border border-line bg-panel/70 p-3 md:min-w-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) setStage(id, stage.id);
              }}
            >
              <h2 className="mb-3 text-sm font-medium text-muted">
                {stage.label} · {col.length}
              </h2>
              <div className="grid gap-3">
                {col.length === 0 ? (
                  <p className="px-1 py-8 text-center text-sm text-muted">
                    Nothing here yet.
                  </p>
                ) : (
                  col.map((h) => (
                    <HouseCard
                      key={h.id}
                      house={h}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", h.id)
                      }
                      onOpen={() => setEditing(h)}
                      onLetter={() =>
                        navigate({
                          to: "/letters",
                          search: { house: h.id },
                        })
                      }
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
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
