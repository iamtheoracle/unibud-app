import type { AgentDefinition, AgentId } from "./contracts";

const definitions: AgentDefinition[] = [
  { id: "bud", role: "student companion", responsibility: "Own the student's visible conversation and expression.", contextScope: ["conversation", "student", "academic"], memoryScope: ["conversation", "preferences", "learning"], permissions: ["respond"], collaborators: ["spark", "navigator", "scholar", "coach", "voice"] },
  { id: "spark", role: "coordinator", responsibility: "Coordinate only the specialists actually required for the request.", contextScope: ["request", "agent-state"], memoryScope: ["task-state"], permissions: ["route", "coordinate"], collaborators: ["bud", "oracle", "scholar", "orbit", "coach", "community", "vision", "creator", "atlas", "pulse", "guardian", "voice", "navigator"] },
  { id: "oracle", role: "research and verification", responsibility: "Verify external or current facts when verification is required.", contextScope: ["web", "sources", "verification"], memoryScope: ["source-history"], permissions: ["research", "verify"], collaborators: ["spark", "scholar"] },
  { id: "scholar", role: "academic specialist", responsibility: "Work with course material, explanations, research, revision and academic reasoning.", contextScope: ["courses", "syllabus", "academic"], memoryScope: ["learning"], permissions: ["academic-read"], collaborators: ["spark", "oracle", "coach"] },
  { id: "orbit", role: "time and follow-up", responsibility: "Handle real reminders, schedules and follow-up state.", contextScope: ["tasks", "time", "notifications"], memoryScope: ["task-state"], permissions: ["schedule"], collaborators: ["spark", "coach"] },
  { id: "coach", role: "planning partner", responsibility: "Help structure study, planning and execution without taking over the student's work.", contextScope: ["planning", "learning"], memoryScope: ["goals", "progress"], permissions: ["plan"], collaborators: ["spark", "scholar", "orbit"] },
  { id: "community", role: "campus community specialist", responsibility: "Handle real campus/community context and social discovery.", contextScope: ["campus", "community"], memoryScope: ["community-context"], permissions: ["community-read"], collaborators: ["spark", "pulse"] },
  { id: "vision", role: "visual specialist", responsibility: "Interpret or structure visual explanations when visual reasoning is actually needed.", contextScope: ["images", "diagrams", "visuals"], memoryScope: ["task-state"], permissions: ["vision"], collaborators: ["spark", "creator"] },
  { id: "creator", role: "creative media specialist", responsibility: "Handle real media creation workflows when a generation provider exists.", contextScope: ["media", "creation"], memoryScope: ["creative-context"], permissions: ["generate"], collaborators: ["spark", "vision", "voice"] },
  { id: "atlas", role: "continuity specialist", responsibility: "Recover relevant known context and ongoing task state.", contextScope: ["memory", "history"], memoryScope: ["conversation", "learning", "task-state"], permissions: ["memory-read"], collaborators: ["spark", "bud"] },
  { id: "pulse", role: "current activity specialist", responsibility: "Surface real current campus or discovery activity when available.", contextScope: ["current", "campus", "discovery"], memoryScope: ["activity-history"], permissions: ["current-read"], collaborators: ["spark", "oracle", "community"] },
  { id: "guardian", role: "safety specialist", responsibility: "Handle safety, abuse, scam and harmful-content concerns.", contextScope: ["safety"], memoryScope: ["safety-state"], permissions: ["safety-review"], collaborators: ["spark", "bud"] },
  { id: "voice", role: "voice specialist", responsibility: "Handle real speech recognition and synthesis when voice providers are connected.", contextScope: ["audio", "voice"], memoryScope: ["voice-preferences"], permissions: ["voice"], collaborators: ["spark", "creator"] },
  { id: "navigator", role: "UNIBUD navigator", responsibility: "Navigate students to real UNIBUD surfaces without duplicating them inside Bud.", contextScope: ["navigation", "routes"], memoryScope: ["navigation-preferences"], permissions: ["navigate"], collaborators: ["spark", "bud"] },
];

const byId = new Map(definitions.map((definition) => [definition.id, definition]));

export function getAgentDefinition(id: AgentId): AgentDefinition {
  return byId.get(id)!;
}

export function listAgentDefinitions(): AgentDefinition[] {
  return [...definitions];
}
