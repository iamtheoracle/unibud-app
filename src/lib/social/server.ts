import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { mapConvo, mapMessage } from "@/lib/unibud/map";
import { PEOPLE } from "@/lib/unibud/catalog";
import { notify } from "@/lib/unibud/server";

async function loadConversation(userId: string, id: string) {
  const sql = await getSql();
  const convos = await sql`select * from conversations where id = ${id} and user_id = ${userId} limit 1`;
  if (!convos[0]) return null;
  const messages = (
    await sql`select * from messages where conversation_id = ${id} and user_id = ${userId} order by created_at asc`
  ).map((r) => mapMessage(r as Parameters<typeof mapMessage>[0]));
  return { conversation: mapConvo(convos[0] as Parameters<typeof mapConvo>[0]), messages };
}

export const listConversations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`select * from conversations where user_id = ${context.userId} order by updated_at desc`;
    return rows.map((r) => mapConvo(r as Parameters<typeof mapConvo>[0]));
  });

export const getConversation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => loadConversation(context.userId, id));

export const openConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { handle: string; listingId?: string; seed?: string }) => input)
  .handler(async ({ context, data }) => {
    const handle = data.handle.replace(/^@/, "").trim().toLowerCase();
    const sql = await getSql();
    const existing = await sql`select * from conversations where user_id = ${context.userId} and peer_handle = ${handle} limit 1`;
    if (existing[0]) return mapConvo(existing[0] as Parameters<typeof mapConvo>[0]);
    const id = crypto.randomUUID();
    const seed = data.seed || `Hi — I saw your listing on UNIBUD.`;
    await sql`insert into conversations (id, user_id, peer_handle, listing_id, last_body)
      values (${id}, ${context.userId}, ${handle}, ${data.listingId ?? null}, ${seed})`;
    await sql`insert into messages (id, conversation_id, user_id, sender, body)
      values (${crypto.randomUUID()}, ${id}, ${context.userId}, ${"me"}, ${seed})`;
    const person = PEOPLE.find((p) => p.handle === handle);
    const reply = person
      ? `Hey, this is ${person.name.split(" ")[0]}. Happy to talk — keep payments inside UNIBUD demo so we both have a record.`
      : "Got it. Let’s keep this on UNIBUD.";
    await sql`insert into messages (id, conversation_id, user_id, sender, body)
      values (${crypto.randomUUID()}, ${id}, ${context.userId}, ${"peer"}, ${reply})`;
    await sql`update conversations set last_body = ${reply}, updated_at = now() where id = ${id} and user_id = ${context.userId}`;
    await notify(context.userId, "message", `Chat with @${handle}`, reply, `/messages/${id}`);
    const rows = await sql`select * from conversations where id = ${id} and user_id = ${context.userId}`;
    return mapConvo(rows[0] as Parameters<typeof mapConvo>[0]);
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string; body: string; mediaId?: string; shareKind?: string; shareJson?: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim();
    if (!body && !data.mediaId && !data.shareJson) throw new Error("Message is empty");
    const sql = await getSql();
    const convos = await sql`select * from conversations where id = ${data.conversationId} and user_id = ${context.userId} limit 1`;
    if (!convos[0]) throw new Error("Conversation not found");
    const preview = body || data.shareKind || "Media";
    await sql`insert into messages (id, conversation_id, user_id, sender, body, media_id, share_kind, share_json)
      values (${crypto.randomUUID()}, ${data.conversationId}, ${context.userId}, ${"me"}, ${body || preview}, ${data.mediaId ?? null}, ${data.shareKind ?? null}, ${data.shareJson ?? null})`;
    await sql`update conversations set last_body = ${preview}, updated_at = now()
      where id = ${data.conversationId} and user_id = ${context.userId}`;
    return loadConversation(context.userId, data.conversationId);
  });

export const joinCommunity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((communityId: string) => communityId)
  .handler(async ({ context, data: communityId }) => {
    const sql = await getSql();
    const existing = await sql`select community_id from community_members where user_id = ${context.userId} and community_id = ${communityId}`;
    if (existing[0]) {
      await sql`delete from community_members where user_id = ${context.userId} and community_id = ${communityId}`;
      return { joined: false };
    }
    await sql`insert into community_members (user_id, community_id) values (${context.userId}, ${communityId})`;
    return { joined: true };
  });

