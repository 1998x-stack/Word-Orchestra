# ADR-0001: Local-first modular web architecture

- **Status:** Accepted for MVP
- **Date:** 2026-11-17
- **Decision owners:** Word Orchestra maintainers

## Context

Word Orchestra needs responsive keyboard-to-audio feedback and trustworthy learning records. The initial product is a solo learning tool; accounts, shared data, and remote AI are not prerequisites. The repository has no legacy runtime to preserve.

## Decision

Build the MVP as a React + TypeScript + Vite browser application with:
- framework-independent learning and music domain modules;
- application use cases coordinating those modules;
- ports for audio and persistence;
- Web Audio API and IndexedDB adapters;
- bundled, reviewed vocabulary content;
- local-first operation without an application server.

## Consequences

### Positive
- Audio feedback does not depend on network round trips.
- A user can begin without an account or API key.
- Domain invariants can be tested without rendering React or opening a browser.
- Persistence/audio implementations can be replaced without rewriting learning rules.
- Privacy boundaries are easier to inspect and verify.

### Negative
- Data is initially tied to the browser/device unless the user exports it.
- IndexedDB lifecycle and migration behavior must be tested.
- Cross-device sync and collaborative features require a later backend design.
- Browser audio behavior varies and requires real-browser validation.

## Alternatives considered

1. **Full-stack application from day one:** rejected because accounts, APIs, and deployment would delay validation of the core learning/music loop.
2. **Desktop-only app:** rejected because the product benefits from frictionless browser access and does not initially need privileged keyboard access.
3. **Single React component with localStorage:** rejected because it couples learning rules, UI, audio, and persistence, making mastery correctness hard to test.
4. **Global keyboard listener:** rejected for privacy, focus, and accessibility reasons.

## Revisit when

- cross-device sync becomes a validated user requirement;
- content volume or query patterns exceed IndexedDB's practical constraints;
- collaboration or shared classrooms become a product requirement;
- measured browser limitations make a desktop wrapper necessary.
