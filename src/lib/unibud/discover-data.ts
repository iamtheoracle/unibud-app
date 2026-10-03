/** Discovery contracts. Production items come from connected sources or persisted user/community data. */

export type Challenge = {
  id: string;
  title: string;
  body: string;
  topic: string;
  joins: number;
};

export type GlobalClip = {
  id: string;
  title: string;
  interest: string;
  src: string;
  authorHandle: string;
};

export const GLOBAL_FACTS: readonly {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  topic: string;
  image?: string;
}[] = [];

export const CHALLENGES: Challenge[] = [];
export const GLOBAL_CLIPS: GlobalClip[] = [];