export const myCommunities = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ community_id: string }>`select community_id from community_members where user_id = ${context.userId}`;
    return rows.map((r) => r.community_id);
  });

async function notifySlackFeedComment(input: {
  postId: string;
  postAuthor: string;
  commenter: string;
  body: string;
}) {
  const webhook = process.env.SLACK_FEED_WEBHOOK_URL?.trim();
  if (!webhook) return;
  const text = "UNIBUD feed comment\n@" + input.commenter + " commented on @" + input.postAuthor + "'s post:\n“" + input.body + "”\nPost: /?p=" + input.postId;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // Slack delivery must never make the user comment fail.
  }
}
export const getPublicProfileActivity = createServerFn({ method: "GET" })
  .validator((handle: string) => handle.replace(/^@/, "").trim().toLowerCase())
  .handler(async ({ data: handle }) => {
    const sql = await getSql();
    const profiles = await sql<{ user_id: string; handle: string; display_name: string }>`select user_id, handle, display_name from student_profiles where handle = ${handle} limit 1`;
    const profile = profiles[0];
    const posts = await sql`select id, community_id, author_handle, body, image, created_at from posts where author_handle = ${handle} order by created_at desc`;
    let likedPosts: any[] = [];
    let comments: any[] = [];
    if (profile) {
      try {
        likedPosts = await sql`select p.id, p.community_id, p.author_handle, p.body, p.image, p.created_at, pl.created_at as liked_at from post_likes pl join posts p on p.id = pl.post_id where pl.user_id = ${profile.user_id} order by pl.created_at desc`;
      } catch { likedPosts = []; }
      try {
        comments = await sql`select r.id, r.post_id, r.author_handle, r.body, r.parent_id, r.created_at, p.author_handle as post_author from post_replies r left join posts p on p.id = r.post_id where r.user_id = ${profile.user_id} order by r.created_at desc`;
      } catch { comments = []; }
    }
    return {
      profile: profile ? { userId: String(profile.user_id), handle: String(profile.handle), displayName: String(profile.display_name) } : null,
      posts: posts.map((p) => ({ id: String(p.id), communityId: String(p.community_id), authorHandle: String(p.author_handle), body: String(p.body), image: p.image ? String(p.image) : undefined, createdAt: String(p.created_at) })),
      likedPosts: likedPosts.map((p) => ({ id: String(p.id), communityId: String(p.community_id), authorHandle: String(p.author_handle), body: String(p.body), image: p.image ? String(p.image) : undefined, createdAt: String(p.created_at), likedAt: String(p.liked_at) })),
      comments: comments.map((r) => ({ id: String(r.id), postId: String(r.post_id), authorHandle: String(r.author_handle), body: String(r.body), parentId: r.parent_id ? String(r.parent_id) : undefined, createdAt: String(r.created_at), postAuthor: r.post_author ? String(r.post_author) : undefined })),
    };
  });
export const createPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      communityId: string;
      body: string;
      image?: string;
      video?: string;
      kind?: "post" | "reel";
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const body = data.body.trim() || (data.video ? "Reel" : data.image ? "Photo" : "");
    if (!body) throw new Error("Write something first");
    const sql = await getSql();
    const profile = await sql<{ handle: string }>`select handle from student_profiles where user_id = ${context.userId} limit 1`;
    const handle = profile[0]?.handle || "you";
    const id = `p_${crypto.randomUUID().slice(0, 8)}`;
    const kind = data.kind ?? (data.video ? "reel" : "post");
    try {
      await sql`insert into posts (id, community_id, author_handle, body, image, video, kind)
        values (${id}, ${data.communityId}, ${handle}, ${body}, ${data.image ?? null}, ${data.video ?? null}, ${kind})`;
    } catch {
      await sql`insert into posts (id, community_id, author_handle, body, image)
        values (${id}, ${data.communityId}, ${handle}, ${body}, ${data.image ?? null})`;
    }
    return { id, handle, body, kind };
  });
