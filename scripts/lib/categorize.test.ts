import { describe, expect, it } from 'vitest'
import { CATEGORY_ORDER, categorize } from './categorize'
import type { Repository } from './types'

const createRepo = (overrides: Partial<Repository> = {}): Repository => ({
  id: 1,
  name: 'gh-test',
  full_name: 'user/gh-test',
  description: null,
  html_url: 'https://github.com/user/gh-test',
  stargazers_count: 0,
  updated_at: '2025-01-01T00:00:00Z',
  language: null,
  topics: [],
  owner: 'user',
  archived: false,
  ...overrides,
})

describe('categorize', () => {
  it('categorizes by name', () => {
    expect(categorize(createRepo({ name: 'gh-dash' }))).toBe('UI / Dashboard')
    expect(categorize(createRepo({ name: 'gh-repo-manager' }))).toBe(
      'Repository Management',
    )
  })

  it('categorizes by description', () => {
    expect(
      categorize(createRepo({ description: 'A terminal UI for GitHub' })),
    ).toBe('UI / Dashboard')
    expect(
      categorize(createRepo({ description: 'Manage pull requests easily' })),
    ).toBe('Issue / PR Management')
  })

  it('categorizes by topics', () => {
    expect(categorize(createRepo({ topics: ['tui', 'github'] }))).toBe(
      'UI / Dashboard',
    )
    expect(categorize(createRepo({ topics: ['ci', 'automation'] }))).toBe(
      'Automation / DevOps',
    )
  })

  it('returns Miscellaneous for unknown', () => {
    expect(
      categorize(
        createRepo({ name: 'gh-something', description: 'Does stuff' }),
      ),
    ).toBe('Miscellaneous')
  })
})

describe('CATEGORY_ORDER', () => {
  it('contains all categories', () => {
    expect(CATEGORY_ORDER).toHaveLength(7)
    expect(CATEGORY_ORDER).toContain('UI / Dashboard')
    expect(CATEGORY_ORDER).toContain('Miscellaneous')
  })

  it('has Miscellaneous last', () => {
    expect(CATEGORY_ORDER[CATEGORY_ORDER.length - 1]).toBe('Miscellaneous')
  })
})
