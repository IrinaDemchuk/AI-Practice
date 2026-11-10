# training-sessions: Training Sessions Workspace

Source: `frontend-accelerator-onboarding/TASK.md` (only source used for requirements).

## Goal

A small frontend workspace where a trainer can view training sessions loaded from a mock API, filter them by one status, and create a new session that then appears in the list.

## Users And Outcome

- **User:** a trainer.
- **Outcome:** the trainer opens the workspace, sees sessions, narrows them by status, creates a session with a valid title and a future date/time, and sees it in the list.
- The exercise practises the accelerator workflow, so scope is deliberately small.

## Acceptance Criteria

### Sessions list

- [ ] On open, the workspace requests sessions from a mock API and shows them.
- [ ] Each session shows its title, status, and start date/time.
- [ ] A status filter offers an `All` option plus one status filter (selecting a status shows only sessions with that status; `All` shows every session).
- [ ] While the sessions request is pending, a loading state is visible.
- [ ] When the sessions request fails, one understandable error state is shown and the user can recover from it (for example, retry the request).

### Create session

- [ ] The user can open a create form.
- [ ] The form requires a title; the title is trimmed and must be 3 to 80 characters long.
- [ ] The form requires a date and time, and it must be in the future.
- [ ] Invalid input is not submitted and a useful validation message is shown (the message tells which field is wrong and why).
- [ ] While the create request is pending, the form cannot be submitted a second time (no duplicate submission).
- [ ] After a successful create, the new session is added to the visible list.

### Mock boundary

- [ ] Mock data sits behind an HTTP client or an equivalent replaceable request boundary, so the mock can be swapped for a real backend without changing UI code.
- [ ] No backend service is implemented.

### Essential test

- [ ] At least one behavior-level automated test covers the main flow (filtering or successful creation) and passes.

### Manual check

- [ ] The application is started with a documented repository command, and the list, filter, and create flow is exercised once in a browser.
- [ ] What was actually observed is recorded (screenshots and the `browser-verify` role are optional).

## Constraints

- Use the repository's existing framework, package manager, scripts, and test stack.
- Do not rewrite unrelated code or configuration.
- Do not add features outside the required flow until onboarding is complete.
- Report incomplete behavior honestly instead of claiming an unperformed check.
- Use the repository's existing mock mechanism; if none exists, MSW or another conventional HTTP mock is acceptable.

## Non-Goals (Out Of Scope)

- Session details, drawers, or deep links.
- Search or multiple filters.
- Pagination.
- A complete API contract or scenario matrix.
- Desktop/mobile screenshot sets.
- Exhaustive responsive and accessibility validation.
- Full test coverage.
- CI, deployment, or a public URL.
- Strict TypeScript migration or unrelated refactoring.
- A backend service.

## Facts

- The repository is the default Vite React + TypeScript template: React 19, TypeScript 6, Vite 8.
- `package.json` scripts: `dev`, `build`, `lint`, `preview`. There is no `test` script.
- `src/` contains only the template placeholder (`main.tsx`, `App.tsx` with the starter counter, `App.css`, `index.css`, assets). No sessions-related code exists.
- No mock mechanism is present (no MSW or similar) and no HTTP client library is present.
- No test tooling is present (no vitest, jest, or testing-library).
- No `specs/` or `docs/` directory exists.

## Assumptions

- The repository root is the only frontend application, so it is the Application Root.
- A session has at least: an identifier, a title, a status, and a start date/time. The exact set of statuses is not defined in the source and is not assumed here.
- "Future" is measured against the user's current local time at submission.
- "Recoverable" error state means the user can trigger the request again without reloading the page.
- The mock returns an initial set of sessions that contains more than one status, so filtering is observable.
- The created session lives only for the mock's lifetime (no persistence beyond the mock is required).

## Open Questions

1. **Mock mechanism is missing (open task).** The repository has no mock mechanism. One must be added. The tool choice (MSW or another conventional HTTP mock) is for a later role, not decided here. Owner: `architect` / `api-integration`.
2. **Test tooling is missing (open task).** The repository has no test stack, but the essential automated test and a passing run are required. Tooling must be added; the choice is for a later role. Owner: `architect`, then `coder` / `test-generator`.
3. **Set of statuses.** Which statuses exist (names and count) and which one the "one status filter" refers to is not specified. Needs a human decision or a documented default in the API contract. Owner: `api-integration`.
4. **Session shape and request boundary.** Exact fields, endpoint paths, and request/response shape for list and create are not defined. Owner: `api-integration`.
5. **Create form placement.** Whether the form is a modal, inline panel, or separate view is not defined. Owner: `ui-designer` (optional) or the plan.
6. **Recovery action.** The form of recovery from a list-request error (retry button or other) is not defined. Owner: `ui-designer` or the plan.
7. **Adding dependencies.** The constraint says to keep the existing stack, but mock and test tooling require new dev dependencies and a `test` script. Confirm this is acceptable (assumed yes, as these are additions, not rewrites). Needs human confirmation.
8. **Create-request failure.** TASK.md defines an error state only for the list request. Behavior when the create request fails is not specified.

## Readiness

Ready for `writing-plans` after the human reviews open questions 1–3 and 7. Questions 3–6 may be resolved inside the plan; `architect` and `api-integration` are optional and recommended only if the plan cannot settle the mock/test tooling and the request boundary.

Task identifier: `training-sessions`.
