# UNIBUD Academic Completeness Audit
Date: 2026-10-31
Repository: iamtheoracle/unibud-app
Audited branch: main
Audited HEAD: 3029a8761b5e42b3880f0392640abf377ba325a3
Audit branch: audit/academic-completeness-2026-10-31

## 1. Scope and evidence standard

This is a source-code and schema inventory, not a runtime certification. Findings below are grounded in the committed route tree, route/component source, server functions, SQL migrations, and the implementation handoff. No database was queried, no live browser session was exercised, and no automated test suite was run during this audit.

Status meanings:
- **Present in code**: a route, UI, function, or schema object exists.
- **Partial**: a basic path exists but lacks the full domain workflow or authoritative persistence.
- **Placeholder/demo**: seeded, local, static, sample, or simulated content/behaviour.
- **Missing in inspected schema/code**: not found in the inspected academic source and migrations; search across all product modules may still reveal adjacent functionality.
- **Unverified**: runtime behaviour or security enforcement has not been demonstrated.

## 2. Source-of-truth decision

The committed `UNIBUD_IMPLEMENTATION_HANDOFF.md` identifies `iamtheoracle/unibud-app` on `main` as the source of truth and says the old `iamtheoracle/unibud` repository is archive/reference only. This audit therefore treats `unibud-app` as authoritative. `unibud-live` is a comparison candidate only; do not merge or copy it without a file-by-file diff and ownership review.

The current main HEAD at audit time is `3029a8761b5e42b3880f0392640abf377ba325a3`. The handoff's prior SHA is historical and not the current HEAD.

Product constraints preserved:
- UNIBUD is an educational world/society, not merely an education app.
- Bud is the user-facing AI; Spark is hidden orchestration.
- Board is a distinct academic classroom environment, not a social feed.
- Bud Waves is not a user-facing destination/tab.
- Academic and social domains are tested independently, then together.
- No production deploy, merge, or destructive migration is authorized by this audit.

## 3. Route and navigation inventory

The route tree contains 478 repository paths overall. The relevant file-based TanStack routes include:

| Route file | User route / destination | Domain | Evidence/status |
|---|---|---|---|
| `src/routes/_app/studies.tsx` | `/studies` | Academic study planning | Present; partial |
| `src/routes/_app/board.tsx` | `/board` | Academic Board/classroom index | Present; partial |
| `src/routes/_app/board.$id.tsx` | `/board/$id` | Course Board detail | Present; partial |
| `src/routes/_app/news.tsx` | `/news` | Educational/campus news | Present; honest empty state |
| `src/routes/_app/editorial.tsx` | `/editorial` | Editorial review | Route present; runtime/workflow unverified |
| `src/routes/_app/tutor.tsx` | `/tutor` | Lecturer/Tutor Mode | Present; partial/demo controls |
| `src/routes/_app/communities.tsx` | `/communities` | Social/study communities | Present |
| `src/routes/_app/communities.$id.tsx` | `/communities/$id` | Community detail | Present |
| `src/routes/_app/communities/$communityId.tsx` | Nested community route candidate | Social | Duplicate/overlapping route pattern; resolve generated route-tree mapping |
| `src/routes/_app/connect.tsx` | `/connect` | Social graph/discovery | Present; UI uses demo/local catalog and store |
| `src/routes/_app/messages.tsx` | `/messages` | Chat list | Present |
| `src/routes/_app/messages.$id.tsx` | `/messages/$id` | Direct/group thread | Present; actual runtime must be verified |
| `src/routes/_app/index.tsx` | `/` | Square/social feed | Present |
| `src/routes/_app/social.tsx` | `/social` | Legacy alias | Redirects to `/` |
| `src/routes/_app/discovery.tsx` | `/discovery` | Legacy alias | Redirects to `/` |
| `src/routes/_app/search.tsx` | `/search` | Cross-domain discovery | Present; scope and source coverage unverified |
| `src/routes/_app/profile.tsx`, `u.$handle.tsx` | `/profile`, `/u/$handle` | Identity/profile | Present; academic credential verification unverified |
| `src/routes/_app/notifications.tsx` | `/notifications` | Cross-domain alerts | Present; event coverage unverified |

