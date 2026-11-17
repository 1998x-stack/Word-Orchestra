import { useState } from 'react'
import { PracticeScreen } from '../features/practice/PracticeScreen'
import { ProgressScreen } from '../features/progress/ProgressScreen'
import { IndexedDbSessionRepository } from '../infrastructure/persistence/indexeddb-session-repository'
import './styles.css'

const sessionRepository = new IndexedDbSessionRepository()

type AppView = 'practice' | 'progress'

export function App() {
  const [view, setView] = useState<AppView>('practice')

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Word Orchestra 首页" onClick={(event) => {
          event.preventDefault()
          setView('practice')
        }}>
          <span className="brand-mark" aria-hidden="true">♫</span>
          <span className="brand-name">WORD <b>ORCHESTRA</b></span>
        </a>

        <nav className="main-nav" aria-label="主导航">
          <button
            className={view === 'practice' ? 'nav-link active' : 'nav-link'}
            type="button"
            aria-current={view === 'practice' ? 'page' : undefined}
            onClick={() => setView('practice')}
          >
            练习室
          </button>
          <button
            className={view === 'progress' ? 'nav-link active' : 'nav-link'}
            type="button"
            aria-current={view === 'progress' ? 'page' : undefined}
            onClick={() => setView('progress')}
          >
            学习记录
          </button>
        </nav>

        <span className="local-indicator"><i /> LOCAL FIRST</span>
      </header>

      <main>
        <div hidden={view !== 'practice'}>
          <PracticeScreen repository={sessionRepository} />
        </div>
        {view === 'progress' && <ProgressScreen repository={sessionRepository} />}
      </main>

      <footer className="site-footer">
        <span>WORD ORCHESTRA</span>
        <span>LEARN WITH RHYTHM · GROW WITH TIME</span>
      </footer>
    </div>
  )
}
