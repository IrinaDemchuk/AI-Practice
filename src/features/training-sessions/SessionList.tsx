import { STATUS_LABELS, formatStartsAt } from './format'
import type { LoadStatus } from './useTrainingSessions'
import type { TrainingSession } from './types'

interface Props {
  loadStatus: LoadStatus
  sessions: TrainingSession[]
  onRetry: () => void
}

export function SessionList({ loadStatus, sessions, onRetry }: Props) {
  if (loadStatus === 'loading') {
    return <p role="status">Loading sessions...</p>
  }
  if (loadStatus === 'error') {
    return (
      <div role="alert" className="ts-error">
        <p>Could not load sessions. Please try again.</p>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }
  if (sessions.length === 0) {
    return <p className="ts-empty">No sessions yet</p>
  }
  return (
    <ul className="ts-list">
      {sessions.map((session) => (
        <li key={session.id} className="ts-item">
          <h2>{session.title}</h2>
          <span className={`ts-status ts-status-${session.status}`}>
            {STATUS_LABELS[session.status]}
          </span>
          <time dateTime={session.startsAt}>
            {formatStartsAt(session.startsAt)}
          </time>
        </li>
      ))}
    </ul>
  )
}
