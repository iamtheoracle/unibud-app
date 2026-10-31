import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EDUCATIONAL_NEWS } from "@/lib/unibud/news-data";
import { relativeTime } from "@/lib/unibud/format";
import { cn } from "@/lib/utils";
import { TRUSTED_NIGERIAN_EDUCATION_SOURCES } from "@/lib/world/source-registry";

export const Route = createFileRoute("/_app/news")({ component: News });

const CATS = ["all", "exams", "scholarship", "admission", "deadline", "campus", "opportunity"] as const;

function News() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("all");
  const items = EDUCATIONAL_NEWS.filter((n) => cat === "all" || n.category === cat);

  return (
    <main className="safe-bottom px-5 pt-6">
      <p className="kicker">Academic information</p>
      <h1 className="mt-1 font-display text-4xl">Educational News</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Source-checked campus and academic updates. Every notice needs a real source and editorial approval.
      </p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "h-9 shrink-0 rounded-full px-4 text-sm capitalize",
              cat === c ? "bg-ink text-paper" : "bg-card text-muted-foreground ring-1 ring-border",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-border p-6">
          <p className="text-base font-semibold">No verified updates yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We will show a notice here only after its original source, date and details have been checked.
            Unverified forwards and rumours stay out.
          </p>
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Official source directory</p>
            <ul className="mt-3 space-y-3">
              {TRUSTED_NIGERIAN_EDUCATION_SOURCES.slice(0, 6).map((source) => (
                <li key={source.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{source.name}</p>
                    <p className="text-xs text-muted-foreground">{source.scope.slice(0, 2).join(" · ")}</p>
                  </div>
                  <a className="shrink-0 text-xs font-medium underline" href={source.url} target="_blank" rel="noreferrer">Official site</a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <ul className="mt-5 space-y-3">
        {items.map((n) => (
          <li key={n.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase">
              <span className="text-bud">{n.category}</span>
              {n.importance === "high" ? <span className="text-destructive">Important</span> : null}
            </div>
            <h2 className="mt-1 font-medium">{n.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{n.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {n.publisher} · {n.institution} · {n.audience} · {relativeTime(n.publishedAt)}
            </p>
            <a className="mt-2 inline-block text-xs font-medium underline" href={n.sourceUrl} target="_blank" rel="noreferrer">
              Open original source
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
