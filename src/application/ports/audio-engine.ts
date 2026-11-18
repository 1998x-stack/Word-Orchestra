import type { NoteEvent } from '../../domain/practice/types'

export interface AudioEngine {
  unlock(): Promise<void>
  playCharacter(letter: string): void
  playEvents(events: readonly NoteEvent[]): void
  setMuted(muted: boolean): void
  setVolume(volume: number): void
  dispose(): void
}
