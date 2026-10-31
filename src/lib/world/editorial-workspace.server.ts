import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { reviewEditorialCandidate, type EditorialCandidate } from "./editorial";

async function requireEditor(userId: string) {
  const sql = await getSql();
  const rows = await sql`select user_id from editorial_reviewers where user_id = ${userId} and active = true limit 1`;
  if (!rows[0]) throw new Error("Editorial reviewer access required.");
  return sql;
}

export const discoverStoryCandidates = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { query: string; limit?: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await requireEditor(context.userId);
    const { rssDiscoveryProvider } = await import("./rss-discovery.server");
    const result = await rssDiscoveryProvider.discover({
      requestId: crypto.randomUUID(),
      source: "web",
      query: data.query,
      limit: data.limit ?? 15,
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    const saved = [];
    for (const item of result.items) {
      const id = crypto.randomUUID();
      const publishedAt = item.publishedAt ?? null;
      const title = item.title ?? "";
      const publisher = item.authorName ?? "Publisher not yet confirmed";
      const rows = await sql`insert into story_candidates
        (id, submitted_by, title, summary, publisher, source_url, published_at, retrieved_at, editorial_status, freshness_expires_at, evidence)
        values (${id}, ${context.userId}, ${title}, ${item.text ?? ""}, ${publisher}, ${item.sourceUrl}, ${publishedAt}, now(), 'pending', ${publishedAt ? new Date(new Date(publishedAt).getTime() + 30 * 86400000).toISOString() : null}, ${JSON.stringify([{ type: "discovery", provider: "Google News RSS", retrievedAt: new Date().toISOString(), status: "unverified" }])}::jsonb)
        on conflict (source_url) do nothing returning id, title, publisher, source_url, published_at, editorial_status`;
      if (rows[0]) saved.push(rows[0]);
    }
    return { ok: true as const, discovered: result.items.length, saved };
  });

export const listEditorialQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await requireEditor(context.userId);
    const rows = await sql`select id, title, summary, publisher, author, source_url, published_at, retrieved_at, category, country_code, institution, evidence, media, editorial_status, freshness_expires_at, created_at
      from story_candidates where editorial_status in ('pending','changes_requested')
      order by created_at desc limit 100`;
    return rows;
  });

export const recordEditorialDecision = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { candidateId: string; action: "approved" | "rejected" | "changes_requested" | "withdrawn"; note: string; title?: string; summary?: string; publisher?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await requireEditor(context.userId);
    if (data.note.trim().length < 8) throw new Error("Add a review note explaining the decision.");
    if (data.title !== undefined || data.summary !== undefined || data.publisher !== undefined) {
      await sql`update story_candidates set title = ${data.title ?? ""}, summary = ${data.summary ?? ""}, publisher = ${data.publisher ?? "Publisher not confirmed"}, updated_at = now() where id = ${data.candidateId}`;
    }
    const rows = await sql`select * from story_candidates where id = ${data.candidateId} limit 1`;
    const row = rows[0];
    if (!row) throw new Error("Story candidate not found.");
    const candidate: EditorialCandidate = {
      id: String(row.id),
      title: String(row.title),
      summary: String(row.summary ?? ""),
      publisher: String(row.publisher ?? ""),
      sourceUrl: String(row.source_url),
      publishedAt: row.published_at ? new Date(String(row.published_at)).toISOString() : "",
      retrievedAt: new Date(String(row.retrieved_at)).toISOString(),
      author: row.author ? String(row.author) : undefined,
      media: row.media ? (typeof row.media === "string" ? JSON.parse(row.media) : row.media) : undefined,
    };
    const review = reviewEditorialCandidate(candidate);
    if (data.action === "approved" && (review.status !== "pending_editorial_review" || !review.checks.every((check) => check.passed))) {
      throw new Error("This candidate has failed required checks. Fix the evidence and request a new review.");
    }
    await sql`update story_candidates set editorial_status = ${data.action}, reviewed_by = ${context.userId}, reviewed_at = now(), review_note = ${data.note.trim()}, updated_at = now() where id = ${data.candidateId}`;
    await sql`insert into story_review_events (id, candidate_id, reviewer_id, action, note, checks)
      values (${crypto.randomUUID()}, ${data.candidateId}, ${context.userId}, ${data.action}, ${data.note.trim()}, ${JSON.stringify(review.checks)}::jsonb)`;
    return { ok: true, status: data.action, publishable: false };
  });
