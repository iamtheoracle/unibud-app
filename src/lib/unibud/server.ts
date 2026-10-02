import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  mapCommunity,
  mapDiscovery,
  mapListing,
  mapNote,
  mapPerson,
  mapPost,
  mapPostReply,
  mapProfile,
  mapUni,
} from "./map";
import type { ListingCategory, ListingKind, StudentProfile } from "./types";
import { canTeach, type CampusRole } from "./roles";

type P2POrderRow = { id: string; buyer_user_id: string; seller_user_id: string | null; listing_id: string; status: string; amount_kobo: number; note: string; created_at: string; updated_at: string };
type TrackingRow = { id: string; user_id: string; kind: string; title: string; status: string; target_id: string | null; metadata: string; created_at: string; updated_at: string };
type GoalRow = { id: string; user_id: string; scope: string; title: string; target_value: number | null; current_value: number; status: string; due_at: string | null; created_at: string; updated_at: string };
type HistoryRow = { id: string; user_id: string; event_type: string; action: string; entity_id: string | null; metadata: string; created_at: string };
type CampaignRow = { id: string; owner_user_id: string; name: string; objective: string; status: string; created_at: string; updated_at: string };

export const getCampusCatalog = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const universities = (await sql`select * from universities order by name`) .map((r) => mapUni(r as Parameters<typeof mapUni>[0]));
    const people = (await sql`select * from directory_people order by name`) .map((r) => mapPerson(r as Parameters<typeof mapPerson>[0]));
    const listings = (
      await sql`select * from listings order by created_at desc`
    ) .map((r) => mapListing(r as Parameters<typeof mapListing>[0]));
    const communities = (await sql`select * from communities order by members desc`).map(
      mapCommunity,
    );
    const posts = (
      await sql`select * from posts order by created_at desc limit 80`
    ) .map((r) => mapPost(r as Parameters<typeof mapPost>[0]));
    const discovery = (await sql`select * from discovery_items`) .map((r) => mapDiscovery(r as Parameters<typeof mapDiscovery>[0]));
    let replies: ReturnType<typeof mapPostReply>[] = [];
    try {
      replies = (await sql`select * from post_replies order by created_at asc limit 800`).map((r) =>
        mapPostReply(r as Parameters<typeof mapPostReply>[0]),
      );
    } catch {
      replies = [];
    }
    return { universities, people, listings, communities, posts, discovery, replies };
  },
);

export const getListing = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    const rows = await sql`select * from listings where id = ${id} limit 1`;
    const listing = rows[0] ? mapListing(rows[0]) : null;
    if (!listing) return null;
    const sellerRows = await sql`select * from directory_people where handle = ${listing.sellerHandle} limit 1`;
    const seller = sellerRows[0] ? mapPerson(sellerRows[0]) : null;
    const related = (
      await sql`select * from listings where category = ${listing.category} and id <> ${id} order by saved_count desc limit 4`
    ) .map((r) => mapListing(r as Parameters<typeof mapListing>[0]));
    return { listing, seller, related };
  });

export const searchCampus = createServerFn({ method: "GET" })
  .validator((q: string) => q.trim().toLowerCase())
  .handler(async ({ data: q }) => {
    if (!q) return { listings: [], people: [], communities: [] };
    const sql = await getSql();
    const like = `%${q}%`;
    const listings = (
      await sql`select * from listings where lower(title) like ${like} or lower(description) like ${like} or lower(category) like ${like} limit 12`
    ) .map((r) => mapListing(r as Parameters<typeof mapListing>[0]));
    const people = (
      await sql`select * from directory_people where lower(name) like ${like} or lower(handle) like ${like} limit 8`
    ) .map((r) => mapPerson(r as Parameters<typeof mapPerson>[0]));
    const communities = (
      await sql`select * from communities where lower(name) like ${like} or lower(description) like ${like} limit 8`
    ) .map((r) => mapCommunity(r as Parameters<typeof mapCommunity>[0]));
    return { listings, people, communities };
  });

