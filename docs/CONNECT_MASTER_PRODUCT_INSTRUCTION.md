# CONNECT — Master Product Understanding and Engineering Brief

**Status:** Product direction and implementation contract  
**Applies to:** All AI agents, engineers, designers and automated builders working on CONNECT in `iamtheoracle/unibud-app`  
**First rule:** Understand and audit the existing repository before changing implementation.

## 1. What CONNECT is

CONNECT is UNIBUD's people, relationships and social-discovery environment. It helps people find, understand, approach, communicate with and participate alongside other people in relevant contexts.

CONNECT is not merely:
- a friend-request screen;
- a list of classmates;
- a social-media feed;
- a messaging application;
- a directory that exposes every user's information;
- a single universal relationship table with different button labels.

It is a connected set of people-centred capabilities with distinct relationship types, privacy choices, trust signals, discovery contexts and participation rules. It should make meaningful human connection easier while preserving user control and safety.

The audience is broader than university students. It may include students, graduates, professionals, creators, local communities and other eligible people. Access to individual experiences must still respect age, eligibility, country, consent and applicable law.

**Product promise:** Help people find the right people and communities, build appropriate relationships and take the next useful step — without unnecessary friction.

## 2. Product outcomes

CONNECT should help a user:
1. Create and control a trustworthy identity and profile.
2. Discover relevant people and communities without exposing private information.
3. Understand why a person or community is relevant.
4. Choose the correct interaction: follow, request a connection, join a community, participate in a shared context, or start an allowed conversation.
5. Communicate safely through the appropriate UNIBUD communication experience.
6. Control who can find, contact, follow, message or see them.
7. Block, report, mute, restrict and recover from unwanted interactions.
8. Build meaningful participation over time without manipulative engagement mechanics.

Success is measured by relevant discovery, successful user-controlled interactions, safe participation, task completion and trust — not by raw connection counts, screen time or message volume.

## 3. Relationship types must remain distinct

Do not collapse these into one generic relationship model:

- **Follow:** One-way subscription to permitted public or shared updates. It does not imply friendship, endorsement, direct-message permission or access to private content.
- **Connection:** A mutual social relationship established through the applicable request/acceptance flow. It does not grant academic, financial, community-admin or other product permissions.
- **Class membership:** Academic access derived from authoritative enrolment, an authorised roster, class invitation/code or instructor/admin action. It is not a social connection.
- **Community membership:** Participation in a specific community, with that community's own join rules, roles, moderation and lifecycle.
- **Conversation membership:** Permission to access a particular direct or group conversation. It is not automatically a friendship or a general contact permission.
- **Contextual participation:** Shared project, event, marketplace, class or other activity. It grants only the minimum access needed for that context.
- **Block/restriction:** A safety control that affects personal contact and relevant discovery. It must not silently revoke legitimate academic membership or erase required shared-context access.

Every relationship must have a clear owner, purpose, state machine, authorization policy and lifecycle.

## 4. Profiles, identity and verification

Profiles should expose only information the user has chosen or is permitted to share. Design separate controls for:
- public/profile visibility;
- discoverability in search and recommendations;
- who may follow;
- who may send connection requests;
- who may initiate direct messages;
- who may see activity or presence;
- who may see shared interests, institution or community details.

Verification must be claim-specific and evidence-based. A verified email, institution affiliation, age/eligibility check or identity check proves only the claim that the verification process actually supports. Never display verification as a blanket guarantee that a person is safe, trustworthy or endorsed by UNIBUD. Record verification method, scope, status, expiry/revocation and review/audit information as appropriate. Do not expose sensitive evidence to other users.

## 5. Discovery and recommendations

Discovery should help users find relevant people and groups through intentional, explainable contexts such as:
- shared interests and goals;
- opted-in communities;
- public profiles and creator content;
- institution or course context where authorised;
- projects, events and activities;
- location only when the user explicitly enables a suitable location feature;
- relevant marketplace or service context where appropriate.

Rules:
- Never reveal private membership, contact details, exact location, academic records or hidden profile attributes.
- Do not infer sensitive traits for ranking or expose sensitive inferred traits.
- Explain recommendation context in plain language where practical.
- Provide controls to hide, dismiss, tune or opt out.
- Prevent blocked users from being recommended to or contacting the blocker through alternate discovery surfaces.
- Apply rate limits and anti-scraping protections.
- Do not seed fake people or represent fixtures as live users.

## 6. Content, communities and social surfaces

CONNECT may link people to content, creators, communities, events and shared activities. It must not assume that every social surface belongs to CONNECT. Inspect the repository and product decisions to determine the actual ownership of Square, Quad and other surfaces before changing them.

For every content or community feature, document:
- who owns the record and its source of truth;
- visibility (public, followers, connections, members, invited users, private);
- create/edit/delete permissions;
- join/leave and role lifecycle;
- moderation, reporting and appeal path;
- media access rules;
- retention and deletion behaviour;
- notification ownership and delivery rules.

