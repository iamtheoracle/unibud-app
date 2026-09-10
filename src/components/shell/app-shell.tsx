import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AskBudFab } from "@/components/unibud/ask-bud";
import { DropSheet } from "@/components/unibud/drop-sheet";
import { StudioRoot } from "@/components/studio/studio-root";
import { useCampusStore } from "@/lib/unibud/campus-store";
import { ContextNav } from "./context-nav";
import { SideMenu } from "./side-menu";
import { useRightDrawer } from "./use-right-drawer";

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const drawer = useRightDrawer();
  const composeOpen = useCampusStore((s) => s.composeOpen);
  const dropOpen = useCampusStore((s) => s.dropOpen);
  const setDropOpen = useCampusStore((s) => s.setDropOpen);
  const squareView = useCampusStore((s) => s.squareView);
  const setSquareView = useCampusStore((s) => s.setSquareView);
  const hideTabs = pathname.startsWith("/bud") || pathname.startsWith("/welcome");
  const [navExpanded, setNavExpanded] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith("/bud")) sessionStorage.setItem("unibud-last-path", pathname);
    if (pathname !== "/") setSquareView("feed");
  }, [pathname, setSquareView]);

  const navHidden = hideTabs || squareView === "peek";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div
        className="mx-auto min-h-dvh max-w-3xl"
        style={{ paddingTop: navHidden ? 0 : "env(safe-area-inset-top)" }}
      >
        <Outlet />
      </div>

      <ContextNav
        hidden={navHidden}
        expanded={navExpanded}
        onExpandedChange={setNavExpanded}
        onOpenMenu={drawer.openMenu}
      />
      <AskBudFab menuOpen={drawer.open || navExpanded || composeOpen || dropOpen} />
      {dropOpen ? <DropSheet onClose={() => setDropOpen(false)} /> : null}
      <StudioRoot />

      <SideMenu
        open={drawer.open}
        progress={drawer.progress}
        dragging={drawer.dragging}
        onClose={drawer.close}
        onDrawerPointerDown={drawer.onDrawerPointerDown}
        onPointerMove={drawer.onPointerMove}
        onPointerUp={drawer.onPointerUp}
      />
    </div>
  );
}