Additional app routes visible in the tree include Bud, Bud communities/fixer, Market, Sell, Money, Riff, Spill, Watch, Podcasts, Live, Saved, Settings, Welcome, Help, Feedback, Creator and media detail routes. These are not substitutes for missing academic workflows.

### Navigation evidence

`src/components/shell/primary-nav.tsx` defines only Square, Connect, Quad (communities), and Chat as primary navigation. Board is intentionally not a permanent primary slot, consistent with the handoff. Studies, News, Board, Tutor, and Editorial therefore need clear contextual entry points (e.g. academic home/academic hub, Square contextual cards, search, profile/campus context, or settings where appropriate). The audit has not yet verified every actual inbound link or mobile navigation state.

**Navigation defect to resolve:** the academic destinations exist as routes, but there is no evidence in the inspected primary navigation of a single, clearly named Academic/Academy hub that organizes News, Studies, Board, Results, Registry, Opportunities and academic profiles. Do not solve this by putting academic services under social media. Design a distinct academic information architecture while preserving contextual navigation principles.

## 4. Academic data-model inventory

### 4.1 Existing academic-related persistence

| Migration/table | Fields/purpose evidenced | Assessment |
|---|---|---|
| `0002_unibud.sql: universities` | id, name, short_name, city | Very thin institution directory; no country, official identifiers, accreditation, institution type, source provenance or status |
| `0002_unibud.sql: courses` | user_id, session_label, semester, title, code | Personal study course records; no canonical institution/programme foreign key |
| `0002_unibud.sql: study_materials` | user_id, course_id, title, kind | Basic material metadata; no version, file/source lifecycle, access scope or integrity metadata in this table |
| `0002_unibud.sql: study_sessions` | user_id, course_id, title, starts_at, minutes | Personal study blocks, not authoritative teaching timetable |
| `0008_academic.sql: enrollments` | user_id, course_code/title, semester, session_label | Basic enrolment record; no institution/programme/section/approval/status/history |
| `0008_academic.sql: board_announcements` | course_code, author_id, title/body, created_at | Basic announcements; no audience scope, author role evidence, moderation/approval or read receipts |
| `0008_academic.sql: attendance_events` | session_id, user_id, kind, created_at | Event log; no authoritative session/roster FK, uniqueness, correction/audit workflow or verified presence source |
| `0008_academic.sql: class_questions` | session_id, user_id, body, created_at | Basic class questions; no answer/status/moderation/thread model |
| `0011_editorial_review.sql: story_candidates` | publisher/source URL, published/retrieved dates, category, country/institution, evidence JSON, editorial status, reviewer and freshness fields | Useful editorial candidate/review foundation; not yet proof of source retrieval or publication workflow completeness |
| `0011_editorial_review.sql: story_review_events` | candidate, reviewer, action, note, checks, created_at | Review event trail foundation |
| `0011_editorial_review.sql: editorial_reviewers` | user_id, display_name, active | Reviewer registry foundation |

Additional academic-adjacent persistence exists in media/Bud objects and community membership, but does not establish a canonical academic record system.

### 4.2 Existing in-code academic catalogue

`src/lib/unibud/academic.ts` defines AcademicCourse, FACULTIES, LEVELS, PROGRAMMES and a hard-coded COURSE_CATALOGUE. It includes sample faculties/programmes and course-specific lecturer, syllabus topics, objectives, materials, assessments and exam labels. This is useful as a UI prototype but is not a global or institution-backed registry. The programme/faculty lists are static and currently narrow.

`src/lib/unibud/board-data.ts` contains five static BoardSessions with statuses and dynamic relative timestamps. This is demo schedule data, not a persisted official timetable. It must never be shown as real current class activity unless replaced by real session data.

`src/lib/unibud/news-data.ts` deliberately exports an empty EDUCATIONAL_NEWS array. This is a good truthfulness improvement: no fabricated cards. It means the user-facing news ingestion/publication pipeline is not yet providing live verified stories.

### 4.3 Important academic models not found in inspected academic migrations

