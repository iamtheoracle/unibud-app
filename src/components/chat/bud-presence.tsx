import { Link } from "@tanstack/react-router";
import { Sparkles, Wrench } from "lucide-react";

/**
 * Subtle Bud + Fixer presence inside Chat threads.
 *
 * Communicates "I'm here if you need me" without being promotional.
 * Tapping Bud opens the full Bud workspace (returns to chat on close).
 * Fixer is nearby for platform/personal issues.
 */
export function ChatBudPresence() {
  return (
    <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-2">
      <Link
        to="/bud"
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Sparkles className="size-3.5 text-bud" />
        Bud&rsquo;s here
      </Link>
      <span className="text-border">·</span>
      <Link
        to="/fixer"
        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Wrench className="size-3" />
        Fixer
      </Link>
    </div>
  );
}
