# Word Orchestra — Test Strategy

## 1. Test pyramid

| Level | What to test | Tool / status |
|---|---|---|
| Domain unit | Answer normalization, evidence rules, note mapping, deterministic word accents | Vitest — implemented |
| Adapter unit | IndexedDB CRUD and ordering; Web Audio scheduling/mute behavior | Vitest — IndexedDB implemented, AudioContext browser verification pending |
| Component | Practice mode selection, prompt rendering, focused input | Testing Library — initial coverage implemented |
| Browser E2E | Complete Copy/Recall flows, reload persistence, composition replay, no global capture | Playwright — planned |
| Manual | Audio quality/latency, Safari behavior, screen reader, keyboard-only use | Release checklist — not yet run |

## 2. Required invariants

- Copy mode cannot create recall evidence.
- A revealed answer cannot be graded as successful recall.
- Form and meaning recall are separate dimensions.
- Same letter and mapping version always yield the same note.
- A word accent is deterministic for the same word and start offset.
- Audio is unlocked only after a user gesture.
- Mute stops/rejects subsequent playback and releases active voices.
- No global keyboard listener observes text outside the focused practice field.
- Persistence failures are surfaced; the UI never reports unsaved data as saved.
- Reload restores completed sessions when storage is available.

## 3. CI checks

Every pull request must run:
1. Dependency installation with the currently pinned direct dependency versions.
2. ESLint.
3. TypeScript typecheck.
4. Unit and component tests.
5. Production build.

A package-lock file must be generated and committed before merge; after that, CI should switch from npm install to npm ci. Browser E2E can be a separate required job once the initial application shell is stable. Do not make the first pipeline flaky by relying on remote services or external audio assets.

## 4. Test data and determinism

- Extract and inject a clock and ID generator when application use cases are separated from the UI.
- Use fixed vocabulary fixtures with stable IDs.
- Avoid real timers and random seeds in domain tests.
- Use fake IndexedDB for repository tests.
- Stub AudioContext for adapter tests; measure real latency only in browser/device tests.
- Tests must not depend on network access.

## 5. Manual release checklist

- [ ] Chromium: Copy and Recall complete end to end.
- [ ] Firefox: input, audio unlock, mute, and persistence.
- [ ] Safari: audio unlock after gesture, no stuck AudioContext.
- [ ] Browser refresh: completed progress survives.
- [ ] Storage denied/private mode: visible warning; current exercise remains usable and is never reported as saved.
- [ ] Keyboard-only navigation and visible focus.
- [ ] Reduced-motion preference.
- [ ] Mobile viewport: controls remain usable; no horizontal overflow.
- [ ] No system-wide or background keyboard capture.
- [ ] No unlicensed bundled audio.
