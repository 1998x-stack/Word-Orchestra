export const NOTE_MAPPING_VERSION = 'c-major-pentatonic-v1'

const PENTATONIC_MIDI_NOTES = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81] as const

/**
 * Maps an English letter to a stable C-major-pentatonic pitch.
 * The mapping repeats over two octaves to keep the alphabet in a comfortable register.
 */
export function mapLetterToMidi(letter: string): number | null {
  if (!/^[a-z]$/i.test(letter)) {
    return null
  }

  const index = letter.toLowerCase().charCodeAt(0) - 97
  return PENTATONIC_MIDI_NOTES[index % PENTATONIC_MIDI_NOTES.length]
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}
