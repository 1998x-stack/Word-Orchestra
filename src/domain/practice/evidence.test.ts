import { describe, expect, it } from 'vitest'
import { shouldRecordRecallEvidence } from './evidence'

describe('shouldRecordRecallEvidence', () => {
  it('does not treat Copy as language mastery evidence', () => {
    expect(shouldRecordRecallEvidence('copy', 'correct', false)).toBe(false)
  })

  it('records correct and incorrect active recall attempts', () => {
    expect(shouldRecordRecallEvidence('recall', 'correct', false)).toBe(true)
    expect(shouldRecordRecallEvidence('recall', 'incorrect', false)).toBe(true)
  })

  it('excludes revealed answers and skipped attempts', () => {
    expect(shouldRecordRecallEvidence('recall', 'correct', true)).toBe(false)
    expect(shouldRecordRecallEvidence('recall', 'revealed', true)).toBe(false)
    expect(shouldRecordRecallEvidence('recall', 'skipped', false)).toBe(false)
  })
})