export const listByCategory = createServerFn({ method: "GET" })
  .validator((category: ListingCategory | "all") => category)
  .handler(async ({ data: category }) => {
    const sql = await getSql();
    const rows =
      category === "all"
        ? await sql`select * from listings order by created_at desc`
        : await sql`select * from listings where category = ${category} order by created_at desc`;
    return rows.map(mapListing);
  });

async function handleFromName(name: string, userId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12) || "student";
  return `${base}${userId.slice(-4)}`;
}

export const listMyP2POrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<P2POrderRow>`select id,buyer_user_id,seller_user_id,listing_id,status,amount_kobo,note,created_at,updated_at from p2p_orders where buyer_user_id = ${context.userId} or seller_user_id = ${context.userId} order by updated_at desc`;
    return rows;
  });

export const createP2POrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { listingId: string; note?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const listing = await sql<{ owner_user_id: string; price_kobo: number }>`select owner_user_id, price_kobo from listings where id = ${data.listingId} limit 1`;
    if (!listing[0]) throw new Error("Listing not found.");
    if (listing[0].owner_user_id === context.userId) throw new Error("You cannot order your own listing.");
    const id = `ord_${crypto.randomUUID()}`;
    await sql`insert into p2p_orders (id,buyer_user_id,seller_user_id,listing_id,status,amount_kobo,note) values (${id},${context.userId},${listing[0].owner_user_id},${data.listingId},"pending",${listing[0].price_kobo},${data.note?.trim() ?? ""})`;
    return { id };
  });

export const listMyTracking = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<TrackingRow>`select id,user_id,kind,title,status,target_id,metadata,created_at,updated_at from tracking_items where user_id = ${context.userId} order by updated_at desc`;
    return rows;
  });

export const createTrackingItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; title: string; targetId?: string }) => input)
  .handler(async ({ context, data }) => {
    const title = data.title.trim();
    if (!title) throw new Error("Tracking item needs a title.");
    const sql = await getSql();
    const id = `trk_${crypto.randomUUID()}`;
    await sql`insert into tracking_items (id,user_id,kind,title,target_id) values (${id},${context.userId},${data.kind},${title},${data.targetId ?? null})`;
    return { id };
  });

export const listMyGoals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<GoalRow>`select id,user_id,scope,title,target_value,current_value,status,due_at,created_at,updated_at from goals where user_id = ${context.userId} order by updated_at desc`;
    return rows;
  });

export const createGoal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; scope?: string; targetValue?: number; dueAt?: string }) => input)
  .handler(async ({ context, data }) => {
    const title = data.title.trim();
    if (!title) throw new Error("Goal needs a title.");
    const sql = await getSql();
    const id = `goal_${crypto.randomUUID()}`;
    await sql`insert into goals (id,user_id,scope,title,target_value,due_at) values (${id},${context.userId},${data.scope ?? "academic"},${title},${data.targetValue ?? null},${data.dueAt ?? null})`;
    return { id };
  });

export const listMyHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<HistoryRow>`select id,user_id,event_type,action,entity_id,metadata,created_at from history_events where user_id = ${context.userId} order by created_at desc limit 200`;
    return rows;
  });

export async function recordHistory(userId: string, eventType: string, action: string, entityId?: string, metadata = "{}") {
  const sql = await getSql();
  await sql`insert into history_events (id,user_id,event_type,action,entity_id,metadata) values (${crypto.randomUUID()},${userId},${eventType},${action},${entityId ?? null},${metadata})`;
}

export const listMyMarketingCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<CampaignRow>`select id,owner_user_id,name,objective,status,created_at,updated_at from marketing_campaigns where owner_user_id = ${context.userId} order by updated_at desc`;
    return rows;
  });

