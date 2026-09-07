import { createFileRoute } from "@tanstack/react-router";
import { AttorneyFlag } from "@/components/attorney-flag";
import { VNEXT_PACKET } from "@/lib/vnext-packet";

export const Route = createFileRoute("/packet")({ component: PacketDoc });

function PacketDoc() {
  const p = VNEXT_PACKET;
  return (
    <article className="mx-auto grid max-w-3xl gap-6">
      <header className="grid gap-2">
        <p className="text-sm tracking-wide text-gold-2 uppercase">
          AppEngine vNext packet · do not deploy
        </p>
        <h1 className="font-display text-3xl">
          {p.app}: {p.currentVersion} → {p.targetVersion}
        </h1>
        <p className="text-muted">
          Live hunt remains at {p.productionUrl}. This packet adds Home
          Stewardship and fair-rent operations. It does not replace Hunt /
          Houses / Letters.
        </p>
      </header>
      <AttorneyFlag>
        {p.attorneyApprovalRequired.length} copy and template items must be
        signed before production.
      </AttorneyFlag>
      <Section title="Purpose" body={p.purpose} />
      <Section title="Barrier removed" body={p.barrierRemoved} />
      <Section title="Need addressed" body={p.needAddressed} />
      <Section title="Movement toward life" body={p.movementTowardLife} />
      <Section title="Transformation" body={p.transformationOutcome} />
      <List title="Audience" items={[...p.audience]} />
      <List title="App boundaries" items={[...p.appBoundaries]} />
      <List title="Non-goals" items={[...p.nonGoals]} />
      <List title="Phases" items={[...p.phases]} />
      <List title="Attorney must approve before production" items={[...p.attorneyApprovalRequired]} />
      <List title="Later, not now" items={[...p.laterNotNow]} />
      <Section title="Release gate" body={p.releaseGate} />
      <Section title="Provider / cost delta" body={p.providerCostDelta} />
      <Section title="Tool classification" body={p.toolClassification} />
      <pre className="overflow-x-auto rounded-lg border border-line bg-bg-2 p-4 text-xs leading-relaxed text-muted">
        {JSON.stringify(p, null, 2)}
      </pre>
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="font-display text-xl">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted">{body}</p>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="font-display text-xl">{title}</h2>
      <ul className="mt-2 grid gap-1 text-muted">
        {items.map((item) => (
          <li key={item}>— {item}</li>
        ))}
      </ul>
    </section>
  );
}
