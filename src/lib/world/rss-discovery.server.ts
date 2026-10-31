import { normalizeDiscoveredContent, type BrowsingProvider, type BrowsingRequest, type DiscoveredContent } from "./browsing";

const GOOGLE_NEWS_RSS = "https://news.google.com/rss/search";

/** XML text decoder for the limited RSS fields consumed below. */
function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function tag(item: string, name: string): string {
  const match = new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + name + ">", "i").exec(item);
  return match ? decodeXml(match[1].trim()) : "";
}

function safeLink(value: string): string | undefined {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function parseRss(xml: string, source: BrowsingRequest["source"]): DiscoveredContent[] {
  const items = xml.match(/<item(?:\\s[^>]*)?>[\\s\\S]*?<\\/item>/gi) ?? [];
  return items.map((item, index) => {
    const sourceUrl = safeLink(tag(item, "link"));
    const title = tag(item, "title");
    const published = tag(item, "pubDate");
    const publisher = tag(item, "source") || "Google News indexed publisher";
    if (!sourceUrl || !title) return null;
    return {
      id: `gnews-${Buffer.from(sourceUrl).toString("base64url").slice(0, 32)}-${index}`,
      source,
      title,
      text: "",
      sourceUrl,
      publishedAt: Number.isFinite(Date.parse(published)) ? new Date(published).toISOString() : undefined,
      authorName: publisher,
    };
  }).filter((item): item is DiscoveredContent => item !== null);
}

/**
 * Real RSS discovery through Google News' public RSS endpoint.
 * Search results are leads, not verified reporting; reviewers must open the
 * original publisher and record canonical source evidence before approval.
 */
export const rssDiscoveryProvider: BrowsingProvider = {
  async discover(request) {
    const query = (request.query ?? "").trim();
    if (query.length < 3) return { ok: false, items: [], source: request.source, error: "Enter at least three characters to search." };
    const limit = Math.min(Math.max(Math.floor(request.limit ?? 15), 1), 30);
    const url = new URL(GOOGLE_NEWS_RSS);
    url.searchParams.set("q", query);
    url.searchParams.set("hl", "en");
    url.searchParams.set("gl", "NG");
    url.searchParams.set("ceid", "NG:en");

    try {
      const response = await fetch(url, {
        headers: { "Accept": "application/rss+xml, application/xml, text/xml", "User-Agent": "UNIBUD-SourceDiscovery/1.0" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) return { ok: false, items: [], source: request.source, error: `Discovery provider returned HTTP ${response.status}.` };
      const type = response.headers.get("content-type") ?? "";
      if (!/xml|rss|text\\//i.test(type)) return { ok: false, items: [], source: request.source, error: "Discovery provider returned an unexpected content type." };
      const xml = await response.text();
      if (xml.length > 1_500_000) return { ok: false, items: [], source: request.source, error: "Discovery response exceeded the size limit." };
      const items = normalizeDiscoveredContent(request.source, parseRss(xml, request.source)).slice(0, limit);
      return { ok: true, items, source: request.source };
    } catch {
      return { ok: false, items: [], source: request.source, error: "Live source discovery is temporarily unavailable." };
    }
  },
};
