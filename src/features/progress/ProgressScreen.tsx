import { useEffect, useMemo, useState } from 'react'
import type { SessionRepository } from '../../application/ports/session-repository'
import type { StoredSession } from '../../domain/practice/types'
import { shouldRecordRecallEvidence } from '../../domain/practice/evidence'

interface ProgressScreenProps {
  repository: SessionRepository
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function ProgressScreen({ repository }: ProgressScreenProps) {
  const [sessions, setSessions] = useState<StoredSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
        if (active) {
          setError(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [repository])

  const metrics = useMemo(() => {
    const attempts = sessions.flatMap((session) => session.attempts)
    const recallEvidence = attempts.filter((attempt) =>
      shouldRecordRecallEvidence(attempt.mode, attempt.outcome, attempt.answerWasVisible),
    )
    const correctRecall = recallEvidence.filter((attempt) => attempt.outcome === 'correct').length
    const copyAttempts = attempts.filter((attempt) => attempt.mode === 'copy').length

    return {
      sessionCount: sessions.length,
      recallCount: recallEvidence.length,
      recallAccuracy: recallEvidence.length > 0 ? Math.round((correctRecall / recallEvidence.length) * 100) : null,
      copyAttempts,
    }
  }, [sessions])

  return (
    <section className="progress-page">
      <div className="intro-copy compact-intro">
        <p className="eyebrow">YOUR LEARNING JOURNAL</p>
        <h1>进步应该<br />看得见，也听得见。</h1>
        <p className="intro-description">把键盘练习、主动回忆和音乐作品分开记录，理解真正发生的进步。</p>
      </div>

      {loading && <p className="empty-state">正在读取本地学习记录…</p>}
      {error && (
        <p className="storage-error" role="alert">
          无法读取本地学习记录。请检查浏览器是否允许此网站使用本地存储。
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="progress-metrics">
            <div className="metric-card">
              <span className="metric-label">完成的练习</span>
              <strong>{metrics.sessionCount}</strong>
              <span className="metric-foot">个 Session</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">无提示回忆</span>
              <strong>{metrics.recallAccuracy === null ? '—' : metrics.recallAccuracy + '%'}</strong>
              <span className="metric-foot">{metrics.recallCount} 次有效回忆尝试</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">键盘练习</span>
              <strong>{metrics.copyAttempts}</strong>
              <span className="metric-foot">次 Copy 模式尝试</span>
            </div>
          </div>

          <div className="journal-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">RECENT SESSIONS</p>
                <h2>最近的练习</h2>
              </div>
              <span className="word-count">仅保存在此设备</span>
            </div>

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
                    <li key={session.id} className="session-row">
                      <div className="session-icon" aria-hidden="true">♫</div>
                      <div className="session-info">
                        <strong>{session.mode === 'recall' ? '主动回忆练习' : '拼写练习'}</strong>
                        <span>{formatDate(session.completedAt)} · {session.itemIds.length} 个词</span>
                      </div>
                      <div className="session-result">
                        <strong>{correct}</strong>
                        <span>正确提交</span>
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
        Copy 的正确率不会计入词汇掌握。长期掌握需要跨时间、无提示的回忆证据。
      </p>
    </section>
  )
}
