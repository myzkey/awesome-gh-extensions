import { describe, expect, it } from 'vitest'
import {
  categorize,
  formatDate,
  formatStars,
  type Repository,
} from './generate'

const createRepo = (overrides: Partial<Repository> = {}): Repository => ({
  id: 1,
  name: 'gh-test',
  full_name: 'user/gh-test',
  description: null,
  html_url: 'https://github.com/user/gh-test',
  stargazers_count: 0,
  watchers_count: 0,
  forks_count: 0,
  open_issues_count: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  pushed_at: '2025-01-01T00:00:00Z',
  homepage: null,
  size: 0,
  language: null,
  topics: [],
  default_branch: 'main',
  visibility: 'public',
  license: null,
  owner: {
    login: 'user',
    id: 1,
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/user',
    type: 'User',
  },
  fork: false,
  archived: false,
  disabled: false,
  has_issues: true,
  has_discussions: false,
  ...overrides,
})

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
