import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { mapBud, mapConversation, mapCourse, mapProfile } from "@/lib/unibud/map";
import { formatStudentContext } from "./context";
import { queryOracleLayer } from "./oracle-layer";
import { getAIProvider } from "./provider";
import { buildBudBrief, type AtlasSnap } from "./brief";
import { advanceMilestone, parseMilestone } from "./milestones";

const SYSTEM = `You are Bud. You are the only assistant the person talks to inside UNIBUD.

HOW YOU TALK
Speak like a calm, clear friend. Short sentences. Everyday words.
If you use a hard word, explain it in the next sentence.
Simple is not childish. Accurate still matters.

SHAPE OF A REPLY
1. One line: “Okay, here’s what that means.”
2. The idea in plain English.
3. One example or analogy if it actually helps (football, games, music, movies, daily life).
4. At most one useful question.
Never a wall of text. Never a dictionary dump.

FORMAT
Light markdown only. **this** becomes bold. __this__ becomes underline.
Short lists are fine. Headings should be rare and short.
Do not leave raw ** or ### sitting in the sentence.
Do not mention Spark, Oracle, Orbit, Atlas, Scholar, agents, or internal notes.

NAV
If they asked you to open a real UNIBUD place, end with one line:
NAV:/money
Only real routes: / /connect /communities /messages /riff /market /money /board /studies /watch /profile /settings /fixer /search /podcasts

ACADEMIC
Use their enrolled syllabus when they ask about a course. Do not invent topics.
If they ask what CSC 301 covers, next topic, assessments, or exam dates — answer from the syllabus block only.
If they say Practice, Assignment, Assessment, Revision, Project or Exam, treat that as the purpose.
Help them understand. Do not mint the same essay for everyone.
Lecturer podcasts and Board course materials are academic, not social audio.

MONEY
Wallet is a demo ledger. Never claim a real bank, card, or NELFUND payment happened.

WORK
Do not write assignments they should submit as their own. You may explain a concept they already tried.

You convert an internal brief into a human conversation. The person should feel understood, not managed.`;

function titleFrom(prompt: string) {
  const t = prompt.replace(/\s+/g, " ").trim();
  return t.length > 42 ? `${t.slice(0, 42).trim()}…` : t || "New conversation";
}

function generationIntent(prompt: string): "image" | "gif" | "audio" | null {
  const p = prompt.toLowerCase();
  const wants = /\b(make|create|generate|draw|show me)\b/.test(p);
  if (!wants) return null;
  if (/\bgifs?\b/.test(p)) return "gif";
  if (/\b(image|illustration|picture|photo|diagram|sketch)\b/.test(p)) return "image";
  if (/\b(audio|voice|read (this|it) (aloud|out)|podcast of)\b/.test(p)) return "audio";
  return null;
}

const inflight = new Map<string, number>();

async function backfillLegacy(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const orphans = await sql<{ id: string }>`
    select id from bud_messages
    where user_id = ${userId} and conversation_id is null
    limit 1`;
  if (!orphans.length) return;
  const id = crypto.randomUUID();
  const first = await sql<{ content: string }>`
    select content from bud_messages
    where user_id = ${userId} and conversation_id is null and role = 'user'
    order by created_at asc limit 1`;
  await sql`
    insert into bud_conversations (id, user_id, title)
    values (${id}, ${userId}, ${titleFrom(first[0]?.content ?? "Earlier conversation")})`;
  await sql`
    update bud_messages set conversation_id = ${id}
    where user_id = ${userId} and conversation_id is null`;
}

export const listBudConversations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await backfillLegacy(sql, context.userId);
    const rows = await sql<{
      id: string;
      title: string;
      updated_at: string;
      preview: string | null;
    }>`
      select c.id, c.title, c.updated_at,
        (select m.content from bud_messages m
          where m.conversation_id = c.id
          order by created_at desc limit 1) as preview
      from bud_conversations c
      where c.user_id = ${context.userId}
      order by c.updated_at desc
      limit 40`;
    return rows.map(mapConversation);
  });

