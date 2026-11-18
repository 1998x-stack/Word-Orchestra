import type { AudioEngine } from '../../application/ports/audio-engine'
import type { NoteEvent } from '../../domain/practice/types'
import { mapLetterToMidi, midiToFrequency } from '../../domain/music/note-mapper'

interface ActiveVoice {
  oscillator: OscillatorNode
  gain: GainNode
  endTime: number
}

export function isWebAudioSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext !== 'undefined'
}

export class WebAudioEngine implements AudioEngine {
  private context: AudioContext | null = null
  private readonly voices = new Set<ActiveVoice>()
  private muted = false
  private volume = 0.55

  private getContext(): AudioContext | null {
    if (!isWebAudioSupported()) {
      return null
    }

    if (!this.context) {
      try {
        this.context = new window.AudioContext()
      } catch {
        return null
      }
    }

    return this.context
  }

  async unlock(): Promise<void> {
    const context = this.getContext()

    if (context?.state === 'suspended') {
      try {
        await context.resume()
      } catch {
        // Browser policy may still prevent playback; the learning flow remains usable.
      }
    }
  }

  playCharacter(letter: string): void {
    const midi = mapLetterToMidi(letter)

    if (midi !== null) {
      this.playMidi(midi, 170, 0)
    }
  }

  playEvents(events: readonly NoteEvent[]): void {
    if (this.muted || events.length === 0) {
      return
    }

    const context = this.getContext()

    if (!context) {
      return
    }

    const baseTime = context.currentTime + 0.025

    for (const event of events) {
      this.scheduleMidi(
        context,
        event.midi,
        baseTime + Math.max(0, event.startMs) / 1000,
        event.durationMs,
      )
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted

    if (muted) {
      this.releaseVoices()
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume))
  }

  dispose(): void {
    this.releaseVoices()

    if (this.context && this.context.state !== 'closed') {
      void this.context.close().catch(() => undefined)
    }

    this.context = null
  }

  private playMidi(midi: number, durationMs: number, delayMs: number): void {
    if (this.muted) {
      return
    }

    const context = this.getContext()

    if (!context) {
      return
    }

    this.scheduleMidi(context, midi, context.currentTime + 0.01 + delayMs / 1000, durationMs)
  }

  private scheduleMidi(
    context: AudioContext,
    midi: number,
    startTime: number,
    durationMs: number,
  ): void {
    const overlappingVoices = [...this.voices].filter((voice) => voice.endTime > startTime)

    if (this.muted || overlappingVoices.length >= 12) {
      return
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const endTime = startTime + Math.max(80, durationMs) / 1000

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), startTime)

    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, this.volume * 0.11), startTime + 0.014)
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

    oscillator.connect(gain)
    gain.connect(context.destination)

    const voice = { oscillator, gain, endTime }
    this.voices.add(voice)
    oscillator.onended = () => {
      this.voices.delete(voice)
      oscillator.disconnect()
      gain.disconnect()
    }

    oscillator.start(startTime)
    oscillator.stop(endTime + 0.025)
  }

  private releaseVoices(): void {
    const now = this.context?.currentTime ?? 0

    for (const voice of this.voices) {
      try {
        voice.gain.gain.cancelScheduledValues(now)
        voice.gain.gain.setTargetAtTime(0.0001, now, 0.008)
        voice.oscillator.stop(now + 0.035)
      } catch {
        // A voice may already have ended between scheduling and release.
      }
    }
  }
}
