import { describe, expect, it } from 'vitest'
import { parseSessionArchive, serializeSessionArchive } from './session-archive'
import type { StoredSession } from './types'

const example: StoredSession = {
  id: 'session-1', mode: 'copy', startedAt: 100, completedAt: 300,
  itemIds: ['a1-apple-noun-fruit'],
  attempts: [
    {
      id: 'attempt-1', itemId: 'a1-apple-noun-fruit', mode: 'copy',
      outcome: 'correct', answerWasVisible: true, elapsedMs: 200, submittedAt: 300,
      spelling: { expectedCharacters: 5, matchingCharacters: 5, editDistance: 0 },
    },
  ],
  noteEvents: [{ id: 'note-1', midi: 60, startMs: 0, durationMs: 170, kind: 'character' }],
  mappingVersion: 'c-major-pentatonic-v1', presetId: 'soft-triangle-v1', tempo: 110,
}

describe('session archive', () => {
  it('round-trips known records without loss of note events and attempts', () => {
    expect(parseSessionArchive(serializeSessionArchive([example], 1000))).toEqual([example])
  })

  it('rejects invalid version, unexpected fields, or injected raw answer text', () => {
    const encoded = serializeSessionArchive([example], 1000)
    expect(() => parseSessionArchive(encoded.replace('"schemaVersion": 1', '"schemaVersion": 99'))).toThrow()
    expect(() => parseSessionArchive(encoded.replace('"tempo": 110', '"tempo": 110, "rawInput": "private text"'))).toThrow()
    expect(() => parseSessionArchive('{oops')).toThrow()
  })

  it('rejects malformed notes and sessions with references to unknown words', () => {
    const parsed = JSON.parse(serializeSessionArchive([example], 1000)) as { sessions: StoredSession[] }
    parsed.sessions[0].noteEvents[0].midi = 999
    expect(() => parseSessionArchive(JSON.stringify(parsed))).toThrow()

    parsed.sessions[0].noteEvents[0].midi = 60
    parsed.sessions[0].attempts[0].itemId = 'unknown-word'
    expect(() => parseSessionArchive(JSON.stringify(parsed))).toThrow()
  })
})
