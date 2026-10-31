# UNIBUD Integrated Experience Strategy and Upgrade Roadmap

**Status:** Product and engineering direction  
**Branch:** `strategy/unibud-integrated-experience-roadmap`  
**Baseline:** `3029a8761b5e42b3880f0392640abf377ba325a3`

## 1. Product thesis

UNIBUD is an independently built ecosystem that makes useful capabilities across learning, communication, community, discovery, services, commerce, creativity and personal progress work together as one simple experience.

The goal is not to compete feature-for-feature with individual providers, copy their products, depend on their APIs, or reproduce their interfaces. Public products and category leaders are research references: study the user problem they solve, the workflow they make possible, the friction they leave behind, and the unmet needs users still experience. UNIBUD builds its own implementation, data, infrastructure, integrations and user experience.

**Product promise:** Everything people need. Nothing unnecessarily complicated.

## 2. Product principles

1. **Independent implementation:** No competitor API, code, database, branding, private data or proprietary interface is a dependency. Use documented third-party APIs only when they are legitimate infrastructure or service providers chosen for a clear reason (for example, an approved payment processor, identity provider or institution-authorised integration). Maintain replaceable adapters and a first-party fallback where feasible.
2. **Simple outside, sophisticated inside:** Hide technical complexity behind clear language, sensible defaults, progressive disclosure and short task flows.
3. **One coherent ecosystem:** Shared navigation, design language, account identity and cross-product handoffs. Avoid making users repeat information or setup unnecessarily.
4. **Domain ownership:** Each product owns its own records, business rules, relationships, permissions, lifecycle and notification categories.
5. **Shared foundations, not universal permissions:** Identity, authentication, security primitives, search, event delivery and notification infrastructure may be shared. A relationship or permission in one product never automatically grants access in another.
6. **Real functionality over feature theatre:** A feature is not complete because a screen exists. It must persist correctly, enforce authorization, handle errors, work across accounts/devices and pass end-to-end tests.
7. **Trust is contextual:** Verification is evidence about a specific identity or claim, not a blanket guarantee that a person, seller, provider or transaction is safe.
8. **Consent, privacy and safety by design:** Blocking, reporting, age/eligibility rules, data minimisation, retention and appeal processes are designed into each relevant workflow.
9. **Accessible and inclusive:** Plain language, mobile-first performance, low-bandwidth resilience, accessible controls, localization and country-specific academic and regulatory models.
10. **Measured simplicity:** Reduce steps and confusion without hiding important costs, consequences, consent, permissions or safety information.

## 3. Experience model

The user should experience one ecosystem with clear destinations. Products remain distinct behind the scenes and connect through explicit, permission-checked workflows.

- **Discover:** Find people, services, communities, content, opportunities and institutions.
- **Learn and progress:** Understand academic and practical material, organise work and complete goals.
- **Communicate:** Start or join conversations appropriate to a class, project, community, transaction or personal relationship.
- **Participate:** Join communities, events, projects and shared activities with clear roles and boundaries.
- **Trade and get help:** Discover offers, agree terms, pay through approved providers where enabled, fulfil and resolve issues.
- **Create and express:** Publish, share and discover creative work and culture.
- **Stay on track:** Use Lync for opt-in, meaningful progress and shared goals, not artificial app-open or message-count engagement.

The named product surfaces (including Board, Connect, Square, Quad, Chat, Bud, Flow, Lync, Concierge, The Quarter, The Fixer, Riff, SouLync and Wayward) must retain their confirmed product identity. Do not infer product ownership or merge products based only on names. Verify each product's purpose from current routes, documentation and explicit product decisions before changing navigation or domain boundaries. SOULYNC and Wayward are experiences within Connect according to the current product direction, unless a later explicit decision changes this.

## 4. Cross-product workflow rules

Every cross-product workflow must declare:

- initiating domain and event owner;
- source record and stable event identifier;
- receiving domain and the minimum data it needs;
- authorization and consent checks;
- idempotency and duplicate handling;
- retry, failure and reconciliation behaviour;
- user-visible status and responsible support destination;
- audit trail and retention policy.

Example: an authorised course-enrolment event may provision class-space membership and expose relevant course communication. It must not create a friendship, follow, personal contact permission or social visibility by default. If a receiving service fails, the academic enrolment remains valid and the integration is retried/reconciled.

Notifications use shared delivery infrastructure but are owned and rendered by their relevant product/context. Do not create a universal stream that indiscriminately mixes every product's alerts.

## 5. Non-negotiable academic and social boundaries

- Academic membership is determined by verified enrolment, authorised roster, institution/class invitation, instructor/admin permission or an explicitly public class.
- Students do not need friend requests to join classes, access academic content or communicate in shared class contexts.
- Classmates are not automatically friends.
- Blocking stops unwanted personal contact and relevant discovery, but does not silently remove enrolment or hide essential academic content.
- Shared class contexts retain appropriate moderation and restricted-interaction tools.
- Academic records, grades, attendance and submissions are private and role-controlled.
- A social follow, connection, community membership or marketplace transaction does not grant academic or financial permissions.

