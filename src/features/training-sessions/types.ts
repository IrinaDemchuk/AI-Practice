export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'
export type SessionFilterValue = 'all' | SessionStatus

export interface TrainingSession {
  id: string
  title: string
  status: SessionStatus
  /** ISO 8601 UTC */
  startsAt: string
}

export interface CreateSessionInput {
  title: string
  /** ISO 8601 UTC */
  startsAt: string
}
