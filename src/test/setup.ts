import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetSessions } from '../mocks/handlers'
import { server } from '../mocks/server'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetSessions()
  cleanup()
})
afterAll(() => server.close())
