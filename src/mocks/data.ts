import type { TrainingSession } from '../features/training-sessions/types'

export const seedSessions: TrainingSession[] = [
  {
    id: 's-1',
    title: 'Onboarding basics',
    status: 'completed',
    startsAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 's-2',
    title: 'React fundamentals',
    status: 'completed',
    startsAt: '2026-02-03T13:30:00.000Z',
  },
  {
    id: 's-3',
    title: 'Testing workshop',
    status: 'scheduled',
    startsAt: '2030-03-10T10:00:00.000Z',
  },
  {
    id: 's-4',
    title: 'Accessibility review',
    status: 'scheduled',
    startsAt: '2030-04-02T15:00:00.000Z',
  },
  {
    id: 's-5',
    title: 'Legacy tooling overview',
    status: 'cancelled',
    startsAt: '2026-05-20T11:00:00.000Z',
  },
]
