# training-sessions: Implementation Plan

Inputs: `tasks/training-sessions/requirements.md`, `frontend-accelerator-onboarding/TASK.md`, and the developer decisions listed below.
Scope: this plan only. No production code is written by this role.

## Developer Decisions Applied

| # | Open question | Decision | Source |
| --- | --- | --- | --- |
| 1 | Mock mechanism | MSW | developer |
| 2 | Test tooling | Vitest + React Testing Library + user-event + jsdom + jest-dom, with MSW `setupServer` for the test network layer | plan's choice (developer: "most appropriate and standard"). Reason: Vite-native, reuses `vite.config.ts`, and is the conventional pairing for a Vite + React project |
| 3 | Statuses | `scheduled`, `completed`, `cancelled` | developer |
| 4 | Session shape and request boundary | Contract in "Contracts" below | plan's choice (developer: "most appropriate and standard") |
| 5 | Create form placement | Modal dialog | developer |
| 6 | List-error recovery | Error message with a `Retry` button | developer |
| 7 | New dev dependencies and `test` script | Allowed | developer |
| 8 | Create-request failure | One understandable, recoverable error state inside the modal | developer |

Plan-level assumptions (not decided by the developer; change them before `coder` starts if wrong):
- A newly created session always gets status `scheduled`; the form has no status field.
- The filter is a single select with `All` plus the three statuses.
- Filtering is done on the client over the loaded list.
- "Future" means later than the browser's current local time at submit.
- Created sessions live only in the mock's in-memory store (reset on page reload and between tests).

## Current Behavior

- The Vite React + TypeScript template. `src/App.tsx` is the starter counter page; `src/App.css` and `src/index.css` are starter styles.
- Scripts: `dev`, `build` (`tsc -b && vite build`), `lint` (`eslint .`), `preview`. No `test` script.
- No HTTP client code, mock mechanism, or test tooling.
- Constraints from existing config that affect the code: `erasableSyntaxOnly` (no `enum`, no constructor parameter properties), `verbatimModuleSyntax` (use `import type` for types), `noUnusedLocals`/`noUnusedParameters`, ESLint with `react-hooks` (v7 recommended) and `react-refresh` (component files should export only components).

## Intended Behavior

See the acceptance criteria in `requirements.md`. In short: on open the workspace loads sessions through the request boundary, shows loading, then the list (title, status, start date/time); the user filters by `All`/one status; a list failure shows an error with `Retry`; the user opens a modal, creates a session (validated title and future date/time, no double submit), and the new session appears in the list.

## Contracts

### Session model (`src/features/sessions/types.ts`)

```ts
type SessionStatus = 'scheduled' | 'completed' | 'cancelled'
type StatusFilter = 'all' | SessionStatus
interface Session { id: string; title: string; status: SessionStatus; startsAt: string /* ISO 8601 UTC */ }
interface CreateSessionInput { title: string; startsAt: string /* ISO 8601 UTC */ }
```

Use a `const` array plus a union type for statuses (no `enum`).

### HTTP boundary

| Call | Request | Success | Failure |
| --- | --- | --- | --- |
| List | `GET /api/sessions` | `200` `Session[]` | non-2xx or network error |
| Create | `POST /api/sessions` body `CreateSessionInput` (JSON) | `201` created `Session` (status `scheduled`, server-assigned `id`) | non-2xx or network error |

- UI code never calls `fetch` directly. It uses `src/api/sessionsApi.ts`: `fetchSessions(signal?): Promise<Session[]>` and `createSession(input): Promise<Session>`. Both throw an `Error` on non-2xx or network failure.
- Replacing the mock with a real backend means changing only the base URL (a single constant) and removing MSW startup. No UI changes.

### UI-level contracts

- `useSessions()` returns `{ status: 'loading' | 'error' | 'success', sessions, retry, addSession }`.
- `validateSessionForm({ title, startsAt }, now: Date)` returns `{ title?: string; startsAt?: string }` (empty object means valid). Pure function, no React.
- Title rule: `title.trim().length` between 3 and 80 inclusive. The trimmed value is what is sent.
- Date rule: required; must parse; must be strictly later than `now`. The `datetime-local` value is read as local time and converted to ISO UTC before sending.
- `CreateSessionModal` props: `{ onClose(): void; onCreated(session: Session): void }`. It owns the form state, its submit-pending flag, and its create-error message.

## Files

### Create