Do not copy content or duplicate domain data merely to make a feed easier to render. Use controlled references and permission-checked queries.

## 7. Communication boundary

CHAT is the communication product/infrastructure unless repository evidence or a later explicit product decision establishes otherwise. CONNECT may initiate an allowed conversation or display an appropriate communication entry point, but it must not invent a parallel messaging backend.

A user must only read or write a conversation when they are an authorised active member. Enforce authorization on the server for:
- conversation discovery and loading;
- message history and pagination;
- sending, editing, deleting and reacting;
- receipts and read state;
- attachments, upload, download and previews;
- calls, signalling and presence;
- group membership changes and invitations.

Never create fake peer replies. Never show "online", "active now", delivered, read or call-connected states unless backed by verified server-side behaviour. Client-side route hiding is not authorization.

## 8. Safety, privacy and abuse prevention

Safety is a core capability, not a later visual addition.

Implement and test:
- block and unblock;
- report user, profile, content, message and community where applicable;
- mute, restrict and hide;
- contact and discoverability controls;
- spam, harassment, impersonation and scraping protections;
- rate limits and abuse monitoring;
- moderation queues, reason codes, audit trail and appeals;
- safe handling of images, links and user-generated content;
- age and eligibility gates for restricted experiences;
- account deletion and data-retention rules.

Blocking must be enforced consistently across search, suggestions, profile access, follows, connection requests, direct messages, calls, notifications and other personal-contact paths. Define carefully how blocked users coexist in required class or work contexts: block should prevent unwanted personal contact while preserving essential authorised shared-context access with appropriate moderation and restricted interaction.

Do not promise absolute safety. Make controls discoverable, explain their effects and provide a usable report/appeal path.

## 9. Non-negotiable academic/social boundary

- A student does not need a friend or connection request to join a class.
- Academic membership comes from verified enrolment, an authorised roster, institution/class invitation, class code or instructor/admin authority.
- Classmates are recognised as classmates, not automatically friends.
- Students can participate in shared class contexts and communicate in class/group spaces without becoming social connections, subject to class permissions and safety controls.
- Direct messages to classmates are governed by contact/privacy settings and relevant institutional rules, not by automatic friendship.
- Blocking does not remove legitimate enrolment or hide essential academic content.
- Social follows, connections and community membership never grant access to grades, attendance, submissions, private class materials or staff functions.

## 10. Product boundaries across UNIBUD

CONNECT is part of one coherent UNIBUD ecosystem, but it does not own every domain.

Potential integrations must be verified against existing product documentation and repository implementation. Names alone are not sufficient evidence of product purpose.

- **CHAT:** conversation and communication lifecycle.
- **BOARD:** academic records, course/class context and academic permissions.
- **QUAD:** community or group participation only if confirmed by product documentation.
- **SQUARE:** content/discovery surfaces only if confirmed.
- **BUD:** AI assistance; no autonomous social action without user approval and scoped permissions.
- **LYNC:** meaningful opt-in goals/progress; no forced social engagement.
- **FLOW:** financial activity; social relationships do not grant financial authority.
- **WAYWARD and SOULYNC:** treat as CONNECT experiences according to current product direction, while verifying their actual scope from repository/docs before changing implementation.
- **Other products:** inspect their contracts and owner before integration.

Cross-product integration must use explicit contracts/events with:
- a named source-of-truth owner;
- stable identifiers and minimal payloads;
- authorization and consent checks at the receiving domain;
- idempotency, retries and reconciliation;
- observable failure states and audit records;
- no permission inheritance by accident.

A successful connection request must not automatically add a person to a class, grant community admin, open a financial account or create access to another product's private records.

## 11. Engineering rules

1. Inspect the current main branch, open pull requests, code, migrations, auth model and CI before editing.
2. Trace the complete path from UI action to server function, database write, authorization check, event/notification and recipient experience.
3. Reuse established project patterns where sound; do not add a second competing architecture without documenting why.
4. Treat browser state as presentation/cache, never as the authoritative source for relationships, permissions, membership or safety.
5. Enforce authorization on the server for every read and write. Check ownership, active membership, role, block state, privacy settings and contextual access.
6. Use database transactions for multi-record state changes, canonical direct-conversation creation, receipts and outbox/event creation.
7. Use idempotency keys for retryable user actions and message sends. Scope uniqueness to the correct domain and conversation.
8. Validate all inputs server-side. Do not trust sender names, roles, membership IDs, visibility or recipient lists supplied by the client.
9. Use stable IDs, pagination, indexes, bounded queries and rate limits. Avoid N+1 loading and unbounded feed/message queries.
10. Keep migrations compatible with the actual auth ID type and existing data. Review forward migration, rollback/recovery, constraints, indexes and deployment ordering.
11. Add structured logs and metrics without leaking message bodies, private profile data or sensitive verification evidence.
12. Provide loading, empty, error, retry, offline and permission-denied states.
13. Do not claim a feature is complete until multi-account end-to-end tests prove it.
14. Do not deploy, merge, apply production migrations or enable sensitive production capabilities without explicit approval.

