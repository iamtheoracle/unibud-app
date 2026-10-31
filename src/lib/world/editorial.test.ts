import test from "node:test";
import assert from "node:assert/strict";
import { reviewEditorialCandidate, type EditorialCandidate } from "./editorial.ts";

const now = new Date("2026-10-31T12:00:00.000Z");
const valid: EditorialCandidate = {
  id: "candidate-1",
  title: "University publishes updated examination timetable",
  summary: "The registrar has published a revised examination timetable for enrolled students.",
  publisher: "University Registrar",
  sourceUrl: "https://university.example.edu/registrar/exams",
  publishedAt: "2026-10-30T09:00:00.000Z",
  retrievedAt: "2026-10-31T10:00:00.000Z",
};

test("valid source-backed candidate remains pending human approval", () => {
  const result = reviewEditorialCandidate(valid, now);
  assert.equal(result.status, "pending_editorial_review");
  assert.equal(result.publishable, false);
  assert.ok(result.checks.every((check) => check.passed));
});

test("rejects non-HTTPS or malformed source URLs", () => {
  const result = reviewEditorialCandidate({ ...valid, sourceUrl: "http://university.example.edu/news" }, now);
  assert.equal(result.status, "rejected");
  assert.equal(result.checks.find((check) => check.code === "source_url")?.passed, false);
});

test("rejects future publication dates and retrieval dates", () => {
  const result = reviewEditorialCandidate({
    ...valid,
    publishedAt: "2026-11-01T09:00:00.000Z",
    retrievedAt: "2026-11-02T09:00:00.000Z",
  }, now);
  assert.equal(result.status, "rejected");
  assert.equal(result.checks.find((check) => check.code === "dates")?.passed, false);
});

test("rejects stale updates beyond the freshness window", () => {
  const result = reviewEditorialCandidate({ ...valid, publishedAt: "2026-09-01T09:00:00.000Z" }, now);
  assert.equal(result.checks.find((check) => check.code === "freshness")?.passed, false);
});

test("rejects images without creator, license and attribution", () => {
  const result = reviewEditorialCandidate({
    ...valid,
    media: {
      url: "https://cdn.example.edu/image.jpg",
      sourceUrl: "https://university.example.edu/image",
      creator: "",
      license: "",
      attribution: "",
    },
  }, now);
  assert.equal(result.checks.find((check) => check.code === "media_rights")?.passed, false);
  assert.equal(result.publishable, false);
});

test("malformed untrusted candidate data is rejected without throwing", () => {
  const malformed = { title: null, summary: 12, publisher: {}, sourceUrl: "javascript:alert(1)" } as unknown as EditorialCandidate;
  const result = reviewEditorialCandidate(malformed, now);
  assert.equal(result.status, "rejected");
  assert.equal(result.publishable, false);
});