The following are not represented in `0008_academic.sql` or the inspected academic server functions. They may exist elsewhere but need explicit proof before being considered implemented:

- Country/system-specific academic taxonomy and source-backed institution registry.
- Institution campuses, official IDs, regulator/accreditation history and source snapshots.
- Faculties/schools, departments, programmes, programme versions, levels, course units and prerequisites with canonical foreign keys.
- Academic sessions/terms, section/class groups, teaching assignments and verified lecturer/institution relationships.
- Results, grade components, grading scales, GPA/CGPA calculation policies, transcripts, publication/appeal/correction history and student-only access controls.
- Examination schedules, venues, seat/eligibility data, clash detection and timetable change history.
- Official institution notices with provenance, issuer identity, signatures/verification, expiry, correction and retraction.
- Scholarships/admissions/opportunities with eligibility, deadlines, source links, status and deduplication.
- Student academic profiles with privacy controls and verifiable institution/programme affiliation.
- Research projects, supervisors, publications, repositories and research group memberships.
- Academic document vault, document verification, consent and retention rules.
- Course assessment submissions, marks, feedback, rubrics and grade release controls.
- Academic calendar and deadline subscriptions.
- Timetable and result notifications tied to authoritative records.

No results/transcript model was found in the academic migration or `src/lib/academic/server.ts` inspected. Treat Results as **missing in inspected implementation**, not complete.

## 5. Server-operation and user-journey inventory

### Present operations

`src/lib/academic/server.ts`:
- `listEnrollments`, `enrollCourse`, `dropCourse`
- `postAnnouncement`, `listAnnouncements`
- `logAttendance`, `listAttendance`
- `askInClass`, `listClassQuestions`

These are authenticated server functions. However, authorization is not consistently tied to institution/course membership and teaching assignment in the inspected functions. For example, posting an announcement takes a course code and current user but does not itself demonstrate a lecturer/course-role authorization check. Listing attendance/questions is session-ID based and must be checked for class membership/role enforcement. Treat this as a security-critical review item.

`src/lib/studies/server.ts`:
- `getStudies`
- `seedSampleSemester`
- `addCourse`
- `addMaterial`
- `addStudySession`

These functions scope reads to the authenticated user and check course ownership before adding materials or study sessions. Sample semester seeding is explicitly a demo pathway. The add-course function accepts arbitrary course title/code rather than binding to a verified canonical catalogue.

### Journey inventory and current evidence

| Journey | Current code evidence | Audit status / gap |
|---|---|---|
| Choose institution/faculty/programme/level/semester | Studies UI selectors, static catalogues | Partial; static and not institution-specific |
| Browse course catalogue | `coursesFor` and static catalogue | Placeholder/prototype; not authoritative |
| Enrol/drop course | Server functions and UI mutations | Partial; needs institution/term/section validation and role/status model |
| Add personal course/material/study block | Studies server functions | Present basic path; verify validation, upload/access and update/delete paths |
| Open Board for course | Board index/detail routes | Partial; course mapping static and some session content seeded |
| Join/leave live class | Board detail calls attendance logger and local Zustand state | Partial; no durable live session lifecycle/provider evidence; reconcile local and server state |
| Ask class question | Server insert/list | Partial; no moderation/answers/authorization demonstrated |
| Lecturer posts announcement | Server insert/list | Partial; role/teaching assignment authorization not shown in this function |
| Lecturer opens Tutor Mode | Tutor route calls requireLecturer | Partial; UI toggle is client state and tiles include demo/simulated controls |
| Watch recording | Static Board session status and local state | Placeholder until real media processing/storage and playback state are connected |
| Read Educational News | Empty array + honest empty state + source directory | Truthful but content pipeline not operational end-to-end |
| Submit/review editorial candidate | Tables and editorial route exist | Partial/unverified; no end-to-end reviewer permissions and publish-to-news read path demonstrated |
| View results/transcript | No route or academic result model identified | Missing in inspected implementation |
| Find campus news | News category includes campus but no separate source-backed campus feed model | Partial/missing ingestion and institution scoping |
| Find scholarships/admissions | News category filters exist, no dedicated opportunities schema/workflow identified | Partial |
| Academic profile / verified lecturer/student | General profiles and directory people exist | Academic affiliation verification and privacy controls unverified |
| Connect with classmate and chat | Connect + messages routes; new social schema exists | UI may still use local/demo store; confirm migration callers before assuming durable schema is live |
| Join study community | Communities routes and membership table exist | Integration with verified course enrolment and academic identity unverified |
| Receive academic notifications | General notifications table and notify call in announcements | Partial; event taxonomy, preferences, delivery and deduplication unverified |

