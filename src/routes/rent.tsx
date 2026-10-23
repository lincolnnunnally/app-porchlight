import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RentSubnav } from "@/components/rent-subnav";
import { privateHead } from "@/lib/seo";

export const Route = createFileRoute("/rent")({
  head: () => privateHead("Rent"),
  component: RentLayout,
});

function RentLayout() {
  return (
    <div className="grid gap-8">
      <RentSubnav />
      <Outlet />
    </div>
  );
}
