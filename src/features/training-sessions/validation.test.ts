import { describe, expect, it } from 'vitest'
import { validateStartsAt, validateTitle } from './validation'

describe('validateTitle', () => {
  it('trims whitespace before measuring', () => {
    expect(validateTitle('  ab  ')).not.toBeNull()
    expect(validateTitle('   ')).not.toBeNull()
    expect(validateTitle('  abc  ')).toBeNull()
  })

  it('rejects fewer than 3 and more than 80 characters', () => {
    expect(validateTitle('ab')).toMatch(/at least 3/)
    expect(validateTitle('a'.repeat(81))).toMatch(/at most 80/)
  })

  it('accepts 3 and 80 characters', () => {
    expect(validateTitle('abc')).toBeNull()
    expect(validateTitle('a'.repeat(80))).toBeNull()
  })
})

describe('validateStartsAt', () => {
  const now = new Date(2030, 0, 1, 12, 0)

  it('rejects empty', () => {
    expect(validateStartsAt('', now)).toBe('Choose a date and time')
  })

  it('rejects a past value', () => {
    expect(validateStartsAt('2029-12-31T12:00', now)).toBe(
      'Date and time must be in the future',
    )
  })

  it('accepts a future value', () => {
    expect(validateStartsAt('2030-01-02T12:00', now)).toBeNull()
  })
})
