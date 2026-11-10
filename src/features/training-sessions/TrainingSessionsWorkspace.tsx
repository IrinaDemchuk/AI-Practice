import { useState } from 'react'
import { CreateSessionModal } from './CreateSessionModal'
import { SessionFilter } from './SessionFilter'
import { SessionList } from './SessionList'
import { useTrainingSessions } from './useTrainingSessions'

export function TrainingSessionsWorkspace() {
  const { visibleSessions, filter, setFilter, loadStatus, retry, create } =
    useTrainingSessions()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <main className="ts-workspace">
      <header className="ts-header">
        <h1>Training sessions</h1>
        <button type="button" onClick={() => setModalOpen(true)}>
          Create session
        </button>
      </header>
      <SessionFilter value={filter} onChange={setFilter} />
      <SessionList
        loadStatus={loadStatus}
        sessions={visibleSessions}
        onRetry={retry}
      />
      <CreateSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={create}
      />
    </main>
  )
}
