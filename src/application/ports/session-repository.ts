import type { StoredSession } from '../../domain/practice/types'

export interface ImportResult {
  added: number
  skipped: number
}

export interface SessionRepository {
  saveSession(session: StoredSession): Promise<void>
  listSessions(): Promise<StoredSession[]>
  deleteSession(id: string): Promise<void>
  importSessions(sessions: readonly StoredSession[]): Promise<ImportResult>
}
