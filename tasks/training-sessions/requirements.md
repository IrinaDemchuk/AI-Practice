# training-sessions: Training Sessions Workspace

Source: `/home/user/my-app/frontend-accelerator-onboarding/TASK.md` (only source used).

## Goal

Build a small frontend workspace that lets a trainer view, filter, and create training sessions. The exercise practises the accelerator workflow, so product and technical scope are deliberately small.

## Users And Outcome

- User: a trainer.
- Outcome: the trainer opens the workspace and sees sessions loaded from a mock API. They filter by one status, open a create form, create a session with a title and a future date/time, and see it in the list.

## Acceptance Criteria

### Main flow
- [ ] On open, the workspace loads and shows sessions from a mock API.
- [ ] The user can filter sessions by one status.
- [ ] The user can open a create form.
- [ ] The user can create a session with a title and a future date/time.
- [ ] The created session appears in the visible list.

### Sessions list
- [ ] Each session shows its title, status, and start date/time.
- [ ] The filter offers an `All` option plus one status filter at a time.
- [ ] A loading state is shown while the list request is pending.
- [ ] One understandable, recoverable request-error state is shown when the request fails. Recoverable means the user can recover from it, for example by retrying. The exact mechanism is an open question.

### Create session
- [ ] The title is trimmed and must be 3 to 80 characters long.
- [ ] The date and time are required and must be in the future.
- [ ] A second submission is prevented while the create request is pending.
- [ ] A useful validation message is shown for invalid input.
- [ ] A successfully created session is added to the visible list.

### Mock boundary
- [ ] Mock data sits behind an HTTP client or an equivalent replaceable request boundary.
- [ ] The repository's existing mock mechanism is used. None exists (see Facts), so MSW or another conventional HTTP mock is acceptable.
- [ ] No backend service is implemented.

### Essential test
- [ ] At least one behavior-level automated test covers the main flow. It may cover filtering or successful creation.

### Manual check
- [ ] The application is started, and the list, filter, and create flow is exercised once in a browser.
- [ ] What was actually observed is recorded. Incomplete behavior is reported honestly, and no unperformed check is claimed.

## Constraints

- Use the repository's existing framework (React + TypeScript), package manager, and scripts.
- Do not rewrite unrelated code or configuration.
- Do not add features outside the required flow until onboarding is complete.
- Report incomplete behavior honestly instead of claiming an unperformed check.
- Do not implement a backend service.

## Non-Goals (Out of Scope)

Explicitly optional per TASK.md, not required for onboarding:

- session details, drawers, or deep links;
- search or multiple filters;
- pagination;
- a complete API contract or scenario matrix;
- desktop/mobile screenshot sets;
- exhaustive responsive and accessibility validation;
- full test coverage;
- CI, deployment, or a public URL;
- strict TypeScript migration or unrelated refactoring;
- the `browser-verify` role and screenshots (optional).

## Facts

- The project is currently an empty React + TypeScript app.
- **There is no mock mechanism in the repository.** Creating one is an OPEN TASK for later roles.
- **There are no tests and no test stack in the repository.** Creating them is an OPEN TASK for later roles.
- Tooling choices, both the mock tool and the test tool, are deferred to later roles. This document does not select them.
- TASK.md allows MSW or another conventional HTTP mock when no mock mechanism exists.

## Assumptions

- "Existing test stack" in TASK.md cannot apply, because none exists. A test stack must be introduced by a later role.
- "Status" values are not defined by TASK.md. A small fixed set is assumed, to be confirmed.
- "Future" is measured against the user's local current time at submit.
- A new session gets a default status chosen by the mock layer or a later role. TASK.md does not say which.
- The list is held in client state and updated on successful creation. Whether it is refetched is a later decision.
- The filter is applied to the displayed list, and the created session is shown according to the active filter. This is unconfirmed.

## Open Questions

1. **Mock mechanism (open task, owner: architect / api-integration):** none exists. Which HTTP mock should be set up, and how does the request boundary stay replaceable?
2. **Test tooling (open task, owner: architect / later roles):** no test stack exists. Which runner and tools should be used, and what is the minimum setup for the one behavior-level test?
3. What is the set of session statuses, and what status does a newly created session get? (owner: api-integration / product)
4. What does "recoverable" mean for the error state: a retry button, or something else? (owner: ui-designer / brainstorm)
5. If a session is created while a filter is active and it does not match the filter, should it be visible immediately? "See the created session in the list" is ambiguous here. (owner: brainstorm)
6. What should the empty list state show? TASK.md does not specify it. It is not required, but the behavior is implied by filtering. (owner: ui-designer)
7. How should date/time be displayed, in what locale and format, and should the form input use the local timezone? (owner: ui-designer)
8. How is a create-request failure presented? TASK.md only specifies the list request-error state. (owner: api-integration / ui-designer)
9. Is the form shown inline, in a modal, or on another view? TASK.md says only "open a create form". (owner: ui-designer)

## Readiness

Partially ready. The product behavior is clear enough to plan. Before implementation, the following decisions are needed from specialist roles:

- mock mechanism (architect / api-integration);
- test stack (architect);
- status model and create-failure behavior (api-integration);
- form presentation and error/empty states (ui-designer).

Nothing has been implemented, and no checks have been run.