| File | Why |
| --- | --- |
| `src/features/sessions/types.ts` | Session model and statuses (contract above). |
| `src/api/sessionsApi.ts` | The replaceable request boundary (`fetchSessions`, `createSession`, base URL constant). |
| `src/features/sessions/validation.ts` | Pure title/date validation, easy to test and reuse. |
| `src/features/sessions/useSessions.ts` | Loading/error/success state, request cancellation (`AbortController`, safe under StrictMode double mount), `retry`, `addSession`. |
| `src/features/sessions/SessionsWorkspace.tsx` | Page container: filter state, filtered list, open/close of the modal, wiring. |
| `src/features/sessions/StatusFilter.tsx` | Labeled select with `All` + statuses. |
| `src/features/sessions/SessionList.tsx` | Renders title, status, and formatted start date/time per session; also the empty-after-filter message. |
| `src/features/sessions/CreateSessionModal.tsx` | Modal form with validation messages, pending-state submit lock, and create-error message. |
| `src/features/sessions/sessions.css` | Styles for the feature (kept out of the template CSS). |
| `src/mocks/data.ts` | Initial sessions: at least two per status (mix of past and future dates) so filtering is observable; helper to reset the in-memory store. |
| `src/mocks/handlers.ts` | MSW handlers for `GET`/`POST /api/sessions`, using the in-memory store; assign `id`, status `scheduled`. Dev-only failure switch: `?mockError=list` or `?mockError=create` in the page URL makes the matching handler return `500`, so error states can be seen manually. |
| `src/mocks/browser.ts` | `setupWorker(...handlers)` for the browser. |
| `src/mocks/server.ts` | `setupServer(...handlers)` for tests. |
| `src/test/setup.ts` | Registers `@testing-library/jest-dom/vitest`, starts/resets/closes the MSW server around tests, resets the mock store. |
| `src/features/sessions/SessionsWorkspace.test.tsx` | The essential behavior test (see "Tests"). |
| `public/mockServiceWorker.js` | Generated by the MSW CLI (`msw init`); required for the browser worker. Do not hand-edit. |

### Modify

