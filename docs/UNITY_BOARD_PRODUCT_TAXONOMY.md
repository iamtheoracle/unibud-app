# Unity Board Product Taxonomy and Mini-App Inventory

Status: working product plan; repository reconciliation required before implementation or rebranding.

## Goals

- Make Unity Board feel like one coherent ecosystem, not a crowded launcher of unrelated mini-apps.
- Keep News and Discover as separate destinations with distinct purposes.
- Treat Sports, Music, and Movies as first-class experiences that still need implementation and verification.
- Build Flow, Wayward, and SOULYNC independently, then integrate them through agreed contracts.
- Treat Bud Waves as an internal implementation concept, not a visible app, route, or navigation item.
- Preserve useful existing functionality; do not delete or rename code based on a label alone.

## Product families

### 1. Social and Community
- Square — primary home/overview
- Connect — people and connections
- Communities — groups and shared interests
- Chat — direct and group conversations
- Board — community discussions (confirm distinction from academic Board)
- Profile / Me — identity and personal presence
- Stories / Bud Stories — personal and community stories; determine whether these are one feature or separate products

### 2. News and Information
- News — current affairs, reporting, and announcements; separate from Discover
- Search — platform-wide search
- Trending — can be a feature within News and Discover rather than a separate top-level destination
- Notifications — activity and important updates

### 3. Discovery and Culture
- Discover — explore people, interests, communities, content, places, and experiences; separate from News
- Riff — existing named music/audio experience; audit current scope
- Screen — proposed working name for Movies and TV; not a confirmed rename
- Art & Culture — art, photography, design, and cultural discovery
- Books & Reading — reading lists, authors, and literary communities
- Creator Studio — content creation/publishing
- Camera — capture and creation
- Drop — existing named sharing experience; audit current scope

### 4. Sports, Gaming, and Live Experiences
- Arena — proposed working name for Sports; not a confirmed rename
- Sports sections — football, basketball, tennis, and other sports should be categories within Arena unless audit reveals a strong reason otherwise
- Gaming — game discovery and gaming communities
- Esports — likely a Gaming section unless current implementation requires a distinct destination
- Events / Live Experiences — matches, concerts, campus events, watch parties, and activities; determine whether one shared events hub serves these needs

### 5. Marketplace and Services
- Market — marketplace entry point; existing docs may use this name
- The Quarter — preserve as an existing named concept until its code and purpose are verified
- Concierge — assistance and service discovery
- Places — venues and local experiences
- Events — event discovery and planning, subject to reconciliation with Live Experiences
- Travel — destinations, guides, and travel experiences
- Food & Dining — consider a section within Places/Discover before creating a separate top-level app

### 6. Education and Productivity
- Board / Academy — academic/classroom environment; verify relationship to community Board
- Studies / Learning — study resources and explainers
- Campus — campus life and student activities
- Planner / Calendar — schedules, deadlines, and tasks
- Workspace / Projects — projects and collaboration
- Bud — user-facing AI assistant; follow existing implementation guidance
- Flow — independent application to build first

### 7. Personal, Trust, and Account
- Wayward — independent application to build second
- SOULYNC — independent application to build third; spelling is SOULYNC
- Bank — existing named financial area; verify scope, safety, and dependencies
- Verification & Trust — verification, blocking, reporting, and safety controls
- Saved Items / Collections — bookmarks and collections
- Settings & Privacy
- Help & Support
- Admin & Operations — privileged internal workflows, not a default user-facing mini-app

## Shared platform capabilities (not mini-apps)

- Bud Waves: internal implementation concept only; not visible in navigation and not a user destination.
- Spark/orchestration and other internal agent coordination, as defined by existing architecture.
- Shared identity, authorization, privacy, audit logging, notifications, search infrastructure, APIs/events, feature flags, observability, and integration adapters.
- Future engines, plugins, and high-level agents should be developed after the app boundaries and contracts are stable.

## Naming and brand recommendations (provisional)

| Existing concept | Working display name | Status |
| --- | --- | --- |
| Music | Riff | Preserve existing name; audit and improve |
| Movies / TV | Screen | Proposed; validate against code, brand system, and routes |
| Sports | Arena | Proposed; validate against code, brand system, and routes |
| News Board | News | Simplify display label if consistent with current product |
| Discovery | Discover | Proposed label refinement; keep separate from News |
| Marketplace | Market | Align with existing product vocabulary where accurate |
| Gaming + Esports | Gaming / Play | Choose one umbrella after repository audit |
| Concierge | Concierge | Keep pending audit |
| The Quarter | The Quarter | Keep pending audit |
| Bud Waves | No visible destination | Internal capability only; preserve useful code after inspection |

Do not rename routes, database entities, package names, or persisted identifiers solely because a display name changes. Map legacy routes and add redirects/compatibility where needed.

## Repository audit and implementation sequence

1. Inspect the source-of-truth documentation, routes, navigation, components, entities/data models, API handlers, integrations, tests, and deployment configuration in `unibud-app` and `unibud-live`.
2. Compare `arc-project-one`, `arc-project-two`, and relevant `soulync` / `board-workspace` snapshots when accessible. Identify unique features and conflicts before merging anything.
3. Build a canonical inventory with one row per actual route/module: current name, route/path, repository, purpose, code owner, status (working / partial / placeholder / blocked / absent), dependencies, test evidence, and recommended action.
4. Reconcile duplicate concepts, especially community Board vs academic Board; Stories vs Bud Stories; Market vs The Quarter; Events vs Live Experiences; Discover vs News; and Gaming vs Esports.
5. Define stable integration contracts and shared design tokens without forcing every product into the same UI.
6. Build and verify Flow independently.
7. Build and verify Wayward independently.
8. Build and verify SOULYNC independently.
9. Integrate the apps and hubs; test desktop/mobile journeys, navigation, permissions, data boundaries, and failure states.
10. Only then expand shared engines, plugins, and advanced agents.

## Quality gates

For every app/hub, verify:
- intended routes and navigation exist and are reachable;
- core workflows use real logic, not decorative controls;
- persistence, loading, empty, error, and permission states are handled;
- responsive layout and accessibility basics are checked;
- tests, lint/type checks where available, and production build pass;
- external-provider requirements and unsupported functionality are clearly labelled;
- integration contract and ownership are documented.

## Guardrails

- This taxonomy is a planning artifact, not proof that every proposed item exists in code.
- Every area needs attention at the start; do not mark any hub complete without evidence.
- Do not create a separate top-level mini-app for every genre or content type by default.
- Do not claim a build, browser audit, deployment, or provider integration passed unless it was actually run and verified.
- Preserve unique work and current UI/UX strengths while reconciling the best implementation across repositories.
