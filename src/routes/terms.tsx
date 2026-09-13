import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <article className="mx-auto grid max-w-2xl gap-4">
      <p className="text-sm tracking-wide text-gold-2 uppercase">Terms</p>
      <h1 className="font-display text-3xl">What this app is, and is not</h1>
      <p className="text-muted">
        Porchlight helps people look up a house, keep use of a home, rent it
        fairly, sell quietly, or give it so someone can live there. We do not
        take houses.
      </p>
      <p className="text-muted">
        This is not legal advice, a listing service, a closed sale, or a tax
        receipt. Georgia Medicaid estate recovery copy is education. An
        attorney still signs. A gift to a 501(c)(3) is a legal act we do not
        paper from this screen.
      </p>
      <p className="text-muted">
        Rent on this site is a confirmed ledger — cash, Zelle, check. We do
        not collect rent by card here. A lease draft is a conversation record,
        not a magistrate filing.
      </p>
      <p className="text-muted">
        Sample houses on a new device are labeled as samples. Your own
        addresses are yours.
      </p>
      <p>
        <Link to="/" className="text-gold-2">
          Back to the porch
        </Link>
      </p>
    </article>
  );
}