| File | Change and why |
| --- | --- |
| `package.json` | Add dev dependencies (`msw`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`), a `"test": "vitest run"` script, and the `msw.workerDirectory` entry for `public`. Existing scripts stay unchanged. Approved by decision 7. |
| `package-lock.json` | Updated by the package manager. |
| `vite.config.ts` | Add the `test` block (jsdom environment, `setupFiles: ['./src/test/setup.ts']`, `globals: false`). Import `defineConfig` from `vitest/config` (or use the triple-slash reference) so the `test` key type-checks. Keep the React plugin. |
| `src/main.tsx` | In dev only (`import.meta.env.DEV`), dynamically import and start the MSW worker, then render. Production behavior unchanged. |
| `src/App.tsx` | Replace the starter counter content with `<SessionsWorkspace />`. |
| `src/App.css`, `src/index.css` | Remove or neutralize template layout rules that would interfere (for example fixed centering of `#root`); keep global base styles. Minimal edits only. |
| `index.html` | Optional: change the page title. Skip if no reason. |

No change to `eslint.config.js` or the TypeScript configs is planned. If `tsc -b` cannot resolve types for the test files, the fix is to adjust `tsconfig.app.json` `types` minimally (for example add `vitest/globals` only if `globals` is turned on) and record it. Unused template assets (`src/assets/*`) may stay.

## Implementation Order

Dependencies are shown by step number. Steps marked "parallel" can proceed independently once their prerequisites are done.

1. **Tooling.** Install dev dependencies, add the `test` script, extend `vite.config.ts`, add `src/test/setup.ts`, generate `public/mockServiceWorker.js`. Prove tooling with `npm test` (no tests yet exits non-zero in Vitest, so add the real test in step 8 or temporarily confirm with `vitest run --passWithNoTests`).
2. **Contracts.** `types.ts`, `validation.ts`, `sessionsApi.ts`.
3. **Mocks** (needs 2): `data.ts`, `handlers.ts`, `browser.ts`, `server.ts`; wire the worker in `main.tsx`.
4. **State** (needs 2): `useSessions.ts`.
5. **Presentational components** (needs 2; parallel with 4): `StatusFilter.tsx`, `SessionList.tsx`.
6. **Create modal** (needs 2 and 5's styling conventions): `CreateSessionModal.tsx`.
7. **Workspace and app wiring** (needs 4, 5, 6): `SessionsWorkspace.tsx`, `sessions.css`, `App.tsx`, CSS cleanups.
8. **Essential test** (needs 3 and 7): `SessionsWorkspace.test.tsx`.
9. **Verification** (needs all): run the commands below, then the manual browser check.

## Behavior Details To Preserve

- **Loading:** shown while the list request is pending (including after `Retry`). Use an accessible status region.
- **List error:** one message in plain language ("could not load sessions") plus a `Retry` button; the button re-issues the same request and returns to the loading state.
- **Filter:** changing the filter never refetches; it filters the loaded list. If the filter yields no rows, show a short empty message (no extra scope).
- **Modal:** opens from a "Create session" button; has a title, labeled fields (`Title`, `Date and time`), `Create` and `Cancel` buttons, `role="dialog"`, `aria-modal`, closes on `Cancel` and on `Escape`. Implement it as a conditionally rendered element with `role="dialog"` (not the native `<dialog>.showModal()`, which jsdom does not fully support, to keep tests reliable). Move focus into the modal on open and return it to the opening button on close.
- **Validation:** run on submit (and clear a field's message when that field changes). Messages name the field and the problem, for example "Title must be 3–80 characters" and "Choose a date and time in the future". Invalid input sends no request.
- **No double submit:** while the create request is pending, the `Create` button is disabled and a guard in the handler ignores a second submit.
- **Create success:** the new session is appended to the loaded list and visible according to the current filter (a new `scheduled` session shows under `All` and `scheduled`); the modal closes.
- **Create failure:** the modal stays open, keeps the entered values, shows one understandable error message, and re-enables `Create` so the user can retry.

## Tests

### Essential (required by TASK.md)

`src/features/sessions/SessionsWorkspace.test.tsx`, behavior-level, using Testing Library queries by role/label and the MSW test server (no mocking of `fetch` or of the API module):

1. Renders the workspace, sees the loading state, then the sessions from the mock (titles, statuses, date/time).
2. Selects a status in the filter and sees only sessions of that status; selecting `All` shows all again.
3. Opens the create modal, submits a valid title and a future date/time, and sees the new session in the list.

If one test file grows too large, split the three flows into separate `it` blocks in the same file; the minimum required is one passing behavior-level test of the main flow.

### Additional, risk-based (not required, listed separately)

- `validation.ts` unit tests: title length boundaries (2/3/80/81 chars, whitespace-only, surrounding whitespace), past/equal/future date, empty date.
- List request failure shows the error and `Retry` recovers (override the handler with `server.use`).
- Create request failure keeps the modal open with the error message.
- Double click on `Create` sends exactly one `POST`.

## Verification Commands

Existing, discovered from `package.json` at the repository root:

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint over the project |
| `npm run build` | `tsc -b && vite build` (type check and production build) |
| `npm run dev` | Start the Vite dev server (the URL is printed by Vite; do not assume a port) |
| `npm run preview` | Serve the production build (MSW is dev-only, so the list will fail here by design) |

Added by this plan (available only after step 1): `npm test` (`vitest run`).

Dependency installation is required for step 1 and is approved by decision 7. Run `npm install` for the new dev dependencies; the verification commands above are not run by this plan.

### Manual browser check (record actual observations)

Start `npm run dev`, open the printed URL, and exercise once: list loads → filter by a status and back to `All` → open the modal → try an invalid title and a past date (see messages) → create a valid session → see it in the list. Optionally open the URL with `?mockError=list` to see the error and `Retry`, and `?mockError=create` to see the create failure.

## Risks And Notes

- Adding MSW and Vitest changes `package.json`, the lockfile, and `vite.config.ts`. This is addition, not rewrite, but it is the largest diff outside `src/`.
- MSW version and Vitest/jsdom versions must be compatible with Vite 8, React 19, and Node 24; `coder` must confirm the current compatible versions at install time (use the Context7 helper if documentation is needed) instead of copying versions from this plan.
- `react-hooks` v7 lint rules are strict about setting state inside effects; structure `useSessions` so lint passes without suppressing rules.
- `datetime-local` has no timezone; convert explicitly and test with a fixed `now` in validation unit tests if the additional tests are added.
- No rollback or feature flag is needed. The change is isolated to new files plus small edits in `App.tsx`, `main.tsx`, styles, `package.json`, and `vite.config.ts`.

## Open Items For The Developer

- Confirm the plan-level assumptions (new session is `scheduled`, one select filter, client-side filtering).
- Confirm that the dev-only `?mockError=` switch for manual error checks is acceptable (it is small and lives only in the mock handlers).
- `architect`, `api-integration`, and `ui-designer` are not required; the contract and modal behavior above were settled in this plan.

Task identifier: `training-sessions`. Recommended next command (not started): `coder`.
