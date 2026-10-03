export type SessionStatus = "scheduled" | "live" | "ended" | "processing" | "available";

export type BoardSession = {
  id: string;
  title: string;
  course: string;
  lecturer: string;
  lecturerHandle: string;
  department: string;
  startsAt: string;
  status: SessionStatus;
  durationMin: number;
  topic: string;
};

/** Production source: persisted course/board sessions. No synthetic classes. */
export const BOARD_SESSIONS: BoardSession[] = [];
export const SESSION_LIFECYCLE = ["scheduled", "live", "ended", "processing", "available"] as const;
