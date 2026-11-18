export function normalizeAnswer(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

export function isAnswerCorrect(answer: string, acceptedAnswers: readonly string[]): boolean {
  const normalizedAnswer = normalizeAnswer(answer)

  if (normalizedAnswer.length === 0) {
    return false
  }

  return acceptedAnswers.some((candidate) => normalizeAnswer(candidate) === normalizedAnswer)
}
