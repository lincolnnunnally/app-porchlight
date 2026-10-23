import { createFileRoute } from "@tanstack/react-router";
import { ServiceExplainer } from "@/components/service-explainer";
import { LOCAL_AREA, pageHead, serviceLd } from "@/lib/seo";

const PATH = "/fair-rent-desk";
const TITLE = "Run a rental fairly: leases, rent, repairs | Porchlight";
const DESCRIPTION =
  "A simple desk for small landlords in Vidalia and Toombs: house sheet, applications, lease drafts, rent ledger, repair work, a waitlist, and a listing link.";

export const Route = createFileRoute("/fair-rent-desk")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: PATH,
      jsonLd: [
        serviceLd({
          name: "Fair-rent desk for small landlords",
          description: DESCRIPTION,
          path: PATH,
          serviceType: "Rental property record keeping",
          areaServed: LOCAL_AREA,
          audience: "Owners who rent out a house",
        }),
      ],
    }),
  component: FairRentDesk,
});

function FairRentDesk() {
  return (
    <ServiceExplainer
      path={PATH}
      kicker="Rent"
      title="Run the homes you keep — fair rent, not market max"
      intro="After a hunt, or after someone moves out: who lives there, what is due, what needs hands, and who is waiting. One desk for a few houses, kept honest."
      whoFor={[
        "Owners renting out one house or a handful, who keep it all on paper and a phone.",
        "Families keeping a parent’s house and renting it to a neighbor who is already waiting.",
      ]}
      youGet={[
        "A house sheet: trash day, duties, and the facts a renter needs, with a history when they change.",
        "Applications, and lease drafts kept as a record of what was agreed.",
        "A rent ledger you confirm — cash, check, Zelle, or money order. Porchlight does not collect rent by card.",
        "Work that needs hands, with vendors, and a calendar of what is coming up.",
        "A waitlist of neighbors, with the best fits shown when a house opens up.",
        "A listing link you can share when the porch light is on. It never carries the wifi password.",
      ]}
      steps={[
        "Add a rental, or open a house you already looked up and start a rental record.",
        "Fill in the house sheet and the lease.",
        "Log rent as it comes in, track the work, and keep the waitlist warm.",
      ]}
      note={
        <p>
          A lease draft is a conversation record, not a court filing. What you enter stays on this
          device until accounts are on.
        </p>
      }
      cta={[
        { href: "/rent", label: "Open rentals" },
        { href: "/search", label: "See homes with the light on" },
      ]}
    />
  );
}