export const getBudThread = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input?: { conversationId?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await backfillLegacy(sql, context.userId);
    if (data.conversationId) {
      const rows = await sql`
        select * from bud_messages
        where user_id = ${context.userId} and conversation_id = ${data.conversationId}
        order by created_at asc limit 120`;
      return rows.map((r) => mapBud(r as Parameters<typeof mapBud>[0]));
    }
    const rows = await sql`
      select * from bud_messages where user_id = ${context.userId}
      order by created_at asc limit 80`;
    return rows.map((r) => mapBud(r as Parameters<typeof mapBud>[0]));
  });

export const createBudConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into bud_conversations (id, user_id, title)
      values (${id}, ${context.userId}, ${"New conversation"})`;
    return { id, title: "New conversation", updatedAt: new Date().toISOString(), preview: "" };
  });

export const deleteBudConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from bud_messages where user_id = ${context.userId} and conversation_id = ${data.id}`;
    await sql`delete from bud_conversations where user_id = ${context.userId} and id = ${data.id}`;
    return { ok: true as const };
  });

export const retryBud = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const last = await sql<{ content: string }>`
      select content from bud_messages
      where user_id = ${context.userId} and conversation_id = ${data.conversationId} and role = 'user'
      order by created_at desc limit 1`;
    const prompt = last[0]?.content;
    if (!prompt) return { ok: false as const, error: "Nothing to retry." };
    return runAsk(sql, context.userId, prompt, data.conversationId);
  });

export const askBud = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      prompt: string;
      conversationId?: string;
      attachment?: { name: string; kind: string; excerpt?: string };
      media?: { kind: "audio" | "image" | "gif" | "file" | "voice"; mediaId?: string; src?: string; name?: string };
      fromPath?: string;
      atlas?: AtlasSnap;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const prompt =
      data.prompt.trim() ||
      (data.media?.kind === "voice"
        ? "Voice note"
        : data.media
          ? `Sent ${data.media.kind}`
          : "");
    if (!prompt && !data.media) return { ok: false as const, error: "Say something first." };
    const sql = await getSql();
    let conversationId = data.conversationId;
    if (!conversationId) {
      conversationId = crypto.randomUUID();
      await sql`
        insert into bud_conversations (id, user_id, title)
        values (${conversationId}, ${context.userId}, ${titleFrom(prompt)})`;
    }
    const attached = data.attachment
      ? `\n\n[Attached: ${data.attachment.name} (${data.attachment.kind})${data.attachment.excerpt ? `\n${data.attachment.excerpt}` : ""}]`
      : "";
    return runAsk(sql, context.userId, prompt + attached, conversationId, titleFrom(prompt), {
      fromPath: data.fromPath,
      atlas: data.atlas,
      media: data.media,
    });
  });