## 6. Social integration boundary

`migrations/0012_social_graph_and_messaging.sql` introduces durable foundations:
- `social_connections` with pending/accepted/declined/cancelled states.
- `social_blocks`.
- `social_conversations` and participant membership.
- `social_messages` with media/share support, edit/delete timestamps and client idempotency.
- `social_message_receipts`.
- `social_reports`.
- `social_presence` with expiry.

Crucial migration comment: existing demo conversations/messages are intentionally untouched; application callers must migrate before switching reads/writes to these tables. Therefore schema presence does not prove production social flows use durable records.

The Connect UI inspected uses `PEOPLE` and `useCampusStore` for incoming/outgoing/connections/following/followers, indicating a demo/local-state dependency in that surface. Confirm all server-backed replacements before treating connection requests as durable.

Integration must not make academic permissions inherit social friendship. Being connected to a student must not grant access to grades, private class rosters, attendance, unpublished notices or academic records. Conversely, being enrolled in a course should not silently create a social connection or permit unsolicited DMs. Use explicit relationship and privacy policy.

## 7. Prioritized defect register

Priority definitions: P0 = security/data integrity blocker; P1 = core product completeness blocker; P2 = major workflow gap; P3 = polish/operational enhancement.

| ID | Priority | Defect / risk | Evidence | Required correction |
|---|---|---|---|---|
| A-01 | P0 | Academic server operations do not visibly enforce lecturer assignment/course membership for announcement writes or role-scoped access for attendance/questions | `src/lib/academic/server.ts` | Central authorization policies using institution membership, enrolment, teaching assignment and session role; negative tests for cross-user/cross-course access |
| A-02 | P0 | Results/transcripts are absent from inspected academic schema and route inventory | Migrations 0001-0012; route tree; academic server | Design privacy-first result model, grading policy versioning, release controls, audit trail, appeals/corrections; do not fabricate result data |
| A-03 | P0 | Social schema is not yet proven to be wired into app callers; migration itself says callers must migrate | `0012_social_graph_and_messaging.sql` | Verify and migrate API/service callers; add end-to-end persistence, block enforcement, membership checks, idempotency and receipts |
| A-04 | P1 | Canonical academic registry is not represented by current thin university table/static catalogue | `0002_unibud.sql`, `academic.ts` | Country-specific registry schema with stable identifiers, campuses, provider sources, accreditation and taxonomy provenance |
| A-05 | P1 | Board timetable/live sessions are static seeded objects rather than authoritative persisted sessions | `board-data.ts`, Board routes | Persist terms, courses, sections, session lifecycle, lecturer assignment, recordings and attendance reconciliation |
| A-06 | P1 | Studies and Board use two overlapping course concepts (`courses` and `enrollments`) without canonical linkage | migrations 0002/0008 and two server modules | Establish canonical course offering and enrolment entities; define migration/ownership and prevent duplicate/conflicting records |
| A-07 | P1 | Academic navigation is fragmented; no clearly evidenced academic hub consolidates core destinations | Primary nav + route tree | Add a first-class Academic/Academy landing experience with well-categorized destinations and contextual links |
| A-08 | P1 | Editorial review tables and route do not prove an end-to-end approved-news publication path | migrations 0011, news-data empty array, editorial route | Wire ingestion → source evidence → review → approval → published feed → expiry/correction/retraction with audit trail |
| A-09 | P1 | Academic/campus news are currently empty; no live verified source ingestion path demonstrated | `news-data.ts`, `news.tsx`, handoff | Connect trusted source retrieval and human review; show freshness/source/issuer labels and honest empty/error states |
| A-10 | P1 | Course and programme catalogues are hard-coded and geographically narrow | `academic.ts`, Studies route | Replace static catalog with institution-scoped registry queries; preserve country-specific taxonomy |
| A-11 | P1 | Academic profile verification and official affiliation are not demonstrated | `student_profiles`, `directory_people` | Add claims/verification workflow, evidence, verifier, expiry, privacy and institution-controlled roles |
| A-12 | P1 | Tutor Mode UI toggle may be separate from server authorization; demo controls and hard-coded session list remain | `tutor.tsx` | Server-authoritative permissions on every action; real create/manage/publish operations or explicitly disabled unavailable controls |
| A-13 | P2 | Attendance is event-based without explicit deduplication, authoritative roster/session FK or correction procedure | `0008_academic.sql` | Define check-in policy, duplicate/idempotency, lecturer correction, dispute audit and data retention |
| A-14 | P2 | Study materials lack evidenced content lifecycle and rich metadata | `study_materials` table + server | Add storage references, checksums, versions, visibility, ownership, malware scan status and deletion policy |
| A-15 | P2 | Scholarship/admission/opportunity taxonomy has categories but no dedicated lifecycle/eligibility model identified | News route/schema | Model provider, eligibility, deadlines/time zones, application link, status, source and expiry |
| A-16 | P2 | Search and notifications cross academic/social domains without proven access-aware filtering | routes + notifications table | Add scoped search index, permission filtering, subscriptions/preferences and notification provenance |
| A-17 | P2 | Community membership is not proven to synchronize with verified course enrolment | communities + enrollments | Provide explicit optional course-community association and lifecycle; no automatic DMs |
| A-18 | P2 | Runtime route correctness, responsive navigation and cross-domain journeys have not been exercised | Handoff explicitly marks some runtime checks unverified | Add browser E2E tests for direct/group chat, Board, Studies, News, mobile contextual nav and deep links |

