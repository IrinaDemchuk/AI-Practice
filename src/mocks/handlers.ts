import { HttpResponse, delay, http } from 'msw'
import type {
  CreateSessionInput,
  TrainingSession,
} from '../features/training-sessions/types'
import { seedSessions } from './data'

let sessions: TrainingSession[] = [...seedSessions]
let nextId = 100

export function resetSessions(): void {
  sessions = [...seedSessions]
  nextId = 100
}

export function createHandlers(delayMs = 0) {
  return [
  http.get('/api/sessions', async () => {
    if (delayMs) await delay(delayMs)
    return HttpResponse.json(sessions)
  }),
  http.post('/api/sessions', async ({ request }) => {
    if (delayMs) await delay(delayMs)
    const body = (await request.json().catch(() => null)) as Partial<CreateSessionInput> | null
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const startsAt = body?.startsAt
    if (
      title.length < 3 ||
      title.length > 80 ||
      typeof startsAt !== 'string' ||
      Number.isNaN(new Date(startsAt).getTime())
    ) {
      return HttpResponse.json({ message: 'Invalid session' }, { status: 400 })
    }
    const created: TrainingSession = {
      id: `s-${nextId++}`,
      title,
      status: 'scheduled',
      startsAt,
    }
    sessions.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
]
}

export const handlers = createHandlers()
