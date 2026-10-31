import test from "node:test";
import assert from "node:assert/strict";
import { parseRss } from "./rss-discovery.server.ts";

test("parses RSS source leads while preserving publisher and timestamp", () => {
  const xml = `<?xml version="1.0"?><rss><channel><item><title>University announces new scholarship</title><link>https://publisher.example/news/award</link><pubDate>Sat, 31 Oct 2026 10:00:00 GMT</pubDate><source>Publisher Daily</source></item></channel></rss>`;
  const items = parseRss(xml, "web");
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "University announces new scholarship");
  assert.equal(items[0].sourceUrl, "https://publisher.example/news/award");
  assert.equal(items[0].authorName, "Publisher Daily");
  assert.equal(items[0].publishedAt, "2026-10-31T10:00:00.000Z");
});

test("ignores malformed or insecure RSS links", () => {
  const xml = `<rss><item><title>Bad link story</title><link>javascript:alert(1)</link></item><item><title>Missing link</title></item></rss>`;
  assert.deepEqual(parseRss(xml, "web"), []);
});

test("decodes RSS entities and CDATA without treating snippet as verified evidence", () => {
  const xml = `<rss><item><title><![CDATA[Research &amp; student life]]></title><link>https://example.org/story</link><description>Short snippet</description></item></rss>`;
  const items = parseRss(xml, "web");
  assert.equal(items[0].title, "Research & student life");
  assert.equal(items[0].text, "");
});
