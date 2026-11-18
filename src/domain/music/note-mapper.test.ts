import { describe, expect, it } from 'vitest'
import { mapLetterToMidi, midiToFrequency, NOTE_MAPPING_VERSION } from './note-mapper'

describe('mapLetterToMidi', () => {
  it('maps the same letter to the same note regardless of case', () => {
    expect(mapLetterToMidi('a')).toBe(mapLetterToMidi('A'))
  })

  it('uses a stable pentatonic register for the alphabet', () => {
    const notes = 'abcdefghijklmnopqrstuvwxyz'.split('').map(mapLetterToMidi)

    expect(notes.every((note) => note !== null && note >= 60 && note <= 81)).toBe(true)
    expect(NOTE_MAPPING_VERSION).toBe('c-major-pentatonic-v1')
  })

  it('rejects non-letter keys', () => {
    expect(mapLetterToMidi('1')).toBeNull()
    expect(mapLetterToMidi('Enter')).toBeNull()
    expect(mapLetterToMidi('é')).toBeNull()
  })
})

describe('midiToFrequency', () => {
  it('maps concert A to 440 Hz', () => {
    expect(midiToFrequency(69)).toBe(440)
  })
})
