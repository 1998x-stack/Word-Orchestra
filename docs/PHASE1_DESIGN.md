# Phase 1 — Learning Evidence, Session Studio and Local Data Reliability

> Status: core implementation verified on PR #2; product/content QA gates remain open (Issues #3, #4)  
> Depends on Phase 0 browser gate and merge of PR #1.

## 1. Problem definition

A green React build does not establish a trustworthy learning product. Three failure modes must be separated:

1. **Mistaken mastery:** repeated guesses, Copy, and revealed answers inflate the apparent learning rate.
2. **Lost work:** sessions or compositions cannot be recovered, replayed, exported, or deleted.
3. **Untrusted import:** malformed archives or unknown fields may overwrite existing history or persist arbitrary original answer text.

This phase addresses those problems without introducing accounts, LLM services, or a cloud database.

## 2. Core user journeys

### Learn

- The learner chooses Copy or Recall and completes a session.
- Every submission records its mode, sense ID, outcome, reveal status, time, and optional spelling comparison metrics.
- The first unaided Recall submission for each sense within a session is the numerator/denominator for immediate first-attempt accuracy.
- A later correct retry never rewrites the initial wrong answer.
- Copy cannot create language recall evidence.
- No immediate accuracy statistic is named **mastery**; delayed spaced recall is a later phase.

### Review

- A Journal shows distinct session count, first-unaided Recall accuracy, Copy submissions, and aggregate spelling comparison.
- The spelling comparison uses edit distance and is explicitly **not raw hardware keystroke accuracy**.
- The user can replay note events from any saved session when browser audio is available.
- The user can delete an individual session and its composition, with a deliberate confirmation step.

### Safeguard

- The user can export a versioned JSON archive containing only approved stored fields.
- The user can import that archive locally; a duplicate session ID is skipped, not overwritten.
- The import checks the archive version, size, all field types and lengths, event bounds, unique IDs, and vocabulary references.
- Unknown fields are rejected, particularly raw answer text, preventing silent introduction of new unreviewed storage fields.
- A failed import must not silently claim success or partially overwrite records.

## 3. Data contract

### StoredSession

This remains the single session aggregate: it contains ordered item IDs, attempts, and note events plus `mappingVersion`, `presetId` and `tempo`.

It is not permitted to contain a raw answer string. Session notes store pitches and relative timestamps only.

### Attempt

A PracticeAttempt records:

- stable event ID and vocabulary sense ID;
- mode, outcome, and whether the answer was visible;
- submission time and elapsed duration;
- optional spelling comparison: expected character count, matching character estimate, Levenshtein distance.

Old records without optional spelling comparisons remain valid.

### Evidence

A **retrieval trial** is the first submission in a Recall session for a sense that was unaided and either correct or incorrect. Subsequent retries are retained as interaction history but excluded from the first-trial statistic.

The initial Recall prompt is Chinese meaning → English form. That contributes only form-recall evidence. It provides no meaning-recall, listening, or context evidence.

### Archive v1

Top-level format:

```json
{
  "format": "word-orchestra.sessions",
  "schemaVersion": 1,
  "exportedAt": 1763430000000,
  "sessions": []
}
```

The import parser validates the outer envelope and reconstructs only permitted stored fields.

Maximum archive payload: 8 MiB; maximum sessions: 500; maximum note events per session: 50,000. These bounds reduce accidental memory abuse but do not replace browser quota checks.

## 4. IndexedDB migration

The browser database is upgraded from version 1 to 2 without clearing session history.

- v1: `sessions` store and `by-completed-at` index.
- v2: retain the same store and add `by-mode` index.
- Existing v1 records remain readable and are not rewritten during migration.
- New optional attempt fields remain backward-compatible.
- Migration and duplicate-skipping import require automated regression tests.

Never delete and recreate the object store during an upgrade. Upgrades are transactional.

## 5. User interface and accessibility

Character-to-note capture is driven by accepted input mutations, not solely printable keydown events, so mobile software keyboards can participate. IME composition, paste, and drop are excluded. Only the focused practice field is observed; no global keyboard listener is allowed.


- The Studio shows straightforward counts, not gamified rewards.
- Replay and delete buttons are labelled per session; replay is disabled when no audio engine or note data is available.
- Import uses an accessible file input; export uses an actual browser download.
- Import and delete operations show status and failures.
- Controls remain operable by keyboard; modal confirmation currently uses the browser's native confirm dialog.
- The first phase preserves focused practice during navigation. Focus management for screen readers requires manual verification.

## 6. Privacy and security

- Offline by default; no archive is uploaded to an API.
- Imported archives must not contain unknown fields or user-entered raw answers.
- Exported data remains entirely under the user's control and may be sensitive to them.
- The UI does not infer that saving succeeded until IndexedDB operations resolve.
- No background keyboard monitoring or access to unrelated text fields.
- No audio assets are bundled without a source and license.

## 7. Independent acceptance criteria

| Gate | Objective evidence |
|---|---|
| Calculation | First unaided attempt selected per sense/session, Copy excluded, retry does not turn an earlier wrong answer into a first-attempt success |
| Archive round trip | Parse(serialize(sessions)) deep-equals the original supported records |
| Untrusted data | Invalid version, unknown raw text fields, out-of-range pitches, mismatched references rejected |
| Non-destructive import | Existing ID is skipped, existing record remains unmodified |
| Migration | A real v1 IndexedDB fixture survives opening as v2 with new index |
| Studio | Session is replayable and deletable; refresh shows changed library |
| Automation | npm ci, lint, typecheck, Vitest, production build, Chromium/Firefox/WebKit E2E |
| Manual gate | Real Safari audio, mobile layout, keyboard and screen reader tests documented as PASS/FAIL/NOT RUN |

## 8. Explicit deferred work

- Independent editorial verification of a production A1–B1 vocabulary pack (the 12 prototype items are marked `draft`).
- True keystroke accuracy measurements and accessibility performance on physical mobile hardware.
- Meaning/Listening/Context exercise modes and delayed-recall/FSRS scheduling.
- Cloud sync, accounts, and live collaboration.
- Fully arranged phrase-level compositions and MIDI export.

Do not label Phase 1 fully complete while these product acceptance items remain unchecked.
