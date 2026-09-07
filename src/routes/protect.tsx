import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectSubnav } from "@/components/protect-subnav";

export const Route = createFileRoute("/protect")({
  component: ProtectLayout,
});

function ProtectLayout() {
  return (
    <div className="grid gap-8">
      <ProtectSubnav />
      <Outlet />
    </div>
  );
}
