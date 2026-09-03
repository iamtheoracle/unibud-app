/**
 * Spark is the hidden coordinator behind Bud.
 * Never imported from shell, nav, or student-facing copy.
 * Specialists stay internal; only required ones run.
 * Orbit is internal context, not an invoked specialist.
 */
import { inferMode, modeHint, type BudMode } from "./modes";

export type SpecialistId =
  | "scholar"
  | "campus"
  | "coach"
  | "community"
  | "guardian"
  | "creator"
  | "vision"
  | "atlas"
  | "pulse"
  | "voice"
  | "navigator";

const MODE_ROUTE: Record<BudMode, SpecialistId[]> = {
  academic: ["scholar"],
  research: ["scholar"],
  writing: ["scholar", "coach"],
  planning: ["coach"],
  campus: ["campus"],
  general: [],
};

export function routeSpecialists(prompt: string): SpecialistId[] {
  const mode = inferMode(prompt);
  const extra: SpecialistId[] = [];
  const p = prompt.toLowerCase();
  if (/\b(community|group chat|class group|study group|the gist|five-a-side|afrobeats)\b/.test(p)) {
    extra.push("community");
  }
  if (/\b(harass|threat|report|unsafe|scam|bully)\b/.test(p)) extra.push("guardian");
  if (/\b(reel|clip|create|shoot|edit|post this)\b/.test(p)) extra.push("creator");
  if (/\b(diagram|visual|picture this|draw|show me how it looks|explain)\b/.test(p)) extra.push("vision");
  if (/\b(remember|last time|we were|progress|where did we|map|which gate)\b/.test(p)) extra.push("atlas");
  if (/\b(trending|on the boil|what.?s happening|gist right now|discover)\b/.test(p)) extra.push("pulse");
  if (/\b(podcast|listen|audio|voice note|read (it|this) (out|aloud))\b/.test(p)) extra.push("voice");
  if (/\b(where in unibud|how do i find|take me to|which tab|open |go to |show my )\b/.test(p)) {
    extra.push("navigator");
  }
  const base = MODE_ROUTE[mode];
  const seen = new Set<SpecialistId>();
  const out: SpecialistId[] = [];
  for (const id of [...base, ...extra]) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function sparkSystemNotes(prompt: string): string[] {
  const mode = inferMode(prompt);
  const specialists = routeSpecialists(prompt);
  const notes = [modeHint(mode)];
  if (specialists.includes("guardian")) {
    notes.push("Safety: de-escalate, do not assist harm, point to Help if needed.");
  }
  if (specialists.includes("community")) {
    notes.push("Point to Communities, Riff, or Chat. Do not invent a group that does not exist.");
  }
  if (specialists.includes("navigator")) {
    notes.push(
      "Point to existing UNIBUD surfaces only: Square, Connect, Communities, Chat, Riff, Board, Studies, Watch, Profile, Bud.",
    );
  }
  if (specialists.includes("pulse")) {
    notes.push("Talk about what is currently moving on campus. Do not dump a location feed.");
  }
  if (specialists.includes("atlas")) {
    notes.push("Use what they already know. Do not restart from zero. Place is context, not the whole answer.");
  }
  return notes;
}
