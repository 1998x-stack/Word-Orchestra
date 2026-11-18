import { afterEach, describe, expect, it } from 'vitest'
import { openDB } from 'idb'
import { DATABASE_VERSION, IndexedDbSessionRepository } from './indexeddb-session-repository'
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

  it('imports missing sessions without replacing an existing record', async () => {
    await repository.saveSession(makeSession('original', 100))
    const result = await repository.importSessions([
      makeSession('original', 999),
      makeSession('new', 200),
    ])

    expect(result).toEqual({ added: 1, skipped: 1 })
    const saved = await repository.listSessions()
    expect(saved).toHaveLength(2)
    expect(saved.find((session) => session.id === 'original')?.completedAt).toBe(100)
  })

  it('deletes one chosen session without deleting other sessions', async () => {
    await repository.saveSession(makeSession('keep', 100))
    await repository.saveSession(makeSession('remove', 200))
    await repository.deleteSession('remove')

    expect((await repository.listSessions()).map((session) => session.id)).toEqual(['keep'])
  })

  it('upgrades a v1 browser database without losing its sessions', async () => {
    const legacy = await openDB(databaseName, 1, {
      upgrade(db) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' })
        store.createIndex('by-completed-at', 'completedAt')
      },
    })
    await legacy.put('sessions', makeSession('legacy', 123))
    legacy.close()

    expect((await repository.listSessions()).map((session) => session.id)).toEqual(['legacy'])
    const upgraded = await openDB(databaseName, DATABASE_VERSION)
    expect(upgraded.objectStoreNames.contains('sessions')).toBe(true)
    expect(upgraded.transaction('sessions').store.indexNames.contains('by-mode')).toBe(true)
    upgraded.close()
  })
})