## 6. Priority programme

### P0 — Safety, integrity and foundations

1. Replace user-owned/fake direct-message behaviour with real participant-based conversations.
2. Enforce membership and authorization for every conversation, room, message, attachment, media upload and download.
3. Move connection requests, acceptance, follows and blocks from browser-only state to authoritative server-side records.
4. Add server-side block/report checks across personal contact and discovery surfaces while preserving academic membership.
5. Enforce institution, course, class, session and staff role permissions on every academic read/write function.
6. Remove seeded/fake peer responses and unverified online/presence claims from production journeys.
7. Validate migrations against the actual auth ID type, existing database, migration runner and rollback/recovery strategy.
8. Establish CI gates for typecheck, lint, unit, integration, authorization and critical end-to-end tests.

**Exit criteria:** Two or more independent accounts can complete real workflows; unauthorized access is rejected; data persists across devices; no seeded behaviour is mistaken for live data; all P0 tests pass.

### P1 — Complete core journeys

1. Complete institution, programme, qualification, course and offering registry with country-specific taxonomies and source provenance.
2. Build authoritative academic membership, timetable, assessment, submission, feedback and results workflows.
3. Complete domain-owned notification preferences, delivery, read state, deduplication and failure recovery.
4. Complete marketplace listing, offer, order, payment-provider reconciliation, fulfilment, refund and dispute lifecycles.
5. Complete identity/claim verification, trust evidence, reporting, moderation and appeals.
6. Make media, search, uploads and sharing respect the owning domain's permissions.

**Exit criteria:** End-to-end workflows work with real persisted records, role-based access, clear status and auditable recovery.

### P2 — Differentiating intelligence and ecosystem orchestration

1. Bud: source-grounded assistance, explainable uncertainty, user-approved actions and task completion.
2. Lync: opt-in goals, meaningful activity, progress, pause/recovery, privacy and anti-gaming.
3. Context-aware discovery and recommendations with user controls and measurable relevance.
4. Cross-product workflow orchestration using explicit contracts, idempotency, retries, observability and reconciliation.
5. Personalisation and automation only after data quality, consent and domain boundaries are reliable.

**Exit criteria:** Cross-product experiences reduce steps and improve task success without creating permission leaks, confusing ownership or unwanted notifications.

### P3 — Expansion

- Country and institution expansion based on validated registry coverage and local requirements.
- Additional service, creative, community and adult-oriented experiences with their own age, consent and compliance boundaries.
- Advanced analytics and recommendation systems only where they provide measurable user benefit and meet privacy requirements.

## 7. Definition of done for every feature

A feature is not complete until all applicable items pass:

- User problem and intended outcome documented.
- Product owner and source of truth identified.
- Data model, lifecycle, constraints and migrations reviewed.
- Authentication, authorization, consent and abuse cases tested.
- Loading, empty, error, retry and offline/low-bandwidth states handled.
- Accessibility, mobile layout and plain-language UX checked.
- Auditability, observability, rate limits and operational ownership established.
- Unit, integration, security and end-to-end tests pass.
- Real multi-account behaviour verified; mocks and fixtures clearly labelled.
- Rollback, recovery and data migration plan documented.
- No production money movement or sensitive institutional action enabled before approvals and testing.

## 8. Competitor and category research method

Research is used to understand capabilities and unmet user needs, not to import dependencies or copy implementation.

For each relevant category, record:
- user job and target audience;
- publicly observable user journey;
- useful capability and why it matters;
- friction, exclusions and unresolved needs;
- evidence quality (observed, documented, marketed or independently verified);
- UNIBUD's independent design response;
- privacy, safety, regulatory and operational risks;
- testable acceptance criteria.

Never claim a competitor feature is broken or absent solely because a marketing page does not mention it. Never claim UNIBUD is better until comparative user testing supports that conclusion.

## 9. Immediate engineering sequence

1. Reconfirm the current main branch, open PRs, migration state and CI status before touching implementation.
2. Create an isolated feature branch; do not merge or deploy automatically.
3. Write an evidence-backed route, data-model and user-journey inventory for the current repository.
4. Close the P0 authorization gaps before expanding functionality.
5. Integrate the participant-based messaging schema only after checking auth ID types, migration state, indexes, transactional semantics and existing data.
6. Add two-account and adversarial authorization tests before switching production callers.
7. Review CI and dependency health; do not treat dependency-bot success as application CI success.
8. Submit small, reviewable pull requests with test evidence and explicit deployment/migration notes.

## 10. Product success measures

Measure user outcomes, not raw engagement:

- time and steps to complete a common task;
- successful academic task completion;
- successful and safe transaction completion;
- message delivery reliability and authorization failures;
- time to resolve reports and disputes;
- discovery relevance and user-reported usefulness;
- accessibility and low-bandwidth completion rates;
- reduction in repeated setup and duplicate data entry;
- cross-product workflow success and recovery rate;
- user control over notifications, visibility and participation.

Avoid optimising for app opens, forced streaks, message volume, or time spent when those do not represent user benefit.
