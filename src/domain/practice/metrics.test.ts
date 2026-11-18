import { describe, expect, it } from 'vitest'
import { compareSpelling, deriveLearningSummary, firstUnaidedRecallAttempts } from './metrics'
import type { PracticeAttemptRecord, StoredSession } from './types'

function attempt(itemId: string, mode: 'copy' | 'recall', outcome: PracticeAttemptRecord['outcome'], answerWasVisible = false): PracticeAttemptRecord {
  return { id: itemId + '-' + outcome, itemId, mode, outcome, answerWasVisible, submittedAt: 1000, elapsedMs: 1000 }
}

describe('compareSpelling', () => {
  it('compares spelling without persisting the submitted text', () => {
    expect(compareSpelling('apple', 'aple')).toEqual({
      expectedCharacters: 5, matchingCharacters: 4, editDistance: 1,
    })
    expect(compareSpelling('book', 'book').editDistance).toBe(0)
  })
})

describe('firstUnaidedRecallAttempts', () => {
  it('takes the first genuine retrieval attempt per sense, ignoring repeated guesses', () => {
    const attempts = [
      attempt('word-1', 'copy', 'correct'),
      attempt('word-1', 'recall', 'incorrect'),
      attempt('word-1', 'recall', 'correct'),
      attempt('word-2', 'recall', 'revealed', true),
      attempt('word-3', 'recall', 'correct'),
    ]
    expect(firstUnaidedRecallAttempts(attempts).map((result) => result.itemId)).toEqual(['word-1', 'word-3'])
    expect(firstUnaidedRecallAttempts(attempts)[0].outcome).toBe('incorrect')
  })

  it('never counts Copy and revealed attempts as retrieval', () => {
    const s: StoredSession = {
      id: 'session', mode: 'copy', startedAt: 1, completedAt: 2,
      itemIds: ['item'], attempts: [attempt('item', 'copy', 'correct')],
      noteEvents: [], mappingVersion: 'c-major-pentatonic-v1', presetId: 'soft-triangle-v1', tempo: 110,
    }
    expect(deriveLearningSummary([s]).firstRecallAccuracy).toBeNull()
    expect(deriveLearningSummary([s]).copyAttempts).toBe(1)
  })
})
