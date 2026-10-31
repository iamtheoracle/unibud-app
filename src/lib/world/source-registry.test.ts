import test from "node:test";
import assert from "node:assert/strict";
import {
  UNIBUD_SOURCE_REGISTRY,
  TRUSTED_NIGERIAN_EDUCATION_SOURCES,
  findRegisteredSource,
  matchesTrustedSource,
} from "./source-registry.ts";

test("registry has unique IDs and HTTPS source pages", () => {
  const ids = UNIBUD_SOURCE_REGISTRY.map((source) => source.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const source of UNIBUD_SOURCE_REGISTRY) {
    assert.equal(new URL(source.url).protocol, "https:");
    assert.ok(source.name.length > 2);
    assert.ok(source.scope.length > 0);
  }
});

test("registry spans Nigerian, African and global sources", () => {
  assert.ok(UNIBUD_SOURCE_REGISTRY.some((source) => source.country === "NG"));
  assert.ok(UNIBUD_SOURCE_REGISTRY.some((source) => source.country === "AFRICA"));
  assert.ok(UNIBUD_SOURCE_REGISTRY.some((source) => source.country === "GLOBAL"));
  assert.ok(UNIBUD_SOURCE_REGISTRY.some((source) => source.scope.includes("image-discovery")));
});

test("image discovery classification does not imply asset licence approval", () => {
  const source = UNIBUD_SOURCE_REGISTRY.find((item) => item.id === "wikimedia-commons");
  assert.ok(source);
  assert.equal(source.authority, "discovery");
  assert.match(source.notes ?? "", /each file page/i);
});

test("legacy Nigerian export remains available", () => {
  assert.ok(TRUSTED_NIGERIAN_EDUCATION_SOURCES.length >= 10);
  assert.ok(TRUSTED_NIGERIAN_EDUCATION_SOURCES.every((source) => source.country === "NG"));
});

test("domain matcher rejects lookalike hosts and insecure URLs", () => {
  const source = UNIBUD_SOURCE_REGISTRY.find((item) => item.id === "unesco");
  assert.ok(source);
  assert.equal(matchesTrustedSource("https://www.unesco.org/about", source), true);
  assert.equal(matchesTrustedSource("https://unesco.org.attacker.example/", source), false);
  assert.equal(matchesTrustedSource("http://unesco.org/", source), false);
  assert.equal(findRegisteredSource("https://uis.unesco.org/")?.id, "unesco-uis");
});
