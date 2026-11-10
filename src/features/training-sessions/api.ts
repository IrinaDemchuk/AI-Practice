import type { CreateSessionInput, TrainingSession } from './types'

function sessionsUrl(): string {
  return new URL('/api/sessions', window.location.origin).toString()
}

export async function listSessions(
  signal?: AbortSignal,
): Promise<TrainingSession[]> {
  const response = await fetch(sessionsUrl(), { signal })
  if (!response.ok) {
    throw new Error(`Failed to load sessions (${response.status})`)
  }
  return (await response.json()) as TrainingSession[]
}

export async function createSession(
  input: CreateSessionInput,
): Promise<TrainingSession> {
  const response = await fetch(sessionsUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to create session (${response.status})`)
  }
  return (await response.json()) as TrainingSession
}
