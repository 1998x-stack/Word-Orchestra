# Word Orchestra — Test Strategy

## 1. Test pyramid

| Level | What to test | Tool |
|---|---|---|
| Domain unit | Answer normalization, evidence rules, note mapping, motif determinism, session transitions | Vitest |
| Adapter unit | Audio scheduling contract, IndexedDB CRUD/migrations/fallback | Vitest + fakes |
| Component | Prompt, input, feedback, mode switching, mute and progress rendering | Testing Library |
| Browser E2E | Complete Copy/Recall flows, reload persistence, composition replay, no global capture | Playwright (introduced with browser test phase) |
| Manual | Audio quality/latency, Safari behavior, screen reader, keyboard-only use | Documented checklist |

## 2. Required invariants

- Copy mode cannot create recall evidence.
- A revealed answer cannot be graded as successful recall.
- Form and meaning recall are separate dimensions.
- Same letter and mapping version always yield the same note.
- A word motif is deterministic for the same item/preset/mapping version.
- Audio is unlocked only after a user gesture.
- Mute stops/rejects subsequent playback and releases active voices.
- No global keyboard listener observes text outside the focused practice field.
- Persistence failures are surfaced; the UI never reports unsaved data as saved.
- Reload restores completed sessions when storage is available.

## 3. CI checks

Every pull request must run:
1. Dependency installation from lockfile.
2. Formatting/lint checks.
3. TypeScript typecheck.
4. Unit and component tests.
5. Production build.

Browser E2E can be a separate required job once the initial application shell is stable. Do not make the first pipeline flaky by relying on remote services or external audio assets.

## 4. Test data and determinism

- Inject a clock and ID generator into application services.
- Use fixed vocabulary fixtures with stable IDs.
- Avoid real timers and random seeds in domain tests.
- Use fake IndexedDB for repository tests.
- Stub AudioContext for unit tests; measure real latency only in browser/device tests.
- Tests must not depend on network access.

## 5. Manual release checklist

- [ ] Chromium: Copy and Recall complete end to end.
- [ ] Firefox: input, audio unlock, mute, and persistence.
- [ ] Safari: audio unlock after gesture, no stuck AudioContext.
- [ ] Browser refresh: completed progress survives.
- [ ] Storage denied/private mode: visible warning and safe in-memory fallback.
- [ ] Keyboard-only navigation and visible focus.
- [ ] Reduced-motion preference.
- [ ] Mobile viewport: controls remain usable; no horizontal overflow.
- [ ] No system-wide or background keyboard capture.
- [ ] No unlicensed bundled audio.
