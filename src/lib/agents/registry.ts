import type { AgentDefinition, AgentId } from "./contracts";
import { rssDiscoveryProvider } from "@/lib/world/rss-discovery.server";
import { reviewEditorialCandidate, type EditorialCandidate } from "@/lib/world/editorial";

const browserProvider = rssDiscoveryProvider;

const definitions: AgentDefinition[] = [
  { id: "bud", role: "student companion", responsibility: "Own the student's visible conversation and expression.", contextScope: ["conversation", "student", "academic", "world"], memoryScope: ["conversation", "preferences", "learning"], permissions: ["respond"], collaborators: ["spark", "navigator", "scholar", "coach", "voice"] },
  { id: "spark", role: "coordinator", responsibility: "Coordinate only the specialists actually required for the request.", contextScope: ["request", "agent-state", "world-state"], memoryScope: ["task-state"], permissions: ["route", "coordinate"], collaborators: ["bud", "oracle", "scholar", "orbit", "coach", "community", "vision", "creator", "atlas", "pulse", "guardian", "voice", "navigator", "browser"] },
  { id: "oracle", role: "research and verification", responsibility: "Verify external or current facts when verification is required.", contextScope: ["web", "sources", "verification"], memoryScope: ["source-history"], permissions: ["research", "verify"], collaborators: ["spark", "scholar", "browser"], handler: async (input, context) => {
    const query = typeof input.context?.query === "string" ? input.context.query : input.prompt;
    const result = await browserProvider.discover({ requestId: context.requestId, source: "web", query, limit: typeof input.context?.limit === "number" ? input.context.limit : 15 });
    return result.ok
      ? { ok: true, summary: "Found " + result.items.length + " source lead(s). Each must be independently checked before editorial review.", data: { items: result.items, evidenceStatus: "discovery_leads_unverified" } }
      : { ok: false, error: result.error };
  } },
  { id: "scholar", role: "academic specialist", responsibility: "Work with course material, explanations, research, revision and academic reasoning.", contextScope: ["courses", "syllabus", "academic"], memoryScope: ["learning"], permissions: ["academic-read"], collaborators: ["spark", "oracle", "coach"] },
  { id: "orbit", role: "time and follow-up", responsibility: "Handle real reminders, schedules and follow-up state.", contextScope: ["tasks", "time", "notifications"], memoryScope: ["task-state"], permissions: ["schedule"], collaborators: ["spark", "coach"] },
  { id: "coach", role: "planning partner", responsibility: "Help structure study, planning and execution without taking over the student's work.", contextScope: ["planning", "learning"], memoryScope: ["goals", "progress"], permissions: ["plan"], collaborators: ["spark", "scholar", "orbit"] },
  { id: "community", role: "campus community specialist", responsibility: "Handle real campus/community context and social discovery.", contextScope: ["campus", "community", "social"], memoryScope: ["community-context"], permissions: ["community-read"], collaborators: ["spark", "pulse", "browser"] },
  { id: "vision", role: "visual specialist", responsibility: "Interpret or structure visual explanations when visual reasoning is actually needed.", contextScope: ["images", "diagrams", "visuals"], memoryScope: ["task-state"], permissions: ["vision"], collaborators: ["spark", "creator"] },
  { id: "creator", role: "creative media specialist", responsibility: "Handle real media creation workflows when a generation provider exists.", contextScope: ["media", "creation"], memoryScope: ["creative-context"], permissions: ["generate"], collaborators: ["spark", "vision", "voice"] },
  { id: "atlas", role: "continuity specialist", responsibility: "Recover relevant known context and ongoing task state.", contextScope: ["memory", "history"], memoryScope: ["conversation", "learning", "task-state"], permissions: ["memory-read"], collaborators: ["spark", "bud"] },
  { id: "pulse", role: "current activity specialist", responsibility: "Surface real current campus or discovery activity when available.", contextScope: ["current", "campus", "discovery"], memoryScope: ["activity-history"], permissions: ["current-read"], collaborators: ["spark", "oracle", "community", "browser"] },
  { id: "guardian", role: "safety specialist", responsibility: "Handle safety, abuse, scam and harmful-content concerns.", contextScope: ["safety"], memoryScope: ["safety-state"], permissions: ["safety-review"], collaborators: ["spark", "bud"] },
  { id: "voice", role: "voice specialist", responsibility: "Handle real speech recognition and synthesis when voice providers are connected.", contextScope: ["audio", "voice"], memoryScope: ["voice-preferences"], permissions: ["voice"], collaborators: ["spark", "creator"] },
  { id: "navigator", role: "UNIBUD navigator", responsibility: "Navigate students to real UNIBUD surfaces without duplicating them inside Bud.", contextScope: ["navigation", "routes"], memoryScope: ["navigation-preferences"], permissions: ["navigate"], collaborators: ["spark", "bud"] },
  { id: "editorial", role: "editorial reviewer", responsibility: "Check source provenance, freshness and image-rights metadata; never approve or publish automatically.", contextScope: ["stories", "sources", "media-rights", "publication"], memoryScope: ["review-history"], permissions: ["editorial-review"], collaborators: ["spark", "oracle", "browser", "guardian", "vision"], handler: async (input) => {
    const candidate = input.context?.candidate as EditorialCandidate | undefined;
    if (!candidate || typeof candidate !== "object") return { ok: false, error: "A structured source candidate is required." };
    const review = reviewEditorialCandidate(candidate);
    return { ok: true, summary: review.status === "pending_editorial_review" ? "Basic provenance checks passed; human editorial approval is still required." : "Candidate failed one or more provenance or rights checks.", data: { review } };
  } },
  { id: "browser", role: "browsing and discovery specialist", responsibility: "Retrieve real, permitted external or connected content for the world when a browsing provider exists; never simulate discovery.", contextScope: ["web", "social", "discovery", "integrations"], memoryScope: ["source-history", "connected-sources"], permissions: ["browse", "discover"], collaborators: ["spark", "oracle", "community", "pulse"], handler: async (input, context) => {
    const requestedSource = input.context?.source;
    const source = requestedSource === "campus" || requestedSource === "creator" ? requestedSource : "web";
    const result = await browserProvider.discover({
      requestId: context.requestId,
      source,
      query: typeof input.context?.query === "string" ? input.context.query : input.prompt,
      limit: typeof input.context?.limit === "number" ? input.context.limit : undefined,
    });
    return result.ok
      ? { ok: true, summary: "Retrieved " + result.items.length + " live discovery lead(s); claims remain unverified.", data: { items: result.items, evidenceStatus: "discovery_leads_unverified" } }
      : { ok: false, error: result.error };
  } },
];

const byId = new Map(definitions.map((definition) => [definition.id, definition]));

export function getAgentDefinition(id: AgentId): AgentDefinition {
  return byId.get(id)!;
}

export function listAgentDefinitions(): AgentDefinition[] {
  return [...definitions];
}
