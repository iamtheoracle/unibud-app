import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { discoverStoryCandidates, listEditorialQueue, recordEditorialDecision } from "@/lib/world/editorial-workspace.server";

type Candidate = {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  source_url: string;
  published_at: string | null;
  retrieved_at: string;
  editorial_status: string;
  evidence: unknown;
};

export const Route = createFileRoute("/_app/editorial")({ component: EditorialWorkspace });

function EditorialWorkspace() {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [items, setItems] = useState<Candidate[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const result = await listEditorialQueue();
    setItems(result as Candidate[]);
  }, []);

  useEffect(() => {
    void refresh().catch(() => setMessage("Editorial reviewer access is required to open this workspace."));
  }, [refresh]);

  async function discover() {
    if (query.trim().length < 3) {
      setMessage("Enter at least three characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await discoverStoryCandidates({ data: { query: query.trim(), limit: 20 } });
      setMessage(result.ok ? "Discovered " + result.discovered + " source leads; saved " + result.saved.length + " new candidates. All remain pending." : result.error);
      await refresh();
    } catch {
      setMessage("Discovery failed or reviewer access is missing. No story was published.");
    } finally {
      setBusy(false);
    }
  }

  async function decide(candidateId: string, action: "approved" | "rejected" | "changes_requested") {
    const reviewNote = (note[candidateId] ?? "").trim();
    if (reviewNote.length < 8) {
      setMessage("Add a review note of at least eight characters before recording a decision.");
      return;
    }
    setBusy(true);
    try {
      const result = await recordEditorialDecision({ data: { candidateId, action, note: reviewNote, summary: summaries[candidateId] ?? "" } });
      setMessage("Decision recorded: " + result.status + ". Publishing remains a separate, disabled step.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record the decision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="safe-bottom mx-auto max-w-4xl px-5 pt-6">
      <p className="kicker">Editorial operations</p>
      <h1 className="mt-1 font-display text-4xl">Story Review</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Discover source leads, inspect original reporting, record evidence and require a human decision.
        Approval here does not publish a story.
      </p>

      <section className="mt-6 rounded-3xl border border-border bg-card p-4">
        <h2 className="font-semibold">Find source leads</h2>
        <p className="mt-1 text-xs text-muted-foreground">Live Google News RSS discovery. Results are leads only, not verified claims.</p>
        <div className="mt-3 flex gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Nigerian university scholarships" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          <button disabled={busy} onClick={() => void discover()} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">Discover</button>
        </div>
      </section>

      {message ? <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-sm">{message}</p> : null}

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pending review</h2>
        <button onClick={() => void refresh()} className="text-sm underline">Refresh</button>
      </div>

      {items.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          No candidates are waiting for review. Discover source leads to begin.
        </div>
      ) : (
        <ul className="mt-3 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-1">{item.editorial_status}</span>
                <span>{item.publisher}</span>
                <span>·</span>
                <span>Retrieved {new Date(item.retrieved_at).toLocaleString()}</span>
              </div>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              {item.summary ? <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p> : null}
              <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block break-all text-sm underline">Open original source</a>
              <p className="mt-2 text-xs text-muted-foreground">Verify the original article, publication date, key claims, relevance and any media licence before deciding.</p>
              <label className="mt-3 block text-xs font-semibold">Editor-checked summary</label>
              <textarea value={summaries[item.id] ?? item.summary ?? ""} onChange={(event) => setSummaries((old) => ({ ...old, [item.id]: event.target.value }))} placeholder="Write a factual summary based on the original publisher page…" rows={3} className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" />
              <label className="mt-3 block text-xs font-semibold">Decision note</label>
              <textarea value={note[item.id] ?? ""} onChange={(event) => setNote((old) => ({ ...old, [item.id]: event.target.value }))} placeholder="Evidence checked, corrections needed, or reason for rejection…" rows={3} className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button disabled={busy} onClick={() => void decide(item.id, "approved")} className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-paper disabled:opacity-50">Approve for publication queue</button>
                <button disabled={busy} onClick={() => void decide(item.id, "changes_requested")} className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50">Request changes</button>
                <button disabled={busy} onClick={() => void decide(item.id, "rejected")} className="rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
