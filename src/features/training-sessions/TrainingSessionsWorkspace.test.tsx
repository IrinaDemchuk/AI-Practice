import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, delay, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { seedSessions } from '../../mocks/data'
import { server } from '../../mocks/server'
import { formatStartsAt } from './format'
import { TrainingSessionsWorkspace } from './TrainingSessionsWorkspace'

function futureLocalValue(days = 1): string {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

async function renderLoaded() {
  const user = userEvent.setup()
  render(<TrainingSessionsWorkspace />)
  await screen.findByText(seedSessions[0].title)
  return user
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Create session' }))
  return screen.getByRole('dialog')
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  startsAt: string,
) {
  const titleInput = screen.getByLabelText('Title')
  await user.clear(titleInput)
  if (title) await user.type(titleInput, title)
  const dateInput = screen.getByLabelText('Start date and time')
  await user.clear(dateInput)
  if (startsAt) await user.type(dateInput, startsAt)
}

describe('TrainingSessionsWorkspace', () => {
  it('loads sessions and filters by status', async () => {
    const user = userEvent.setup()
    render(<TrainingSessionsWorkspace />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading sessions...')

    await screen.findByText(seedSessions[0].title)
    expect(screen.getAllByRole('listitem')).toHaveLength(seedSessions.length)
    expect(
      screen.getByText(formatStartsAt(seedSessions[0].startsAt), {
        exact: false,
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Completed' }))
    const completed = seedSessions.filter((s) => s.status === 'completed')
    expect(screen.getAllByRole('listitem')).toHaveLength(completed.length)

    await user.click(screen.getByRole('radio', { name: 'All' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(seedSessions.length)
  })

  it('creates a session and shows it as Scheduled', async () => {
    const user = await renderLoaded()
    await openModal(user)
    await fillForm(user, 'Brand new session', futureLocalValue())
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    const item = (await screen.findByText('Brand new session')).closest('li')!
    expect(within(item).getByText('Scheduled')).toBeInTheDocument()
  })

  it('resets the filter to All when the new session does not match', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('radio', { name: 'Completed' }))
    await openModal(user)
    await fillForm(user, 'Created under completed', futureLocalValue())
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Created under completed')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked()
  })

  it('keeps the Scheduled filter when the new session matches', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('radio', { name: 'Scheduled' }))
    await openModal(user)
    await fillForm(user, 'Created under scheduled', futureLocalValue())
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Created under scheduled')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Scheduled' })).toBeChecked()
  })

  it('shows a list error and recovers with Retry', async () => {
    server.use(
      http.get('/api/sessions', () => new HttpResponse(null, { status: 500 })),
    )
    const user = userEvent.setup()
    render(<TrainingSessionsWorkspace />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load sessions. Please try again.',
    )

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText(seedSessions[0].title)).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    server.use(http.get('/api/sessions', () => HttpResponse.json([])))
    render(<TrainingSessionsWorkspace />)
    expect(await screen.findByText('No sessions yet')).toBeInTheDocument()
  })

  it('validates the form and sends no request for invalid input', async () => {
    let posts = 0
    server.use(
      http.post('/api/sessions', () => {
        posts++
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const user = await renderLoaded()
    await openModal(user)
    const submit = screen.getByRole('button', { name: 'Create' })

    await fillForm(user, 'ab', '')
    await user.click(submit)
    expect(screen.getByText(/Title must be at least 3/)).toBeInTheDocument()
    expect(screen.getByText('Choose a date and time')).toBeInTheDocument()

    await fillForm(user, '   ', futureLocalValue())
    await user.click(submit)
    expect(screen.getByText(/Title must be at least 3/)).toBeInTheDocument()

    await fillForm(user, 'Valid title', futureLocalValue(-1))
    await user.click(submit)
    expect(
      screen.getByText('Date and time must be in the future'),
    ).toBeInTheDocument()

    expect(posts).toBe(0)
  })

  it('prevents a double submit while pending', async () => {
    let posts = 0
    server.use(
      http.post('/api/sessions', async () => {
        posts++
        await delay(150)
        return HttpResponse.json(
          {
            id: 'x-1',
            title: 'Slow session',
            status: 'scheduled',
            startsAt: new Date(Date.now() + 86400000).toISOString(),
          },
          { status: 201 },
        )
      }),
    )
    const user = await renderLoaded()
    await openModal(user)
    await fillForm(user, 'Slow session', futureLocalValue())
    const submit = screen.getByRole('button', { name: 'Create' })
    await user.dblClick(submit)

    expect(submit).toBeDisabled()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(posts).toBe(1)
  })

  it('shows a create failure in the modal, keeps input, and allows retry', async () => {
    server.use(
      http.post('/api/sessions', () => new HttpResponse(null, { status: 500 })),
    )
    const user = await renderLoaded()
    await openModal(user)
    const startsAt = futureLocalValue()
    await fillForm(user, 'Flaky session', startsAt)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    const dialog = screen.getByRole('dialog')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Could not create the session. Please try again.',
    )
    expect(screen.getByLabelText('Title')).toHaveValue('Flaky session')
    expect(screen.getByLabelText('Start date and time')).toHaveValue(startsAt)

    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Create' }))
    expect(await screen.findByText('Flaky session')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
