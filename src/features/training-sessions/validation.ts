export const TITLE_MIN = 3
export const TITLE_MAX = 80

export function validateTitle(raw: string): string | null {
  const title = raw.trim()
  if (title.length < TITLE_MIN) {
    return `Title must be at least ${TITLE_MIN} characters`
  }
  if (title.length > TITLE_MAX) {
    return `Title must be at most ${TITLE_MAX} characters`
  }
  return null
}

export function validateStartsAt(
  raw: string,
  now: Date = new Date(),
): string | null {
  if (!raw) return 'Choose a date and time'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return 'Choose a date and time'
  if (date.getTime() <= now.getTime()) {
    return 'Date and time must be in the future'
  }
  return null
}
