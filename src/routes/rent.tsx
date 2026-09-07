import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RentSubnav } from "@/components/rent-subnav";

export const Route = createFileRoute("/rent")({
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
