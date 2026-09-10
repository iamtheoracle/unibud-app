import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Menu, MessageCircle, UserPlus, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Contextual bottom navigation.
 *
 * Normally hidden — a small pill at the bottom invites interaction.
 * Tapping it expands a clean icon bar with the four primary destinations
 * (Square, Connect, Communities, Chat) plus a "More" button for the side menu.
 * Auto-collapses after 4s of inactivity or on route change.
 * Never permanently occupies the bottom of the screen.
 */

const DESTINATIONS = [
  { to: "/", label: "Square", icon: LayoutGrid },
  { to: "/connect", label: "Connect", icon: UserPlus },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/messages", label: "Chat", icon: MessageCircle },
] as const;

function activePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

type Props = {
  hidden: boolean;
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
  onOpenMenu: () => void;
};

export function ContextNav({ hidden, expanded, onExpandedChange, onOpenMenu }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!expanded) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onExpandedChange(false), 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [expanded, onExpandedChange]);

  useEffect(() => {
    onExpandedChange(false);
  }, [pathname, onExpandedChange]);

  if (hidden) return null;

  if (!expanded) {
    return (
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => onExpandedChange(true)}
        className="fixed left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink/90 shadow-soft backdrop-blur-sm transition-transform active:scale-95"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-1.5 px-3.5 py-2.5">
          <span className="size-1.5 rounded-full bg-paper/80" />
          <span className="size-1.5 rounded-full bg-paper/80" />
          <span className="size-1.5 rounded-full bg-paper/80" />
          <span className="size-1.5 rounded-full bg-paper/80" />
        </div>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px]"
        onClick={() => onExpandedChange(false)}
      />
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-3xl items-end justify-between rounded-t-2xl bg-background/95 px-3 pt-3 shadow-soft backdrop-blur-md">
          {DESTINATIONS.map((item) => {
            const on = activePath(pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex min-w-[4rem] flex-col items-center gap-1 pb-2 pt-1"
              >
                <Icon
                  className={cn("size-5", on ? "text-ink" : "text-muted-foreground")}
                  strokeWidth={on ? 2.25 : 1.75}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide uppercase",
                    on ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
                {on ? <span className="h-0.5 w-6 rounded-full bg-ink" /> : null}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex min-w-[4rem] flex-col items-center gap-1 pb-2 pt-1"
          >
            <Menu className="size-5 text-muted-foreground" />
            <span className="text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
