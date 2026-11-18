import { afterEach, describe, expect, it } from 'vitest'
import { IndexedDbSessionRepository } from './indexeddb-session-repository'
import type { StoredSession } from '../../domain/practice/types'

const databaseName = 'word-orchestra-repository-test'
const repository = new IndexedDbSessionRepository(databaseName)

function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('Database deletion was blocked'))
  })
}

function makeSession(id: string, completedAt: number): StoredSession {
  return {
    id,
    mode: 'recall',
    startedAt: completedAt - 60_000,
    completedAt,
    itemIds: ['a1-apple-noun-fruit'],
    attempts: [],
    noteEvents: [],
    mappingVersion: 'c-major-pentatonic-v1',
    presetId: 'soft-triangle-v1',
    tempo: 110,
  }
}

afterEach(async () => {
  await repository.close()
  await deleteDatabase()
})

describe('IndexedDbSessionRepository', () => {
  it('persists sessions and returns newest first', async () => {
    await repository.saveSession(makeSession('older', 100))
    await repository.saveSession(makeSession('newer', 200))

    const sessions = await repository.listSessions()

    expect(sessions.map((session) => session.id)).toEqual(['newer', 'older'])
  })
})
