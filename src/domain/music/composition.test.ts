import { describe, expect, it } from 'vitest'
import { createWordAccent } from './composition'

describe('createWordAccent', () => {
  it('creates a stable three-note accent for a word', () => {
    const first = createWordAccent('apple', 500)
    const second = createWordAccent('apple', 500)

    expect(first).toEqual(second)
    expect(first).toHaveLength(3)
    expect(first.map((event) => event.startMs)).toEqual([500, 500, 500])
  })

  it('returns no notes for a non-English word', () => {
    expect(createWordAccent('苹果', 0)).toEqual([])
  })
})
