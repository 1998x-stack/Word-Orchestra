import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { AudioEngine } from '../../application/ports/audio-engine'
import type { SessionRepository } from '../../application/ports/session-repository'
import type { StoredSession } from '../../domain/practice/types'
import { deriveLearningSummary } from '../../domain/practice/metrics'
import { MAX_ARCHIVE_BYTES, parseSessionArchive, serializeSessionArchive } from '../../domain/practice/session-archive'

interface ProgressScreenProps {
  repository: SessionRepository
  audio: AudioEngine
  audioAvailable: boolean
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请检查浏览器存储状态与文件格式'
}

export function ProgressScreen({ repository, audio, audioAvailable }: ProgressScreenProps) {
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    repository.listSessions()
      .then((records) => {
        if (active) {
          setSessions(records)
          setError(false)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [repository])

  const metrics = useMemo(() => deriveLearningSummary(sessions), [sessions])

  async function refresh(): Promise<void> {
    setSessions(await repository.listSessions())
    setError(false)
  }

  async function handleDelete(session: StoredSession): Promise<void> {
    if (!window.confirm('删除这次练习及其作品？此操作无法撤销。')) return
    setBusy(true)
    setNotice('')
    try {
      await repository.deleteSession(session.id)
      await refresh()
      setNotice('练习及关联作品已从本地记录删除。')
    } catch (cause) {
      setNotice('删除失败：' + errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  async function replay(session: StoredSession): Promise<void> {
    try {
      await audio.unlock()
      audio.playEvents(session.noteEvents)
    } catch {
      setNotice('当前环境无法播放音频，但练习记录不受影响。')
    }
  }

  function handleExport(): void {
    setNotice('')
    try {
      const json = serializeSessionArchive(sessions, Date.now())
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'word-orchestra-sessions-' + new Date().toISOString().slice(0, 10) + '.json'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('已生成本地 JSON 归档，请检查浏览器下载列表。')
    } catch (cause) {
      setNotice('生成归档失败：' + errorMessage(cause))
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (file.size > MAX_ARCHIVE_BYTES) {
      setNotice('导入失败：文件超过 8 MB 安全限制。')
      return
    }

    setBusy(true)
    setNotice('')
    try {
      const contents = await file.text()
      const imported = parseSessionArchive(contents)
      const result = await repository.importSessions(imported)
      await refresh()
      setNotice('导入完成：新增 ' + result.added + ' 次练习，跳过 ' + result.skipped + ' 次重复记录。')
    } catch (cause) {
      setNotice('导入失败：' + errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="progress-page">
      <div className="intro-copy compact-intro">
        <p className="eyebrow">YOUR LEARNING JOURNAL</p>
        <h1>进步应该<br />看得见，也听得见。</h1>
        <p className="intro-description">首次无提示回忆、拼写练习与音乐作品分别记录。即时答对不等于长期掌握。</p>
      </div>

      {loading && <p className="empty-state">正在读取本地学习记录…</p>}
      {error && <p className="storage-error" role="alert">无法读取本地学习记录。请检查浏览器存储权限。</p>}

      {!loading && !error && (
        <>
          <div className="progress-metrics">
            <div className="metric-card">
              <span className="metric-label">完成的练习</span>
              <strong>{metrics.completedSessions}</strong>
              <span className="metric-foot">个 Session</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">首次无提示回忆</span>
              <strong>{metrics.firstRecallAccuracy === null ? '—' : metrics.firstRecallAccuracy + '%'}</strong>
              <span className="metric-foot">{metrics.firstRecallAttempts} 次首轮回忆（非掌握度）</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Copy 拼写练习</span>
              <strong>{metrics.copyAttempts}</strong>
              <span className="metric-foot">次独立提交</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">拼写匹配字符</span>
              <strong>{metrics.spellingCompared > 0 ? metrics.spellingMatched + '/' + metrics.spellingCompared : '—'}</strong>
              <span className="metric-foot">整词编辑距离统计，非物理按键准确率</span>
            </div>
          </div>

          <div className="journal-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">YOUR COMPOSITION LIBRARY</p>
                <h2>练习与作品库</h2>
              </div>
              <span className="word-count">仅保存在此设备</span>
            </div>

            <div className="archive-toolbar">
              <button className="secondary-button" type="button" onClick={handleExport} disabled={busy}>导出全部 JSON</button>
              <label className="archive-upload" htmlFor="session-import">导入本地归档
                <input
                  id="session-import"
                  aria-label="导入 JSON 归档"
                  type="file"
                  accept=".json,application/json"
                  disabled={busy}
                  onChange={(event) => { void handleImport(event) }}
                />
              </label>
            </div>
            <p className="archive-description">归档包含练习结果和音符，不含输入的原始答案。重复 ID 将跳过，不覆盖已有记录。</p>
            {notice && <p className="archive-notice" role="status">{notice}</p>}

            {sessions.length === 0 ? (
              <div className="empty-state">
                <span aria-hidden="true">♫</span>
                <strong>这里还没有作品。</strong>
                <p>完成一次 Copy 或 Recall 练习后，记录会出现在这里。</p>
              </div>
            ) : (
              <ul className="session-list">
                {sessions.map((session) => {
                  const correct = session.attempts.filter((attempt) => attempt.outcome === 'correct').length
                  return (
                    <li key={session.id} className="session-row session-library-row">
                      <div className="session-icon" aria-hidden="true">♫</div>
                      <div className="session-info">
                        <strong>{session.mode === 'recall' ? '主动回忆练习' : '拼写练习'}</strong>
                        <span>{formatDate(session.completedAt)} · {session.itemIds.length} 个词 · {correct} 次正确提交</span>
                      </div>
                      <div className="session-buttons">
                        <button
                          className="library-action"
                          type="button"
                          disabled={busy || !audioAvailable || session.noteEvents.length === 0}
                          aria-label={'回放 ' + session.id}
                          onClick={() => { void replay(session) }}
                        >回放</button>
                        <button
                          className="library-action danger"
                          type="button"
                          disabled={busy}
                          aria-label={'删除 ' + session.id}
                          onClick={() => { void handleDelete(session) }}
                        >删除</button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}

      <p className="principle-note">
        <span aria-hidden="true">✳</span>
        这不是语言掌握度评分。长期掌握需要跨时间、分词义与方向的延迟回忆证据。
      </p>
    </section>
  )
}
