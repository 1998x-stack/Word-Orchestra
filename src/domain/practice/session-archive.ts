import type { AttemptOutcome, NoteEvent, PracticeAttemptRecord, SpellingComparison, StoredSession } from './types'
import { NOTE_MAPPING_VERSION } from '../music/note-mapper'

export const ARCHIVE_FORMAT = 'word-orchestra.sessions'
export const ARCHIVE_VERSION = 1
export const MAX_ARCHIVE_BYTES = 8 * 1024 * 1024

function invalid(path: string): never {
  throw new Error('无法导入：' + path + ' 格式不正确或不受支持')
}

function record(value: unknown, path: string, allowedKeys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path)
  const obj = value as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.includes(key)) invalid(path + '.' + key)
  }
  return obj
}

function id(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 200 || !/^[a-zA-Z0-9._-]+$/.test(value)) {
    invalid(path)
  }
  return value
}

function nonnegative(value: unknown, path: string, maximum = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > maximum) invalid(path)
  return value
}

function mode(value: unknown, path: string): 'copy' | 'recall' {
  if (value !== 'copy' && value !== 'recall') invalid(path)
  return value
}

function outcome(value: unknown, path: string): AttemptOutcome {
  if (value !== 'correct' && value !== 'incorrect' && value !== 'revealed' && value !== 'skipped') invalid(path)
  return value
}

function spelling(value: unknown, path: string): SpellingComparison {
  const obj = record(value, path, ['expectedCharacters', 'matchingCharacters', 'editDistance'])
  const expectedCharacters = nonnegative(obj.expectedCharacters, path + '.expectedCharacters', 200)
  const matchingCharacters = nonnegative(obj.matchingCharacters, path + '.matchingCharacters', 200)
  const editDistance = nonnegative(obj.editDistance, path + '.editDistance', 200)

  if (matchingCharacters > expectedCharacters) invalid(path + '.matchingCharacters')
  return { expectedCharacters, matchingCharacters, editDistance }
}

function attempt(value: unknown, path: string, sessionMode: 'copy' | 'recall', itemIds: readonly string[]): PracticeAttemptRecord {
  const obj = record(value, path, ['id', 'itemId', 'mode', 'outcome', 'answerWasVisible', 'submittedAt', 'elapsedMs', 'spelling'])
  const itemId = id(obj.itemId, path + '.itemId')
  const attemptMode = mode(obj.mode, path + '.mode')
  if (!itemIds.includes(itemId) || attemptMode !== sessionMode || typeof obj.answerWasVisible !== 'boolean') invalid(path)
  return {
    id: id(obj.id, path + '.id'),
    itemId,
    mode: attemptMode,
    outcome: outcome(obj.outcome, path + '.outcome'),
    answerWasVisible: obj.answerWasVisible,
    submittedAt: nonnegative(obj.submittedAt, path + '.submittedAt'),
    elapsedMs: nonnegative(obj.elapsedMs, path + '.elapsedMs', 86_400_000),
    ...(obj.spelling === undefined ? {} : { spelling: spelling(obj.spelling, path + '.spelling') }),
  }
}

function note(value: unknown, path: string): NoteEvent {
  const obj = record(value, path, ['id', 'midi', 'startMs', 'durationMs', 'kind'])
  if (obj.kind !== 'character' && obj.kind !== 'accent') invalid(path + '.kind')
  return {
    id: id(obj.id, path + '.id'),
    midi: nonnegative(obj.midi, path + '.midi', 127),
    startMs: nonnegative(obj.startMs, path + '.startMs', 28_800_000),
    durationMs: nonnegative(obj.durationMs, path + '.durationMs', 10_000),
    kind: obj.kind,
  }
}

function session(value: unknown, path: string): StoredSession {
  const obj = record(value, path, [
    'id', 'mode', 'startedAt', 'completedAt', 'itemIds', 'attempts',
    'noteEvents', 'mappingVersion', 'presetId', 'tempo',
  ])
  if (!Array.isArray(obj.itemIds) || !obj.itemIds.length || obj.itemIds.length > 500) invalid(path + '.itemIds')
  const itemIds = obj.itemIds.map((value, index) => id(value, path + '.itemIds[' + index + ']'))
  if (new Set(itemIds).size !== itemIds.length) invalid(path + '.itemIds')
  if (!Array.isArray(obj.attempts) || obj.attempts.length > 5000) invalid(path + '.attempts')
  if (!Array.isArray(obj.noteEvents) || obj.noteEvents.length > 50_000) invalid(path + '.noteEvents')
  if (obj.mappingVersion !== NOTE_MAPPING_VERSION || obj.presetId !== 'soft-triangle-v1') invalid(path + '.mappingVersion')
  const sessionMode = mode(obj.mode, path + '.mode')
  const startedAt = nonnegative(obj.startedAt, path + '.startedAt')
  const completedAt = nonnegative(obj.completedAt, path + '.completedAt')
  if (completedAt < startedAt) invalid(path + '.completedAt')
  const attempts = obj.attempts.map((value, index) => attempt(value, path + '.attempts[' + index + ']', sessionMode, itemIds))
  const noteEvents = obj.noteEvents.map((value, index) => note(value, path + '.noteEvents[' + index + ']'))
  if (new Set(attempts.map((value) => value.id)).size !== attempts.length) invalid(path + '.attempts')
  return {
    id: id(obj.id, path + '.id'),
    mode: sessionMode,
    startedAt,
    completedAt,
    itemIds,
    attempts,
    noteEvents: noteEvents.sort((left, right) => left.startMs - right.startMs),
    mappingVersion: NOTE_MAPPING_VERSION,
    presetId: 'soft-triangle-v1',
    tempo: nonnegative(obj.tempo, path + '.tempo', 320),
  }
}

export function serializeSessionArchive(sessions: readonly StoredSession[], exportedAt: number): string {
  if (sessions.length > 500) invalid('archive.sessions')
  const content = JSON.stringify({
    format: ARCHIVE_FORMAT,
    schemaVersion: ARCHIVE_VERSION,
    exportedAt,
    sessions,
  }, null, 2)
  // Verify our own exports will be accepted on reimport, including unknown-field rejection.
  parseSessionArchive(content)
  return content
}

export function parseSessionArchive(text: string): StoredSession[] {
  if (new TextEncoder().encode(text).byteLength > MAX_ARCHIVE_BYTES) invalid('文件大小')

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    invalid('JSON')
  }

  const root = record(parsed, 'archive', ['format', 'schemaVersion', 'exportedAt', 'sessions'])
  if (root.format !== ARCHIVE_FORMAT || root.schemaVersion !== ARCHIVE_VERSION) invalid('archive.version')
  nonnegative(root.exportedAt, 'archive.exportedAt')
  if (!Array.isArray(root.sessions) || root.sessions.length > 500) invalid('archive.sessions')
  const sessions = root.sessions.map((value, index) => session(value, 'archive.sessions[' + index + ']'))
  if (new Set(sessions.map((value) => value.id)).size !== sessions.length) invalid('archive.sessions')
  return sessions
}
