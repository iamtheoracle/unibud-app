# Base44 Dev Environment

## Stack
TanStack Start + React (Vite dev server on port 8080), Better Auth, Postgres (Neon in production; local Postgres in compose for dev).

## Running
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
- **db** — postgres:16-alpine with healthcheck.
- **app** — node:22-slim, bind-mounts the repo, runs `npm install && npm run db:migrate && npm run dev`.
- Port 3000 → container 8080 (Vite dev server).

## Key facts
- `DATABASE_URL` is **required** — `src/lib/db.ts` throws at import time without it. The compose file provides a local Postgres URL.
- `VITE_AUTH_ENABLED=false` is set in compose so the app boots with a shared dev user (no sign-in needed for browsing). Auth-protected server functions (posting, liking, Bud chat) will throw a fail-closed error in this mode — that is intentional (a shared dev user must not write to a real database).
- To enable real sign-in: remove `VITE_AUTH_ENABLED=false` from compose and set `BETTER_AUTH_URL=https://3000-${BASE44_PUBLIC_HOST_SUFFIX}` so Better Auth's `trustedOrigins` accepts the preview origin. Email/password is already enabled (`src/lib/auth/email-password.ts`).
- `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed bare from the platform env so Vite accepts the preview's external hostname.
- `XAI_API_KEY` is optional — Bud AI falls back to a free canned reply without it.

## Migrations
`npm run db:migrate` applies SQL files in `migrations/` (non-recursive) to the Postgres database. Idempotent via a `_migrations` tracking table. The app also auto-seeds catalog data on first load (`ensureCatalogSeed` in `src/lib/unibud/seed.ts`).

## Verify
```bash
curl -sf http://localhost:3000/ | head -5
```
The Square (home) page should render with seeded university, community, and post data.
