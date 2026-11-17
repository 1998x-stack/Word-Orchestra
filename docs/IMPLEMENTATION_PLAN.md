# Word Orchestra — Phased Implementation Plan

## Delivery policy

Work in small vertical slices. Every phase must leave the default branch buildable, include tests for new behavior, update this plan and gotchas, and provide evidence. Do not mark a phase complete based on code inspection alone.

## Phase 0 — Engineering foundation and music interaction

**Goal:** establish the architecture and prove that focused English input can produce stable, low-latency musical feedback.

Scope:
- React + TypeScript + Vite application scaffold.
- Domain-first folder boundaries and dependency rules.
- Fixed letter-to-pentatonic note mapping with a mapping version.
- Web Audio adapter with lazy unlock, mute, envelope, and overlapping-voice cap.
- Focused input only; no global keyboard listeners.
- Responsive, accessible shell and minimal Copy/Recall practice flow.
- IndexedDB repository boundary and visible warning when persistence is unavailable.
- Unit/component tests, lint, typecheck, production build, and CI.

Acceptance gate:
- [x] Architecture, domain model, ADR, and phased plan documented.
- [x] React application shell and Copy/Recall vertical slice implemented.
- [x] Stable letter-to-note mapping and Web Audio adapter implemented.
- [x] IndexedDB session repository and progress view implemented.
- [x] Domain and component tests added.
- [ ] CI checks pass on the implementation branch.
- [ ] Real-browser audio, persistence, and accessibility checks completed.
- [ ] Dependency lockfile generated and committed.

## Phase 1 — Learning MVP hardening

**Goal:** turn the prototype into a useful daily learning product.

Scope:
- Curated A1–B1 vocabulary pack with source/license/review metadata.
- Separate form and meaning recall evidence.
- Review history and session result screen.
- Composition playback, collection, and deletion.
- Robust answer normalization and accepted-answer policy.
- Data export/import with schema validation.
- Keyboard accuracy aggregates, with no pressure/velocity claims.
- Accessibility and responsive layout audit.

Acceptance gate:
- Content pack passes schema and editorial checks.
- Learning progress is explainable from stored events.
- Export/import round-trip preserves records.
- Storage migrations have upgrade tests.
- Manual browser checks pass on current Chromium, Firefox, and Safari where available.

## Phase 2 — Listening, context, and spaced review

**Goal:** expand from spelling practice into multi-direction language learning.

Scope:
- Listen exercise with reviewed pronunciation audio and locale selection.
- Context exercise with validated answer variants.
- ReviewScheduler port and FSRS adapter.
- Due queue, delayed recall test, and 7/30-day outcome reporting.
- Independent adaptation for language and typing challenge.

Acceptance gate:
- Listening/context evidence is stored independently.
- Scheduler inputs exclude Copy-only attempts and answer-revealed attempts.
- Scheduling behavior is covered by deterministic tests.
- Delayed recall reports test coverage and does not overclaim causality.

## Phase 3 — Personal content and optional AI

**Goal:** support user-selected topics and documents without compromising content quality.

Scope:
- User text import and local extraction.
- Candidate vocabulary extraction and duplicate/sense resolution.
- Optional LLM candidate generation behind explicit opt-in.
- Dictionary/corpus validation and human review before publishing generated items.
- Clear privacy controls and data deletion.

Acceptance gate:
- Imported text remains local unless the user explicitly enables a remote provider.
- Unreviewed AI content cannot silently enter the default study queue.
- Provenance and license metadata remain attached.

## Phase 4 — Creative and social experiences

**Goal:** make compositions more expressive without turning learning into a competitive grind.

Scope:
- Additional licensed/in-house sound presets.
- Composition editing and export.
- Optional sharing and collaborative play.
- Social comparison is opt-in and can be disabled.

Acceptance gate:
- Every bundled audio asset has verified rights.
- Sharing exposes only content the user explicitly selected.
- No punitive streak or loss-aversion mechanic is introduced.

## Current execution order

1. Architecture documents and ADR.
2. Phase 0 foundation and first playable vertical slice.
3. Run CI and review the PR.
4. Fix all P0 issues found by tests/manual browser verification.
5. Generate and commit the npm dependency lockfile before merging.
6. Only then proceed to Phase 1 hardening.
