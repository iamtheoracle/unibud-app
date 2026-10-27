import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/unibud/empty";
import { SignInCard, useAuthReady } from "@/components/unibud/sign-in-gate";
import { listSaves } from "@/lib/unibud/server";

export const Route = createFileRoute("/_app/saved")({ component: Saved });

function Saved() {
  const { user, isPending } = useAuthReady();
  const q = useQuery({
    queryKey: ["saves"],
    queryFn: () => listSaves(),
    enabled: Boolean(user),
  });
  if (isPending) return <div className="m-4 h-32 animate-pulse rounded-2xl bg-secondary" />;
  if (!user) {
    return (
      <main className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-medium">Saved</h1>
        <div className="mt-6">
          <SignInCard title="Keep a trail" body="Listings, posts, and Bud threads you want again." />
        </div>
      </main>
    );
  }
  return (
    <main className="px-4 pb-8 md:px-6">
      <h1 className="pt-2 text-2xl font-medium tracking-tight">Saved</h1>
      <p className="mt-1 text-sm text-muted-foreground">Videos and posts you kept. Saved audio is separate.</p>
      <div className="mt-5 space-y-2">
        {(q.data ?? []).map((s) => (
          <Link
            key={`${s.kind}-${s.item_id}`}
            to={s.href}
            className="block rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
          >
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.kind}</p>
            <p className="text-sm font-medium">{s.title}</p>
          </Link>
        ))}
      </div>
      {!q.data?.length ? (
        <EmptyState title="Nothing saved" body="Bookmark a post on Square or a listing in Market." />
      ) : null}
    </main>
  );
}