async function runAsk(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  prompt: string,
  conversationId: string,
  title?: string,
  extra?: { fromPath?: string; atlas?: AtlasSnap; media?: { kind: "audio" | "image" | "gif" | "file" | "voice"; mediaId?: string; src?: string; name?: string } },
): Promise<{ ok: true; text: string; conversationId: string } | { ok: false; error: string; conversationId: string }> {
  const dupKey = `${userId}:${conversationId}:${prompt.slice(0, 80)}`;
  const now = Date.now();
  const last = inflight.get(dupKey) ?? 0;
  if (now - last < 2500) {
    return { ok: false as const, error: "Give Bud a second — that just went out.", conversationId };
  }
  inflight.set(dupKey, now);

  const mediaJson = extra?.media ? JSON.stringify({ ...extra.media, status: "ready" }) : null;
  try {
    await sql`insert into bud_messages (id, user_id, role, content, conversation_id, media_json)
      values (${crypto.randomUUID()}, ${userId}, ${"user"}, ${prompt}, ${conversationId}, ${mediaJson})`;
  } catch {
    await sql`insert into bud_messages (id, user_id, role, content, conversation_id)
      values (${crypto.randomUUID()}, ${userId}, ${"user"}, ${prompt}, ${conversationId})`;
  }
  if (title) {
    await sql`update bud_conversations set title = ${title}, updated_at = now()
      where id = ${conversationId} and user_id = ${userId} and title = 'New conversation'`;
  } else {
    await sql`update bud_conversations set updated_at = now()
      where id = ${conversationId} and user_id = ${userId}`;
  }

  const history = (
    await sql`select role, content from bud_messages
      where user_id = ${userId} and conversation_id = ${conversationId}
      order by created_at desc limit 12`
  )
    .reverse()
    .map((r) => ({ role: r.role as "user" | "assistant", content: String(r.content) }));

  const profileRows = await sql`select * from student_profiles where user_id = ${userId} limit 1`;
  const courseRows = await sql`select * from courses where user_id = ${userId}`;
  const courses = courseRows.map((r) => mapCourse(r as Parameters<typeof mapCourse>[0]));
  let enrolledCodes: string[] = [];
  try {
    const en = await sql<{ course_code: string }>`select course_code from enrollments where user_id = ${userId}`;
    enrolledCodes = en.map((r) => r.course_code);
  } catch {
    enrolledCodes = [];
  }
  const profile = profileRows[0] ? mapProfile(profileRows[0] as Parameters<typeof mapProfile>[0]) : null;
  const contextLine = formatStudentContext(profile, courses, enrolledCodes, prompt);

  let milestoneJson: string | null = null;
  try {
    const mileRows = await sql<{ milestone_json?: string | null }>`
      select milestone_json from bud_conversations
      where id = ${conversationId} and user_id = ${userId} limit 1`;
    milestoneJson = mileRows[0]?.milestone_json ?? null;
  } catch {
    milestoneJson = null;
  }
  const milestone = advanceMilestone(parseMilestone(milestoneJson), prompt);
  try {
    await sql`update bud_conversations set milestone_json = ${JSON.stringify(milestone)}
      where id = ${conversationId} and user_id = ${userId}`;
  } catch {
    /* column may not exist until migrate; Bud still replies */
  }

  const brief = buildBudBrief({
    prompt,
    milestone,
    atlas: extra?.atlas,
    fromPath: extra?.fromPath,
  });
  const oracle = await queryOracleLayer({ query: prompt, studentId: userId });
  const oracleLine = oracle
    ? `Internal verify note (do not name the source): ${oracle.summary}`
    : null;

  const provider = getAIProvider();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22_000);
  const result = await provider.complete(
    [
      { role: "system", content: SYSTEM },
      { role: "system", content: contextLine },
      { role: "system", content: brief },
      ...(oracleLine ? [{ role: "system" as const, content: oracleLine }] : []),
      ...history,
    ],
    { maxTokens: 500, signal: controller.signal },
  );
  clearTimeout(timer);

  const text = result.ok ? result.text : result.error;
  const intent = generationIntent(prompt);
  let assistantMedia: string | null = null;
  if (intent) {
    assistantMedia = JSON.stringify({
      kind: intent,
      status: "failed",
      name: intent,
    });
  }
  const reply = intent
    ? `${text}\n\nCouldn’t generate the ${intent} here — generation isn’t connected in this environment. Stay in this chat and try again later.`
    : text;
  try {
    await sql`insert into bud_messages (id, user_id, role, content, conversation_id, media_json)
      values (${crypto.randomUUID()}, ${userId}, ${"assistant"}, ${reply}, ${conversationId}, ${assistantMedia})`;
  } catch {
    await sql`insert into bud_messages (id, user_id, role, content, conversation_id)
      values (${crypto.randomUUID()}, ${userId}, ${"assistant"}, ${reply}, ${conversationId})`;
  }
  if (!result.ok) return { ok: false as const, error: result.error, conversationId };
  return { ok: true as const, text: reply, conversationId };
}
