import type { EditorialCandidate } from "@/lib/world/editorial";

/**
 * No seeded/current notices. Educational News is populated only by real,
 * source-backed candidates that pass editorial review and receive approval.
 */
export type NewsItem = EditorialCandidate & {
  category: "exams" | "scholarship" | "admission" | "deadline" | "campus" | "opportunity";
  institution: string;
  importance: "normal" | "high";
  audience: string;
  verifiedBy?: string;
  approvedAt?: string;
};

export const EDUCATIONAL_NEWS: NewsItem[] = [];
