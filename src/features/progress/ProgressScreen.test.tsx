import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AudioEngine } from '../../application/ports/audio-engine'
import type { SessionRepository } from '../../application/ports/session-repository'
import type { StoredSession } from '../../domain/practice/types'
import { ProgressScreen } from './ProgressScreen'

const entry: StoredSession = {
  id: 'test-session', mode: 'copy', startedAt: 100, completedAt: 300,
  itemIds: ['a1-apple-noun-fruit'],
  attempts: [
    { id: 'test-attempt', itemId: 'a1-apple-noun-fruit', mode: 'copy',
      outcome: 'correct', answerWasVisible: true, submittedAt: 300, elapsedMs: 200 },
  ],
  noteEvents: [{ id: 'note-1', kind: 'character', midi: 60, startMs: 0, durationMs: 170 }],
  mappingVersion: 'c-major-pentatonic-v1', presetId: 'soft-triangle-v1', tempo: 110,
}

function repository(): SessionRepository {
  let records = [entry]
  return {
    saveSession: vi.fn().mockResolvedValue(undefined),
    listSessions: vi.fn().mockImplementation(async () => records),
    deleteSession: vi.fn().mockImplementation(async (id: string) => { records = records.filter((s) => s.id !== id) }),
    importSessions: vi.fn().mockResolvedValue({ added: 0, skipped: 0 }),
  }
}

const audio: AudioEngine = {
  unlock: vi.fn().mockResolvedValue(undefined),
  playCharacter: vi.fn(), playEvents: vi.fn(), setMuted: vi.fn(),
  setVolume: vi.fn(), dispose: vi.fn(),
}

describe('ProgressScreen', () => {
  it('keeps Copy attempts distinct from successful recall', async () => {
    render(<ProgressScreen repository={repository()} audio={audio} audioAvailable={false} />)
    await screen.findByText('练习与作品库')
    expect(screen.getByText('首次无提示回忆')).toBeInTheDocument()
    expect(screen.queryByText('1 次独立提交')).not.toBeInTheDocument()
    expect(screen.getByText('次独立提交')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '回放 test-session' })).toBeDisabled()
  })

  it('deletes a session only after user confirmation', async () => {
    const repo = repository()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<ProgressScreen repository={repo} audio={audio} audioAvailable={true} />)
    await screen.findByText('练习与作品库')
    fireEvent.click(screen.getByRole('button', { name: '删除 test-session' }))
    await waitFor(() => expect(repo.deleteSession).toHaveBeenCalledWith('test-session'))
    expect(confirm).toHaveBeenCalled()
    confirm.mockRestore()
  })
})
