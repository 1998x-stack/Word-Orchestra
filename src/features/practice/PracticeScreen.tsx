import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { AudioEngine } from '../../application/ports/audio-engine'
import type { SessionRepository } from '../../application/ports/session-repository'
import type { AttemptOutcome, NoteEvent, PracticeAttemptRecord, StoredSession } from '../../domain/practice/types'
import { isAnswerCorrect } from '../../domain/practice/answer'
import { createWordAccent } from '../../domain/music/composition'
import { mapLetterToMidi, NOTE_MAPPING_VERSION } from '../../domain/music/note-mapper'
import type { PracticeMode, VocabularyItem } from '../../domain/vocabulary/types'
import { VOCABULARY } from '../../data/vocabulary'

const SESSION_SIZE = 5

type ScreenState = 'setup' | 'active' | 'complete'
type FeedbackState = 'correct' | 'incorrect' | 'revealed' | 'skipped' | null

interface PracticeScreenProps {
  repository: SessionRepository
  audio: AudioEngine
  audioAvailable: boolean
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return 'wo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9)
}

export function PracticeScreen({ repository, audio, audioAvailable }: PracticeScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionStartedAtRef = useRef(0)
  const itemStartedAtRef = useRef(0)
  const lastNoteStartRef = useRef(-1)
  const attemptsRef = useRef<PracticeAttemptRecord[]>([])
  const noteEventsRef = useRef<NoteEvent[]>([])

  const [screen, setScreen] = useState<ScreenState>('setup')
  const [mode, setMode] = useState<PracticeMode>('recall')
  const [items, setItems] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [draft, setDraft] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const [answerWasVisible, setAnswerWasVisible] = useState(false)
  const [attempts, setAttempts] = useState<PracticeAttemptRecord[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedSession, setCompletedSession] = useState<StoredSession | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle')

  const currentItem = items[currentIndex]

  useEffect(() => {
    audio.setMuted(!soundEnabled)
  }, [audio, soundEnabled])

  useEffect(() => {
    if (screen === 'active' && feedback === null) {
      inputRef.current?.focus()
    }
  }, [screen, currentIndex, feedback])

  function appendAttempt(outcome: AttemptOutcome, visible: boolean): void {
    if (!currentItem) {
      return
    }

    const now = Date.now()
    const attempt: PracticeAttemptRecord = {
      id: createId(),
      itemId: currentItem.id,
      mode,
      outcome,
      answerWasVisible: visible,
      submittedAt: now,
      elapsedMs: Math.max(0, now - itemStartedAtRef.current),
    }
    const updated = attemptsRef.current.concat(attempt)

    attemptsRef.current = updated
    setAttempts(updated)
  }

  function startSession(): void {
    const selectedItems = VOCABULARY.slice(0, SESSION_SIZE)

    sessionStartedAtRef.current = Date.now()
    itemStartedAtRef.current = Date.now()
    lastNoteStartRef.current = -1
    attemptsRef.current = []
    noteEventsRef.current = []

    setItems(selectedItems)
    setCurrentIndex(0)
    setDraft('')
    setFeedback(null)
    setAnswerWasVisible(false)
    setAttempts([])
    setCompletedSession(null)
    setSaveState('idle')
    setScreen('active')
    void audio.unlock()
  }

  function handleSubmit(): void {
    if (!currentItem || feedback !== null || draft.trim().length === 0) {
      return
    }

    const correct = isAnswerCorrect(draft, currentItem.acceptedAnswers)
    appendAttempt(correct ? 'correct' : 'incorrect', answerWasVisible)

    if (correct) {
      const accentStart = Math.max(0, lastNoteStartRef.current + 120)
      const storedAccent = createWordAccent(currentItem.lemma, accentStart)
      noteEventsRef.current.push(...storedAccent)
      lastNoteStartRef.current = accentStart
      audio.playEvents(storedAccent.map((event) => ({ ...event, startMs: 0 })))
      setFeedback('correct')
    } else {
      setFeedback('incorrect')
    }
  }

  function handleRevealAnswer(): void {
    if (!currentItem || feedback !== 'incorrect' || answerWasVisible) {
      return
    }

    appendAttempt('revealed', true)
    setAnswerWasVisible(true)
    setFeedback('revealed')
  }

  function handleRetry(): void {
    if (feedback !== 'incorrect') {
      return
    }

    setDraft('')
    setFeedback(null)
    inputRef.current?.focus()
  }

  function handleSkip(): void {
    if (feedback === null) {
      appendAttempt('skipped', answerWasVisible)
      setFeedback('skipped')
    }
  }

  async function finishSession(): Promise<void> {
    const completedAt = Date.now()
    const session: StoredSession = {
      id: createId(),
      mode,
      startedAt: sessionStartedAtRef.current,
      completedAt,
      itemIds: items.map((item) => item.id),
      attempts: attemptsRef.current,
      noteEvents: noteEventsRef.current.slice().sort((left, right) => left.startMs - right.startMs),
      mappingVersion: NOTE_MAPPING_VERSION,
      presetId: 'soft-triangle-v1',
      tempo: 110,
    }

    setCompletedSession(session)
    setScreen('complete')
    setSaveState('saving')

    try {
      await repository.saveSession(session)
      setSaveState('saved')
    } catch {
      setSaveState('failed')
    }
  }

  function handleContinue(): void {
    if (!currentItem || feedback === null || feedback === 'incorrect') {
      return
    }

    if (currentIndex + 1 >= items.length) {
      void finishSession()
      return
    }

    setCurrentIndex((index) => index + 1)
    setDraft('')
    setFeedback(null)
    setAnswerWasVisible(false)
    itemStartedAtRef.current = Date.now()
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      event.preventDefault()

      if (feedback === null) {
        handleSubmit()
      } else if (feedback !== 'incorrect') {
        handleContinue()
      }

      return
    }

    if (
      feedback !== null ||
      event.nativeEvent.isComposing ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      !/^[a-z]$/i.test(event.key)
    ) {
      return
    }

    const midi = mapLetterToMidi(event.key)

    if (midi === null) {
      return
    }

    void audio.unlock()
    audio.playCharacter(event.key)

    const elapsed = Math.max(0, Date.now() - sessionStartedAtRef.current)
    const startMs =
      lastNoteStartRef.current < 0
        ? 0
        : Math.max(lastNoteStartRef.current + 70, Math.min(elapsed, lastNoteStartRef.current + 420))

    noteEventsRef.current.push({
      id: createId(),
      midi,
      startMs,
      durationMs: 170,
      kind: 'character',
    })
    lastNoteStartRef.current = startMs
  }

  function replayComposition(): void {
    if (!completedSession || completedSession.noteEvents.length === 0) {
      return
    }

    void audio.unlock()
    audio.playEvents(completedSession.noteEvents)
  }

  function resetToSetup(): void {
    setScreen('setup')
    setDraft('')
    setFeedback(null)
    setCompletedSession(null)
    setSaveState('idle')
  }

  if (screen === 'setup') {
    return (
      <section className="practice-page">
        <div className="intro-copy">
          <p className="eyebrow">YOUR DAILY MUSIC PRACTICE</p>
          <h1>让每一次拼写，<br />都成为一段旋律。</h1>
          <p className="intro-description">
            把英语回忆变成音乐。认真记住一个词，比快速敲完十个词更重要。
          </p>
        </div>

        <div className="setup-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">CHOOSE YOUR PRACTICE</p>
              <h2>今天想怎样练习？</h2>
            </div>
            <span className="word-count">{VOCABULARY.length} 个精选词条</span>
          </div>

          <div className="mode-options">
            <button
              className={mode === 'recall' ? 'mode-option selected' : 'mode-option'}
              type="button"
              aria-pressed={mode === 'recall'}
              onClick={() => setMode('recall')}
            >
              <span className="mode-number">01</span>
              <span className="mode-title">Recall · 主动回忆</span>
              <span className="mode-description">根据中文释义回忆英文单词。只有真正不看答案的回忆，才会形成学习证据。</span>
              <span className="mode-tag">更适合巩固记忆</span>
            </button>
            <button
              className={mode === 'copy' ? 'mode-option selected' : 'mode-option'}
              type="button"
              aria-pressed={mode === 'copy'}
              onClick={() => setMode('copy')}
            >
              <span className="mode-number">02</span>
              <span className="mode-title">Copy · 拼写练习</span>
              <span className="mode-description">跟随屏幕上的单词输入，熟悉拼写、键位和声音之间的联系。</span>
              <span className="mode-tag">键盘熟练度练习</span>
            </button>
          </div>

          <div className="setup-footer">
            <div className="session-detail">
              <span className="detail-dot" />
              <span>5 个单词 · 约 3–5 分钟 · 本地保存</span>
            </div>
            <button className="primary-button" type="button" onClick={startSession}>
              开始练习 <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <p className="principle-note">
          <span aria-hidden="true">✳</span>
          音乐是练习的反馈，不是学习成果的替代品。
        </p>
      </section>
    )
  }

  if (screen === 'complete' && completedSession) {
    const recallAttempts = completedSession.attempts.filter(
      (attempt) => attempt.mode === 'recall' && !attempt.answerWasVisible &&
        (attempt.outcome === 'correct' || attempt.outcome === 'incorrect'),
    )
    const recallCorrect = recallAttempts.filter((attempt) => attempt.outcome === 'correct').length
    const completedWords = new Set(
      completedSession.attempts
        .filter((attempt) => attempt.outcome === 'correct')
        .map((attempt) => attempt.itemId),
    ).size

    return (
      <section className="practice-page result-page">
        <div className="result-mark" aria-hidden="true">♫</div>
        <p className="eyebrow">SESSION COMPLETE</p>
        <h1>这一段旋律，<br />属于你。</h1>
        <p className="intro-description">练习已经结束。音乐作品和学习记录分别保存，不用追求完美速度。</p>

        <div className="result-card">
          <div className="result-stat">
            <strong>{completedWords}<small> / {completedSession.itemIds.length}</small></strong>
            <span>独立完成的单词</span>
          </div>
          <div className="result-stat">
            <strong>{completedSession.attempts.length}</strong>
            <span>练习尝试次数</span>
          </div>
          <div className="result-stat">
            <strong>{recallAttempts.length > 0 ? Math.round((recallCorrect / recallAttempts.length) * 100) + '%' : '—'}</strong>
            <span>无提示回忆正确率</span>
          </div>
        </div>

        <div className="save-status" role="status">
          {saveState === 'saving' && '正在保存本次练习…'}
          {saveState === 'saved' && '✓ 本次学习记录已保存在此设备'}
          {saveState === 'failed' && '暂时无法保存到此设备。本次作品仍可在当前页面回放，请检查浏览器存储权限。'}
        </div>

        <div className="result-actions">
          <button className="primary-button" type="button" onClick={replayComposition} disabled={completedSession.noteEvents.length === 0}>
            <span aria-hidden="true">▶</span> 回放我的作品
          </button>
          <button className="secondary-button" type="button" onClick={resetToSetup}>再练习一次</button>
        </div>
        <p className="principle-note">Copy 练习只计入键盘练习，不会被算作词汇掌握。</p>
      </section>
    )
  }

  return (
    <section className="practice-page active-practice">
      <div className="practice-topline">
        <div>
          <p className="eyebrow">WORD ORCHESTRA / PRACTICE</p>
          <span className="session-label">{mode === 'recall' ? '主动回忆' : '拼写练习'} · SESSION 01</span>
        </div>
        <button
          className={soundEnabled ? 'sound-button' : 'sound-button muted'}
          type="button"
          aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled((enabled) => !enabled)}
        >
          <span aria-hidden="true">{soundEnabled ? '♫' : '♪'}</span>
          {soundEnabled ? '声音开启' : '声音关闭'}
        </button>
      </div>

      <div className="session-progress" aria-label={'第 ' + (currentIndex + 1) + ' 个，共 ' + items.length + ' 个单词'}>
        <div className="progress-track">
          <span style={{ width: (100 * (currentIndex + 1)) / items.length + '%' }} />
        </div>
        <span>{String(currentIndex + 1).padStart(2, '0')} <i>/</i> {String(items.length).padStart(2, '0')}</span>
      </div>

      {currentItem && (
        <div className="exercise-card">
          <div className="prompt-area">
            <p className="eyebrow">{mode === 'recall' ? 'MEANING → SPELLING' : 'LOOK → TYPE → LISTEN'}</p>
            <p className="prompt-caption">{mode === 'recall' ? '根据释义，回忆对应的英文单词' : '请按照屏幕上的单词进行输入'}</p>
            <h2 className={mode === 'recall' ? 'prompt-word meaning-prompt' : 'prompt-word'}>
              {mode === 'recall' ? currentItem.meaningZh : currentItem.lemma}
            </h2>
            {mode === 'copy' && <p className="prompt-ipa">{currentItem.ipa} <span>·</span> {currentItem.cefr}</p>}
            {mode === 'recall' && <p className="prompt-ipa">{currentItem.cefr} <span>·</span> {currentItem.partOfSpeech}</p>}
          </div>

          <div className="answer-area">
            <label htmlFor="practice-answer">你的答案</label>
            <input
              ref={inputRef}
              id="practice-answer"
              aria-label="输入英文单词"
              aria-describedby="answer-help"
              className="answer-input"
              type="text"
              value={draft}
              disabled={feedback !== null}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="在这里输入英文…"
              onChange={(event) => setDraft(event.target.value.replace(/[^a-zA-Z]/g, ''))}
              onKeyDown={handleInputKeyDown}
              onPaste={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()}
            />
            <p className="input-help" id="answer-help">
              输入字母即可听到音符 · Enter 提交 · 暂不支持粘贴
            </p>
            {feedback === null && (
              <div className="answer-actions">
                <button className="primary-button submit-button" type="button" onClick={handleSubmit} disabled={draft.trim().length === 0}>
                  检查答案 <span aria-hidden="true">↗</span>
                </button>
                <button className="text-button" type="button" onClick={handleSkip}>跳过这个词</button>
              </div>
            )}
          </div>

          {feedback && (
            <div className={'feedback-panel ' + feedback} role="status">
              {feedback === 'correct' && (
                <>
                  <strong>很好，拼写正确。</strong>
                  <p>{currentItem.lemma} · {currentItem.ipa}</p>
                  <p className="example-line">{currentItem.exampleEn}</p>
                  <p className="example-translation">{currentItem.exampleZh}</p>
                </>
              )}
              {feedback === 'incorrect' && (
                <>
                  <strong>还差一点，再试一次。</strong>
                  <p>慢慢回忆，不需要追求速度。</p>
                  <div className="feedback-actions">
                    <button className="secondary-button" type="button" onClick={handleRetry}>重新输入</button>
                    <button className="text-button" type="button" onClick={handleRevealAnswer}>查看答案</button>
                  </div>
                </>
              )}
              {feedback === 'revealed' && (
                <>
                  <strong>答案是 {currentItem.lemma}</strong>
                  <p>{currentItem.meaningZh} · {currentItem.ipa}</p>
                  <p className="example-line">{currentItem.exampleEn}</p>
                  <p className="example-translation">{currentItem.exampleZh}</p>
                  <p className="evidence-note">本次已查看答案，因此不会记为成功回忆。</p>
                </>
              )}
              {feedback === 'skipped' && (
                <>
                  <strong>已跳过这个词。</strong>
                  <p>跳过不会扣分，也不会生成掌握记录。</p>
                </>
              )}
              {feedback !== 'incorrect' && (
                <button className="primary-button continue-button" type="button" onClick={handleContinue}>
                  {currentIndex + 1 === items.length ? '完成本次练习' : '下一个单词'} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="practice-footnote">
        <span>{attempts.length} 次尝试</span>
        <span>本地练习 · 不上传输入内容</span>
      </div>

      {!audioAvailable && (
        <p className="audio-warning" role="status">当前浏览器不支持 Web Audio，仍可完成练习，但不会播放音符。</p>
      )}
    </section>
  )
}
