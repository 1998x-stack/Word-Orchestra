import type { AttemptOutcome } from './types'
import type { PracticeMode } from '../vocabulary/types'

export function shouldRecordRecallEvidence(
  mode: PracticeMode,
  outcome: AttemptOutcome,
  answerWasVisible: boolean,
): boolean {
  if (mode !== 'recall' || answerWasVisible) {
    return false
  }

  return outcome === 'correct' || outcome === 'incorrect'
}
