import type { PracticeMode } from '../vocabulary/types'

export type AttemptOutcome = 'correct' | 'incorrect' | 'revealed' | 'skipped'

/** A whole-answer spelling comparison, not raw keystroke telemetry. */
export interface SpellingComparison {
  expectedCharacters: number
  matchingCharacters: number
  editDistance: number
}

export interface PracticeAttemptRecord {
  id: string
  itemId: string
  mode: PracticeMode
  outcome: AttemptOutcome
  answerWasVisible: boolean
  submittedAt: number
  elapsedMs: number
  spelling?: SpellingComparison
}

export interface NoteEvent {
  id: string
  midi: number
  startMs: number
  durationMs: number
  kind: 'character' | 'accent'
}

export interface StoredSession {
  id: string
  mode: PracticeMode
  startedAt: number
  completedAt: number
  itemIds: string[]
  attempts: PracticeAttemptRecord[]
  noteEvents: NoteEvent[]
  mappingVersion: string
  presetId: string
  tempo: number
}
