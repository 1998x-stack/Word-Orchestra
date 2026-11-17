import { describe, expect, it } from 'vitest'
import { isAnswerCorrect, normalizeAnswer } from './answer'

describe('normalizeAnswer', () => {
  it('trims, normalizes unicode, and ignores letter case', () => {
    expect(normalizeAnswer('  ＡPPLE  ')).toBe('apple')
  })

  it('collapses repeated whitespace', () => {
    expect(normalizeAnswer('take   a   break')).toBe('take a break')
  })
})

describe('isAnswerCorrect', () => {
  it('accepts an exact normalized answer', () => {
    expect(isAnswerCorrect(' Apple ', ['apple'])).toBe(true)
  })

  it('supports explicitly reviewed answer variants', () => {
    expect(isAnswerCorrect('color', ['colour', 'color'])).toBe(true)
  })

  it('does not accept empty or approximate answers', () => {
    expect(isAnswerCorrect('', ['apple'])).toBe(false)
    expect(isAnswerCorrect('apples', ['apple'])).toBe(false)
  })
})