## 8. Implementation plan

### Phase 0 — Freeze evidence and unblock CI
1. Preserve main; work only on an audit/implementation branch.
2. Resolve the documented lockfile inconsistency using the repository's npm version in a controlled environment. Do not bypass `npm ci`.
3. Establish baseline typecheck, lint, unit tests and production build; record exact results.
4. Verify generated TanStack route tree and actual route rendering before navigation refactors.

### Phase 1 — Authorization and data integrity
1. Add shared policy functions for institution membership, enrolment, lecturer assignment, course role and session role.
2. Apply policies to every academic server operation; enforce user scoping and deny-by-default.
3. Add cross-user, cross-course, unassigned lecturer, blocked-user and unauthorized-roster negative tests.
4. Add idempotency and audit trails for attendance and critical academic mutations.
5. Confirm social schema callers are migrated before treating new social tables as live.

### Phase 2 — Academic domain model and registry
1. Define canonical country/system/institution/campus hierarchy with source-backed identifiers.
2. Model institution-specific faculties/schools, departments, programmes, versions, levels, courses and course offerings.
3. Define terms, sections, enrolment states, teaching assignments and academic calendars.
4. Link Studies, Board, tutor assignments and communities through canonical IDs; plan a safe backfill from legacy course tables.
5. Build data-source ingestion, provenance, reconciliation and human verification workflow.

### Phase 3 — Academic hub and complete journeys
1. Create a dedicated Academic/Academy landing page and information architecture.
2. Organize News, Campus News, Studies, Board, Results, Examinations, Registry, Profiles, Opportunities, Research and Documents.
3. Implement results/transcripts with institution-specific grading policies, controlled publication, student access, appeals/corrections and immutable audit events.
4. Implement authoritative timetable, exam scheduling, clash checks, venues, eligibility and updates.
5. Complete lecturer workflows: assigned classes, announcements, materials, session creation, attendance and review.
6. Complete student workflows: institution verification, enrolment, timetable, study materials, class participation, results and support.
7. Connect editorial candidate approval to the published educational/campus news feed.

