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

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function secureHttpUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
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
  const publishedAt = textValue(candidate?.publishedAt);
  const retrievedAt = textValue(candidate?.retrievedAt);
  const published = Date.parse(publishedAt);
  const retrieved = Date.parse(retrievedAt);
  const ageDays = (now.getTime() - published) / 86_400_000;
  const media = candidate?.media;
  const hasMedia = Boolean(media);
  const checks: EditorialCheck[] = [
    { code: "title", passed: textValue(candidate?.title).length >= 8, detail: "A meaningful headline is required." },
    { code: "summary", passed: textValue(candidate?.summary).length >= 30, detail: "A substantive summary is required; do not invent missing details." },
    { code: "publisher", passed: textValue(candidate?.publisher).length >= 2, detail: "Identify the actual publisher or institution." },
    { code: "source_url", passed: secureHttpUrl(candidate?.sourceUrl), detail: "A direct HTTPS source link is required." },
    { code: "dates", passed: Number.isFinite(published) && Number.isFinite(retrieved) && retrieved <= now.getTime() && published <= retrieved, detail: "Publication and retrieval timestamps must be valid and ordered." },
    { code: "freshness", passed: Number.isFinite(ageDays) && ageDays >= 0 && ageDays <= maxAgeDays, detail: `The source must be no older than ${maxAgeDays} days for this freshness policy.` },
    {
      code: "media_url",
      passed: !hasMedia || secureHttpUrl(media?.url) && secureHttpUrl(media?.sourceUrl),
      detail: "Images need a secure direct media URL and a source page.",
    },
    {
      code: "media_rights",
      passed: !hasMedia || Boolean(textValue(media?.creator) && textValue(media?.license) && textValue(media?.attribution)),
      detail: "Image creator, explicit license/permission, and attribution are required before reuse.",
    },
  ];
  return {
    status: checks.every((check) => check.passed) ? "pending_editorial_review" : "rejected",
    checks,
    publishable: false,
  };
}
