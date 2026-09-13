import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <article className="mx-auto grid max-w-2xl gap-4">
      <p className="text-sm tracking-wide text-gold-2 uppercase">Privacy</p>
      <h1 className="font-display text-3xl">What this notebook holds</h1>
      <p className="text-muted">
        Porchlight is a house notebook. Until accounts are on, what you enter
        stays on this device in your browser. We do not scrape Zillow, the
        tax assessor, or MLS into a private dossier. Those links open the
        public pages so you can look for yourself.
      </p>
      <p className="text-muted">
        A public listing link carries house facts you chose to share (address,
        rent, trash day, duties). It never carries the wifi password.
      </p>
      <p className="text-muted">
        We do not sell lists of neighbors. We do not run credit pulls from
        this app. If you write a phone number on a lease or a waitlist, it
        lives in the same notebook as the house.
      </p>
      <p>
        <Link to="/" className="text-gold-2">
          Back to the porch
        </Link>
      </p>
    </article>
  );
}