### Phase 4 — Social integration without domain leakage
1. Migrate Connect and Chat from local/demo state to durable social APIs.
2. Enforce blocks and privacy in discovery, messaging, community membership and notifications.
3. Make course communities explicitly associated with academic offerings, but keep membership and social relationships distinct.
4. Add contextual actions from academic surfaces: connect, message, form a study group, share a course resource.
5. Ensure social relationships never grant access to private academic records; academic enrolment never implies consent to social contact.

### Phase 5 — Test gates and rollout readiness
- Academic suite passes independently.
- Social suite passes independently.
- Combined suite passes cross-domain scenarios.
- Security tests prove tenant/user/course isolation.
- E2E tests cover desktop and mobile navigation, deep links, loading/empty/error states and session expiry.
- Data migration tested against a copy/fixture and has rollback/backup plan.
- Accessibility, performance, privacy retention and observability reviewed.
- No production enablement of official records or real-time academic claims until the source integrations, permissions and acceptance tests pass.

## 9. Required acceptance journeys

### Academic-only acceptance
1. New student signs up and chooses institution/campus.
2. Student finds their programme using the institution's actual taxonomy.
3. Student enrols in valid courses for the correct session/term.
4. Student sees their timetable and authoritative deadlines.
5. Student opens the correct Board course and sees only authorized class content.
6. Lecturer assigned to that course publishes an announcement; unassigned lecturer is denied.
7. Student joins/leaves a real session; attendance is reconciled and auditable.
8. Student asks a class question; lecturer can answer/moderate it.
9. Student receives an official notice with source, issuer, timestamp and expiry.
10. Student sees only their own released results/transcript; another student cannot access them.
11. Student disputes a result; correction history is preserved.
12. Student discovers an eligible scholarship/admission opportunity with real source and deadline.

### Social-only acceptance
1. User discovers another user with permitted visibility.
2. User sends, accepts, declines and cancels a connection request.
3. User blocks another user; both discovery and messaging restrictions apply.
4. User starts a permitted direct conversation and sends text/media.
5. User sends duplicate client message IDs; only one message persists.
6. Read/delivery receipts, edit/delete and group membership behave correctly.
7. User reports abusive content and sees a clear report state.

### Integrated acceptance
1. Student discovers a course peer from the Board roster only where roster visibility allows it.
2. Student may choose to connect; no automatic connection is created.
3. A course community link is available only to eligible participants or its configured public audience.
4. Official Board announcements generate appropriately scoped notifications.
5. Social posts discussing results cannot alter or masquerade as official results.
6. Blocking a user does not remove that user's official academic records or change grades, but prevents prohibited social contact.
7. Search results respect academic record permissions and social privacy separately.
8. Bud can explain academic material but cannot invent official results, enrolment state, notices or institutional policy.
9. Academic outages do not disable ordinary chat; social outages do not hide official academic information.
10. Each domain reports its own degraded state rather than masking another domain's failure.

## 10. Audit limitations and next engineering actions

- This deliverable is source-backed but not a full runtime audit.
- The current repository handoff reports CI is blocked by a lockfile inconsistency. That must be repaired before tests can establish a reliable baseline.
- No database migration was applied and no live data was inspected.
- No route was modified and no application feature was implemented by this audit.
- The first implementation sequence should be Phase 0 then Phase 1. Do not build out results UI on top of an unapproved or insecure record model.
- The global academic registry is a separate data-quality project and should be designed to accept country-specific systems rather than force a single global taxonomy.

## 11. Shared LLM platform boundary

UNIBUD is one client of the broader Oracle Arc intelligence platform. The LLM platform must remain product-neutral and support multiple independent applications, including future 18+ products, through:
- tenant/application-scoped credentials and capability grants;
- hard data isolation for identity, memory, conversations, files and audit records;
- per-application policy and age-gating integrations;
- separate safety/moderation and legal configuration;
- versioned APIs, provider abstraction, usage metering and revocation;
- no implicit sharing of UNIBUD academic data with other applications or their agents.

The application—not the LLM prompt alone—must enforce age, identity, consent, privacy, payment and content-access rules. This audit does not authorize combining product data or relaxing safety controls.
