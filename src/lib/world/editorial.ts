/**
 * UNIBUD editorial gate: discovery is not publication.
 * Candidates remain pending until a human/editorial approval step records a decision.
 */
export type EditorialMedia = {
  url: string;
  sourceUrl: string;
  creator: string;
  license: string;
  attribution: string;
};

export type EditorialCandidate = {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  sourceUrl: string;
  publishedAt: string;
  retrievedAt: string;
  author?: string;
  media?: EditorialMedia;
};

export type EditorialCheck = {
  code: "title" | "summary" | "publisher" | "source_url" | "dates" | "freshness" | "media_url" | "media_rights";
  passed: boolean;
  detail: string;
};

export type EditorialReview = {
  status: "pending_editorial_review" | "rejected";
  checks: EditorialCheck[];
  publishable: false;
};

function secureHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Deterministic provenance and rights checks; this does not certify truth. */
export function reviewEditorialCandidate(
  candidate: EditorialCandidate,
  now = new Date(),
  maxAgeDays = 30,
): EditorialReview {
  const published = Date.parse(candidate.publishedAt);
  const retrieved = Date.parse(candidate.retrievedAt);
  const ageDays = (now.getTime() - published) / 86_400_000;
  const checks: EditorialCheck[] = [
    { code: "title", passed: candidate.title.trim().length >= 8, detail: "A meaningful headline is required." },
    { code: "summary", passed: candidate.summary.trim().length >= 30, detail: "A substantive summary is required; do not invent missing details." },
    { code: "publisher", passed: candidate.publisher.trim().length >= 2, detail: "Identify the actual publisher or institution." },
    { code: "source_url", passed: secureHttpUrl(candidate.sourceUrl), detail: "A direct HTTPS source link is required." },
    { code: "dates", passed: Number.isFinite(published) && Number.isFinite(retrieved) && retrieved <= now.getTime() && published <= retrieved, detail: "Publication and retrieval timestamps must be valid and ordered." },
    { code: "freshness", passed: Number.isFinite(ageDays) && ageDays >= 0 && ageDays <= maxAgeDays, detail: `The source must be no older than ${maxAgeDays} days for this freshness policy.` },
    {
      code: "media_url",
      passed: !candidate.media || secureHttpUrl(candidate.media.url) && secureHttpUrl(candidate.media.sourceUrl),
      detail: "Images need a secure direct media URL and a source page.",
    },
    {
      code: "media_rights",
      passed: !candidate.media || Boolean(candidate.media.creator.trim() && candidate.media.license.trim() && candidate.media.attribution.trim()),
      detail: "Image creator, explicit license/permission, and attribution are required before reuse.",
    },
  ];
  return {
    status: checks.every((check) => check.passed) ? "pending_editorial_review" : "rejected",
    checks,
    publishable: false,
  };
}
