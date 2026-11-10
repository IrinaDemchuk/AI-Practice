import { setupWorker } from 'msw/browser'
import { createHandlers } from './handlers'

// Browser-only: small artificial delay so the loading state is visible.
// Tests use the undelayed `handlers` via `server.ts`.
export const worker = setupWorker(...createHandlers(300))
