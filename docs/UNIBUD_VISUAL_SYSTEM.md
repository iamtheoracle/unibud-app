# UNIBUD visual system — reference-led refinement

Status: Proposed implementation baseline
Target: `iamtheoracle/unibud-app`
Branch: `feat/unibud-reference-led-visual-system`

## Authority and scope

1. Current founder-approved UNIBUD product decisions and boundaries are authoritative.
2. Existing application behavior, routes, authentication, data contracts and the committed UNIBUD visual identity must be preserved unless a specific change is separately approved.
3. The supplied Instagram, Oracle and Wealthsimple UI references are visual inspiration only. They do not authorize copying another product, renaming UNIBUD spaces, merging spaces, or changing navigation and product architecture.
4. This work is a visual refinement, not a claim that every listed space or capability is implemented.

## Visual direction

Create one coherent UNIBUD design language with distinct space-level expression:

- Editorial clarity: generous but disciplined spacing, clear typographic hierarchy, concise labels and calm information density, drawing from the Wealthsimple reference.
- Product depth: deliberate contrast, strong section headings, layered surfaces and occasional immersive dark sections, drawing from the Oracle reference without importing its branding.
- Familiar mobile interaction: clear identity, compact media previews, accessible touch targets and predictable contextual actions, drawing from the Instagram reference without creating an Instagram clone or making a generic social feed the whole product.
- Existing UNIBUD identity: retain the current DM Sans and Newsreader typography pairing, the existing light neutral surfaces and lavender Bud accent unless a separately approved brand decision changes them.

## Design tokens

The existing tokens in `src/styles.css` remain the compatibility baseline:

- Background: `#f7f7f8`
- Foreground: `#111114`
- Card: `#ffffff`
- Accent / Bud: `#6d5ef6`
- Display type: Newsreader
- Interface type: DM Sans

Refinements should be additive and semantic. Do not globally replace the palette or apply dark mode to every space merely because one reference is dark. Dark/immersive surfaces are appropriate only where the existing space experience supports them.

## Layout and interaction rules

- Preserve the existing mobile-first application shell and its contextual navigation behavior. Do not introduce a permanent desktop-style left rail or permanent bottom tab bar as a substitute.
- Keep existing contextual header, search, notification, side-menu, Bud entry point, studio and route behavior intact while refining presentation.
- Use responsive content widths, readable line lengths, consistent spacing, stable card geometry and intentional empty/loading/error states.
- Keep controls keyboard reachable, visibly focusable, semantically labelled and large enough for touch.
- Use motion sparingly and respect reduced-motion preferences.
- Media previews must preserve source, rights, freshness and availability truth. Do not use fabricated activity, counts, people, catalogue entries, provider connections or generated content as production data.

## Space boundaries

Each founder-approved space retains its own purpose, route ownership, permission boundary and lifecycle. A shared design system is not a shared product surface.

- Bud remains the user-facing AI experience and contextual companion; it is not a universal admin or data-access shortcut.
- Board remains distinct from Bud.
- Connect, Quad, Square, SouLync, Riff, Wayward, Lync, The Quarter, Flow, Concierge and Fixer retain their separate boundaries and approved names.
- SouLync remains age-safe and consent-governed.
- Fixer remains consent-based human/professional support matching, not software bug repair.
- Operations remains internal-only.
- Oracle Arc remains a separate governed AI core, not a consumer navigation destination or a Bud rebrand.
- Financial information in Flow must reflect verified institution/provider evidence only; no invented balances, transactions, provider states or execution claims.

## Implementation sequence

1. Audit the current shell, route ownership, space components, tokens and existing responsive behavior before changing them.
2. Introduce shared semantic tokens and reusable presentation primitives additively.
3. Refine the application shell and one representative existing surface without changing route or data behavior.
4. Validate desktop and mobile rendering, keyboard/focus behavior, loading/empty/error states, and existing route behavior.
5. Apply the shared primitives to each space independently, only where its existing behavior and approved contract are understood.
6. Run repository typecheck, lint, tests, production build and browser smoke checks. Report every result exactly; do not claim checks that were not run.
7. Keep this work on a feature branch and in an unmerged PR until reviewed and explicitly approved.

## Non-goals

- No product taxonomy rewrite based on stale README or legacy app descriptions.
- No removal, renaming, merging or redefinition of spaces.
- No new permanent navigation model.
- No new provider, payment, AI, media or external integration claims.
- No database, authentication, authorization or financial behavior changes as part of a visual-only pass.
- No deployment or merge without explicit founder authorization.
