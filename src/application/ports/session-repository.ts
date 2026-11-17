import type { StoredSession } from '../../domain/practice/types'

export interface SessionRepository {
  saveSession(session: StoredSession): Promise<void>
  listSessions(): Promise<StoredSession[]>
}
