import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ImportResult, SessionRepository } from '../../application/ports/session-repository'
import type { StoredSession } from '../../domain/practice/types'

interface WordOrchestraDatabase extends DBSchema {
  sessions: {
    key: string
    value: StoredSession
    indexes: {
      'by-completed-at': number
      'by-mode': string
    }
  }
}

const DATABASE_NAME = 'word-orchestra'
export const DATABASE_VERSION = 2

export class IndexedDbSessionRepository implements SessionRepository {
  private databasePromise: Promise<IDBPDatabase<WordOrchestraDatabase>> | null = null

  constructor(private readonly databaseName = DATABASE_NAME) {}

  async saveSession(session: StoredSession): Promise<void> {
    const database = await this.openDatabase()
    await database.put('sessions', session)
  }

  async listSessions(): Promise<StoredSession[]> {
    const database = await this.openDatabase()
    const sessions = await database.getAll('sessions')
    return sessions.sort((left, right) => right.completedAt - left.completedAt)
  }

  async deleteSession(id: string): Promise<void> {
    const database = await this.openDatabase()
    await database.delete('sessions', id)
  }

  async importSessions(sessions: readonly StoredSession[]): Promise<ImportResult> {
    const database = await this.openDatabase()
    const transaction = database.transaction('sessions', 'readwrite')
    let added = 0
    let skipped = 0

    for (const session of sessions) {
      if (await transaction.store.get(session.id)) {
        skipped += 1
        continue
      }
      await transaction.store.add(session)
      added += 1
    }

    await transaction.done
    return { added, skipped }
  }

  async close(): Promise<void> {
    if (this.databasePromise) {
      const database = await this.databasePromise
      database.close()
      this.databasePromise = null
    }
  }

  private openDatabase(): Promise<IDBPDatabase<WordOrchestraDatabase>> {
    this.databasePromise ??= openDB<WordOrchestraDatabase>(
      this.databaseName,
      DATABASE_VERSION,
      {
        upgrade(database, oldVersion, _newVersion, transaction) {
          if (oldVersion < 1) {
            const store = database.createObjectStore('sessions', { keyPath: 'id' })
            store.createIndex('by-completed-at', 'completedAt')
          }
          if (oldVersion < 2) {
            const store = transaction.objectStore('sessions')
            if (!store.indexNames.contains('by-mode')) {
              store.createIndex('by-mode', 'mode')
            }
          }
        },
      },
    ).catch((error: unknown) => {
      // A rejected open must be retryable after the user changes browser permissions.
      this.databasePromise = null
      throw error
    })

    return this.databasePromise
  }
}
