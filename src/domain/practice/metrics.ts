import type { PracticeAttemptRecord, SpellingComparison, StoredSession } from './types'
import { normalizeAnswer } from './answer'

/** Levenshtein distance measures answer spelling, not hardware typing errors. */
export function compareSpelling(expected: string, submitted: string): SpellingComparison {
  const target = normalizeAnswer(expected)
  const actual = normalizeAnswer(submitted)
  let previous = Array.from({ length: actual.length + 1 }, (_, index) => index)

  for (let row = 1; row <= target.length; row += 1) {
    const current = [row]
    for (let column = 1; column <= actual.length; column += 1) {
      current.push(Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (target[row - 1] === actual[column - 1] ? 0 : 1),
      ))
    }
    previous = current
  }

  const distance = previous[actual.length]
  return {
    expectedCharacters: target.length,
    matchingCharacters: Math.max(0, target.length - distance),
    editDistance: distance,
  }
}

/**
 * Only the first unaided Recall submission per vocabulary sense and session
 * contributes to an immediate, first-attempt recall accuracy statistic.
 * No attempt produces a long-term mastery claim.
 */
export function firstUnaidedRecallAttempts(attempts: readonly PracticeAttemptRecord[]): PracticeAttemptRecord[] {
  const seen = new Set<string>()
  const result: PracticeAttemptRecord[] = []

  for (const attempt of attempts) {
    if (
      attempt.mode !== 'recall' ||
      attempt.answerWasVisible ||
      (attempt.outcome !== 'correct' && attempt.outcome !== 'incorrect') ||
      seen.has(attempt.itemId)
    ) {
      continue
    }

    seen.add(attempt.itemId)
    result.push(attempt)
  }

  return result
}

export function deriveLearningSummary(sessions: readonly StoredSession[]) {
  const firstRecall = sessions.flatMap((session) => firstUnaidedRecallAttempts(session.attempts))
  const recallCorrect = firstRecall.filter((attempt) => attempt.outcome === 'correct').length
  const copyAttempts = sessions.flatMap((session) => session.attempts)
    .filter((attempt) => attempt.mode === 'copy' && (attempt.outcome === 'correct' || attempt.outcome === 'incorrect'))

  const comparisons = sessions.flatMap((session) => session.attempts)
    .flatMap((attempt) => attempt.spelling ? [attempt.spelling] : [])

  return {
    completedSessions: sessions.length,
    firstRecallAttempts: firstRecall.length,
    firstRecallCorrect: recallCorrect,
    firstRecallAccuracy: firstRecall.length ? Math.round((recallCorrect / firstRecall.length) * 100) : null,
    copyAttempts: copyAttempts.length,
    spellingCompared: comparisons.reduce((sum, item) => sum + item.expectedCharacters, 0),
    spellingMatched: comparisons.reduce((sum, item) => sum + item.matchingCharacters, 0),
  }
}