## 12. Required first task: repository evidence audit — no feature coding yet

Before modifying CONNECT, inspect the repository and produce a concise but complete audit.

### A. Route and UI inventory
List every route, page, component and navigation entry that belongs to or initiates CONNECT. For each, record its user purpose, data source, actions and linked domains.

### B. Data and state inventory
List relevant database tables, migrations, types, schemas, browser stores, seeded fixtures and caches. Identify the actual source of truth for each relationship and profile field. Flag duplicate or legacy models.

### C. Server/API inventory
List every server function, API endpoint and background job involved in profiles, discovery, follows, connections, blocks, reports, communities, conversations, media, presence and notifications. For each, document authentication, authorization, validation, transactionality and error behaviour.

### D. Journey walkthroughs
Trace at least these journeys from UI to database and back across two independent accounts:
1. Find a person and view only permitted profile details.
2. Follow and unfollow.
3. Send, accept, decline and cancel a connection request.
4. Block and unblock; verify every affected surface.
5. Report a user/content/message and identify moderation ownership.
6. Start an allowed direct conversation and exchange messages.
7. Join and leave a community with role checks.
8. Join a class without creating a social connection.
9. Communicate in a shared class context without being friends.
10. Delete/deactivate an account and identify relationship/content retention effects.

If a journey is not implemented, state that clearly; do not simulate it.

### E. Cross-product integration map
For every connection to CHAT, BOARD, QUAD, SQUARE, BUD, LYNC, FLOW or another product, identify the event/API, data owner, permissions and failure behaviour. Mark unverified product interpretations as questions, not facts.

### F. Security and reliability review
Test or inspect:
- IDOR and cross-account access;
- inactive/removed conversation membership;
- blocked-user bypass paths;
- privacy setting enforcement;
- media upload and download authorization;
- rate limits and spam controls;
- duplicate requests and message retries;
- transaction races and canonical direct conversations;
- stale or spoofable presence/receipts;
- notification leaks and duplicate events;
- academic membership independence from social relationships.

### G. Evidence and confidence labels
Every finding must cite the exact repository path and relevant function/table/route. Use one of these statuses:
- **WORKING AND VERIFIED** — tested end-to-end with independent accounts.
- **IMPLEMENTED, NOT VERIFIED** — code exists but end-to-end proof is missing.
- **PARTIALLY IMPLEMENTED** — only some required paths work.
- **MOCK / DEMO ONLY** — seeded, local-only or simulated.
- **MISSING** — no implementation found.
- **UNSAFE / BROKEN** — an exploitable gap, incorrect behaviour or failure exists.

Do not call something working based only on a component rendering or a unit test.

### H. Deliverables
Create:
1. `docs/CONNECT_IMPLEMENTATION_AUDIT.md` — evidence-backed inventory and findings.
2. A prioritised issue list with severity, impact, affected files, proposed fix and tests.
3. A proposed sequence of small implementation pull requests, beginning with P0 security and data integrity.
4. A list of decisions requiring product-owner clarification. Do not invent answers.

**Stop after the audit.** Do not start feature implementation until the audit is reviewed and the highest-risk findings and implementation plan are agreed.

## 13. Priority order after audit

- **P0 — Critical:** cross-account data leaks, missing server authorization, block bypass, unsafe media access, fake messaging/presence, academic/social permission confusion, data integrity and migration hazards.
- **P1 — Core:** authoritative profiles and relationships, privacy controls, discovery, reports/moderation, real conversation handoff and complete multi-account journeys.
- **P2 — Differentiation:** richer discovery, context-aware recommendations, creator/community participation and carefully scoped AI assistance.
- **P3 — Optimisation:** performance, accessibility refinements, personalisation and analytics after correctness and safety are proven.

## 14. Definition of done

A CONNECT capability is done only when:
- its user problem and domain owner are documented;
- data ownership and lifecycle are explicit;
- server-side authorization and privacy rules are tested;
- safety, abuse and adversarial cases are covered;
- at least two independent accounts complete the real journey;
- persistence works across sessions/devices;
- retries and duplicate actions are safe;
- notifications and cross-product side effects are correct and deduplicated;
- accessibility, mobile and low-bandwidth states are reviewed;
- logs, metrics and support ownership exist;
- automated tests pass in CI;
- migration/deployment/recovery notes are provided;
- no mock or seeded behaviour is presented as production functionality.

**Instruction to the building AI:** Your first job is to understand what already exists and prove that understanding with repository evidence. Preserve working functionality, identify what is fake or unsafe, and improve the system incrementally. Do not blindly rebuild, rename, or expand features. Correctness, privacy, trust, clear domain ownership and reliable real-world journeys take priority over adding more screens.
