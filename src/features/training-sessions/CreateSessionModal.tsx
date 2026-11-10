import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { validateStartsAt, validateTitle } from './validation'
import type { CreateSessionInput } from './types'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (input: CreateSessionInput) => Promise<void>
}

function localNowValue(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function CreateSessionModal({ open, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState(false)
  const [pending, setPending] = useState(false)
  const submitting = useRef(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open || pending) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, pending, onClose])

  if (!open) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting.current) return

    const nextTitleError = validateTitle(title)
    const nextDateError = validateStartsAt(startsAt)
    setTitleError(nextTitleError)
    setDateError(nextDateError)
    setRequestError(false)
    if (nextTitleError || nextDateError) return

    submitting.current = true
    setPending(true)
    try {
      await onSubmit({
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
      })
      setTitle('')
      setStartsAt('')
      onClose()
    } catch {
      setRequestError(true)
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <div className="ts-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-session-title"
        className="ts-modal"
      >
        <h2 id="create-session-title">Create session</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="ts-field">
            <label htmlFor="session-title">Title</label>
            <input
              id="session-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? 'session-title-error' : undefined}
            />
            {titleError && (
              <p id="session-title-error" className="ts-field-error">
                {titleError}
              </p>
            )}
          </div>
          <div className="ts-field">
            <label htmlFor="session-starts-at">Start date and time</label>
            <input
              id="session-starts-at"
              type="datetime-local"
              min={localNowValue()}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              aria-invalid={dateError ? true : undefined}
              aria-describedby={dateError ? 'session-starts-at-error' : undefined}
            />
            {dateError && (
              <p id="session-starts-at-error" className="ts-field-error">
                {dateError}
              </p>
            )}
          </div>
          {requestError && (
            <p role="alert" className="ts-error">
              Could not create the session. Please try again.
            </p>
          )}
          <div className="ts-actions">
            <button type="button" onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button type="submit" disabled={pending}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
