import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSession, listSessions } from './api'
import type {
  CreateSessionInput,
  SessionFilterValue,
  TrainingSession,
} from './types'

export type LoadStatus = 'loading' | 'success' | 'error'

export function useTrainingSessions() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [filter, setFilter] = useState<SessionFilterValue>('all')
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    listSessions(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setSessions(data)
        setLoadStatus('success')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setLoadStatus('error')
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setLoadStatus('loading')
    setAttempt((n) => n + 1)
  }, [])

  const create = useCallback(async (input: CreateSessionInput) => {
    const created = await createSession(input)
    setSessions((prev) => [...prev, created])
    setFilter((current) =>
      current === 'all' || current === created.status ? current : 'all',
    )
  }, [])

  const visibleSessions = useMemo(
    () =>
      filter === 'all' ? sessions : sessions.filter((s) => s.status === filter),
    [sessions, filter],
  )

  return {
    sessions,
    visibleSessions,
    filter,
    setFilter,
    loadStatus,
    retry,
    create,
  }
}
