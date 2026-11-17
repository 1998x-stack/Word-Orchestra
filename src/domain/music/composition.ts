import type { NoteEvent } from '../practice/types'
import { mapLetterToMidi } from './note-mapper'

export function createWordAccent(word: string, startMs: number): NoteEvent[] {
  const root = mapLetterToMidi(word.charAt(0))

  if (root === null) {
    return []
  }

  return [root, root + 7, root + 12].map((midi, index) => ({
    id: 'accent-' + Math.round(startMs) + '-' + index,
    midi,
    startMs,
    durationMs: 260,
    kind: 'accent' as const,
  }))
}