export const createMarketingCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; objective?: string }) => input)
  .handler(async ({ context, data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("Campaign needs a name.");
    const sql = await getSql();
    const id = `cmp_${crypto.randomUUID()}`;
    await sql`insert into marketing_campaigns (id,owner_user_id,name,objective) values (${id},${context.userId},${name},${data.objective ?? ""})`;
    return { id };
  });


export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`select * from student_profiles where user_id = ${context.userId} limit 1`;
    if (rows[0]) return mapProfile(rows[0]);
    return null;
  });

export const upsertMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Partial<StudentProfile> & { displayName?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql`select * from student_profiles where user_id = ${context.userId} limit 1`;
    const existingProfile = existing[0] ? mapProfile(existing[0]) : null;
    const displayName =
      (data.displayName ?? existingProfile?.displayName ?? "Student").trim() || "Student";
    const handle =
      data.handle?.replace(/[^a-z0-9_]/gi, "").toLowerCase() ||
      existingProfile?.handle ||
      (await handleFromName(displayName, context.userId));
    const universityId = data.universityId || existingProfile?.universityId || "unilag";
    const program = data.program ?? existingProfile?.program ?? "";
    const year = data.year ?? existingProfile?.year ?? "";
    const bio = data.bio ?? existingProfile?.bio ?? "";
    const campusRole = data.campusRole ?? existingProfile?.campusRole ?? "student";
    const onboardingDone = data.onboardingDone ?? existingProfile?.onboardingDone ?? false;
    if (existing[0]) {
      await sql`update student_profiles set display_name = ${displayName}, handle = ${handle},
        university_id = ${universityId}, program = ${program}, year = ${year}, bio = ${bio},
        campus_role = ${campusRole}, onboarding_done = ${onboardingDone}
        where user_id = ${context.userId}`;
    } else {
      await sql`insert into student_profiles (user_id, display_name, handle, university_id, program, year, bio, campus_role, onboarding_done)
        values (${context.userId}, ${displayName}, ${handle}, ${universityId}, ${program}, ${year}, ${bio}, ${campusRole}, ${onboardingDone})`;
    }
    const rows = await sql`select * from student_profiles where user_id = ${context.userId} limit 1`;
    return mapProfile(rows[0]);
  });

export const toggleSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; itemId: string; title: string; href: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql`select item_id from saves where user_id = ${context.userId} and kind = ${data.kind} and item_id = ${data.itemId}`;
    if (existing[0]) {
      await sql`delete from saves where user_id = ${context.userId} and kind = ${data.kind} and item_id = ${data.itemId}`;
      return { saved: false };
    }
    await sql`insert into saves (user_id, kind, item_id, title, href) values (${context.userId}, ${data.kind}, ${data.itemId}, ${data.title}, ${data.href})`;
    return { saved: true };
  });

export const listSaves = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      kind: string;
      item_id: string;
      title: string;
      href: string;
    }>`select kind, item_id, title, href from saves where user_id = ${context.userId} order by created_at desc`;
  });

export async function notify(
  userId: string,
  kind: string,
  title: string,
  body: string,
  href?: string,
) {
  const sql = await getSql();
  await sql`insert into notifications (id, user_id, kind, title, body, href)
    values (${crypto.randomUUID()}, ${userId}, ${kind}, ${title}, ${body}, ${href ?? null})`;
}

export const createListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      kind: ListingKind;
      category: ListingCategory;
      title: string;
      description: string;
      priceKobo: number;
      priceNote: string;
      location: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const title = data.title.trim();
    if (!title) throw new Error("Give it a title");
    const sql = await getSql();
    const profile = await sql<{ handle: string; university_id: string }>`
      select handle, university_id from student_profiles where user_id = ${context.userId} limit 1`;
    const handle = profile[0]?.handle || "you";
    const universityId = profile[0]?.university_id || "unilag";
    const id = `l_${crypto.randomUUID().slice(0, 8)}`;
    await sql`insert into listings (
      id, owner_user_id, kind, category, title, description, price_kobo, price_note,
      tone, seller_handle, university_id, location, tags
    ) values (
      ${id}, ${context.userId}, ${data.kind}, ${data.category}, ${title}, ${data.description.trim()},
      ${data.priceKobo}, ${data.priceNote}, ${"ink"}, ${handle}, ${universityId},
      ${data.location.trim() || "Campus"}, ${"[]"}
    )`;
    const rows = await sql`select * from listings where id = ${id} limit 1`;
    return mapListing(rows[0]);
  });

