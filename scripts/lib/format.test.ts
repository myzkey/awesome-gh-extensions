import { describe, expect, it } from 'vitest'
import { formatDate, formatStars } from './format'

describe('formatStars', () => {
  it('returns number as string for < 1000', () => {
    expect(formatStars(0)).toBe('0')
    expect(formatStars(999)).toBe('999')
  })

  it('returns formatted string with k for >= 1000', () => {
    expect(formatStars(1000)).toBe('1.0k')
    expect(formatStars(1500)).toBe('1.5k')
    expect(formatStars(10000)).toBe('10.0k')
  })
})

describe('formatDate', () => {
  it('extracts date from ISO string', () => {
    expect(formatDate('2025-01-15T12:30:00Z')).toBe('2025-01-15')
  })
})
