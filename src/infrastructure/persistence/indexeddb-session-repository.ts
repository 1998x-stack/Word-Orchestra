import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { SessionRepository } from '../../application/ports/session-repository'
import type { StoredSession } from '../../domain/practice/types'

interface WordOrchestraDatabase extends DBSchema {
  sessions: {
    key: string
    value: StoredSession
    indexes: { 'by-completed-at': number }
  }
}

const DATABASE_NAME = 'word-orchestra'
const DATABASE_VERSION = 1

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
        upgrade(database) {
          if (!database.objectStoreNames.contains('sessions')) {
            const store = database.createObjectStore('sessions', { keyPath: 'id' })
            store.createIndex('by-completed-at', 'completedAt')
          }
        },
      },
    )

    return this.databasePromise
  }
}
