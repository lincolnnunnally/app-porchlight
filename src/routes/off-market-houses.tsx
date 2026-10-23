import { createFileRoute } from "@tanstack/react-router";
import { ServiceExplainer } from "@/components/service-explainer";
import { LOCAL_AREA, pageHead, serviceLd } from "@/lib/seo";

const PATH = "/off-market-houses";
const TITLE = "Off-market houses in Vidalia and Toombs County | Porchlight";
const DESCRIPTION =
  "Hunt a house in Vidalia and Toombs County before it lists. Look up the public records, track each house, and write the owner a letter they would want to read.";

export const Route = createFileRoute("/off-market-houses")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: PATH,
      jsonLd: [
        serviceLd({
          name: "Off-market house hunting",
          description: DESCRIPTION,
          path: PATH,
          serviceType: "Off-market house search and owner outreach",
          areaServed: LOCAL_AREA,
          audience: "People who want to buy, repair, and live in or rent a house",
        }),
      ],
    }),
  component: OffMarket,
});

function OffMarket() {
  return (
    <ServiceExplainer
      path={PATH}
      kicker="Off-market · Vidalia / Toombs"
      title="Off-market houses in Vidalia and Toombs County"
      intro="A lot of houses here change hands without ever being listed. Porchlight is a notebook for hunting one: type an address, open the public records, keep track of the house, and write the owner a letter."
      whoFor={[
        "People who want to buy a house they can repair with their own hands — to live in, rent fairly, or sell to someone who will keep it.",
        "Anyone watching a vacant or tired house in Vidalia, Lyons, Santa Claus, Uvalda, Higgston, or the rest of Toombs County.",
      ]}
      youGet={[
        "An address lookup that opens Street View, the county tax assessor and GIS, and Zillow for that house.",
        "A hunt board with four stages: watching, letter sent, talking, under contract.",
        "Letter drafts for the owner: a neighbor letter, a plain as-is cash letter, or a letter from someone who repairs with their hands.",
        "Once a house is yours, the same house page runs it as a fair-rent home.",
      ]}
      steps={[
        "Type the street address and town on the home page.",
        "Open the public records and add the house to the hunt.",
        "Write a letter, move the card along as the conversation goes, and keep notes in one place.",
      ]}
      note={
        <p>
          Porchlight is a notebook, not a listing service or a brokerage. What you enter stays on
          this device until accounts are on. Owners who would rather be approached quietly can{" "}
          <a href="/owners">bring a house to Porchlight</a> themselves.
        </p>
      }
      cta={[
        { href: "/", label: "Look up an address" },
        { href: "/hunt", label: "Open the hunt" },
      ]}
    />
  );
}