export const createUserReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: string; body: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim();
    if (!body) throw new Error("Report details are required.");
    const kind = data.kind.trim() || "problem";
    const sql = await getSql();
    const id = `report_${crypto.randomUUID()}`;
    await sql`insert into user_reports (id,user_id,kind,body) values (${id},${context.userId},${kind},${body})`;
    return { id };
  });

export const listNotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`select * from notifications where user_id = ${context.userId} order by created_at desc limit 40`;
    return rows.map(mapNote);
  });

/** Server gate for Tutor Mode. Class Governor does not pass. */
export const requireLecturer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ campus_role?: string }>`
      select campus_role from student_profiles where user_id = ${context.userId} limit 1`;
    const role = (rows[0]?.campus_role ?? "student") as CampusRole;
    if (!canTeach(role)) throw new Error("Only lecturers can use Tutor Mode.");
    return { ok: true as const };
  });

export const getMySquareState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    let liked: string[] = [];
    let commentLiked: string[] = [];
    try {
      liked = (
        await sql<{ post_id: string }>`select post_id from post_likes where user_id = ${context.userId}`
      ).map((r) => r.post_id);
      commentLiked = (
        await sql<{ reply_id: string }>`select reply_id from comment_likes where user_id = ${context.userId}`
      ).map((r) => r.reply_id);
    } catch {
      liked = [];
      commentLiked = [];
    }
    const saved = (
      await sql<{ item_id: string }>`select item_id from saves where user_id = ${context.userId} and kind = ${"post"}`
    ).map((r) => r.item_id);
    return { liked, saved, commentLiked };
  });

export const togglePostLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((postId: string) => postId)
  .handler(async ({ context, data: postId }) => {
    const sql = await getSql();
    const existing = await sql`select post_id from post_likes where user_id = ${context.userId} and post_id = ${postId}`;
    if (existing[0]) {
      await sql`delete from post_likes where user_id = ${context.userId} and post_id = ${postId}`;
      return { liked: false };
    }
    await sql`insert into post_likes (user_id, post_id) values (${context.userId}, ${postId})`;
    return { liked: true };
  });

export const addSquareReply = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { postId: string; body: string; parentId?: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim();
    if (!body) throw new Error("Write a reply first");
    const sql = await getSql();
    const profile = await sql<{ handle: string }>`select handle from student_profiles where user_id = ${context.userId} limit 1`;
    const handle = profile[0]?.handle || "you";
    const id = `pr_${crypto.randomUUID().slice(0, 10)}`;
    await sql`insert into post_replies (id, post_id, user_id, author_handle, parent_id, body)
      values (${id}, ${data.postId}, ${context.userId}, ${handle}, ${data.parentId ?? null}, ${body})`;
    return { id, postId: data.postId, authorHandle: handle, parentId: data.parentId, body, createdAt: new Date().toISOString() };
  });

export const toggleCommentLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((replyId: string) => replyId)
  .handler(async ({ context, data: replyId }) => {
    const sql = await getSql();
    const existing = await sql`select reply_id from comment_likes where user_id = ${context.userId} and reply_id = ${replyId}`;
    if (existing[0]) {
      await sql`delete from comment_likes where user_id = ${context.userId} and reply_id = ${replyId}`;
      return { liked: false };
    }
    await sql`insert into comment_likes (user_id, reply_id) values (${context.userId}, ${replyId})`;
    return { liked: true };
  });

