import { createFileRoute } from "@tanstack/react-router";
import { ServiceExplainer } from "@/components/service-explainer";
import { pageHead, serviceLd } from "@/lib/seo";

const PATH = "/donate-a-house";
const TITLE = "Donate a house so a family can live there | Porchlight";
const DESCRIPTION =
  "Thinking of giving a house so a family can live in it? Porchlight helps you put that wish in writing. A gift of property is a legal act an attorney papers.";

export const Route = createFileRoute("/donate-a-house")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: PATH,
      jsonLd: [
        serviceLd({
          name: "Start a house gift conversation",
          description: DESCRIPTION,
          path: PATH,
          serviceType: "Property donation conversation starter",
          audience: "Owners who want to give a house",
        }),
      ],
    }),
  component: DonateAHouse,
});

function DonateAHouse() {
  return (
    <ServiceExplainer
      path={PATH}
      kicker="Donate"
      title="Give a house so someone can live there"
      intro="Some owners would rather a house became a home again than sit empty or go to a stranger. Porchlight helps you put that wish in writing so a lawyer or a charity can act on it."
      whoFor={[
        "Owners, or a family settling a house, who want it to go to a family who will keep it.",
      ]}
      youGet={[
        "The house looked up by address, with its public records one tap away.",
        "A written note of your intent you can copy and bring to an attorney or a charity that can receive property.",
        "Other honest options on the same page if a gift is not the right fit: rent it fairly, sell quietly, or keep use of the home.",
      ]}
      steps={[
        "Type the address on the home page and choose “Donate the property”.",
        "Read how a gift works, then copy the note.",
        "Take it to an attorney or a charity that can actually receive a house.",
      ]}
      note={
        <p>
          A gift to a 501(c)(3) is a legal act. Porchlight does not issue a tax receipt, does not
          promise a deduction, and does not paper the deed — an attorney does. We do not take
          houses.
        </p>
      }
      cta={[{ href: "/", label: "Look up the house" }]}
    />
  );
}
