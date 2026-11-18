import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AudioEngine } from '../../application/ports/audio-engine'
import type { SessionRepository } from '../../application/ports/session-repository'
import { PracticeScreen } from './PracticeScreen'

function createRepository(): SessionRepository {
  return {
    saveSession: vi.fn().mockResolvedValue(undefined),
    listSessions: vi.fn().mockResolvedValue([]),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    importSessions: vi.fn().mockResolvedValue({ added: 0, skipped: 0 }),
  }
}

function createAudioEngine(): AudioEngine {
  return {
    unlock: vi.fn().mockResolvedValue(undefined),
    playCharacter: vi.fn(),
    playEvents: vi.fn(),
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('PracticeScreen', () => {
  it('starts a Recall session and presents a focused answer field', () => {
    render(<PracticeScreen repository={createRepository()} audio={createAudioEngine()} audioAvailable={false} />)

    expect(screen.getByRole('button', { name: /Recall/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.getByLabelText('输入英文单词')).toBeInTheDocument()
    expect(screen.getByText('苹果')).toBeInTheDocument()
  })

  it('allows Copy mode without presenting it as a mastery score', () => {
    render(<PracticeScreen repository={createRepository()} audio={createAudioEngine()} audioAvailable={false} />)

    fireEvent.click(screen.getByRole('button', { name: /Copy/ }))
    fireEvent.click(screen.getByRole('button', { name: '开始练习' }))

    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('拼写练习 · SESSION 01')).toBeInTheDocument()
  })
})
