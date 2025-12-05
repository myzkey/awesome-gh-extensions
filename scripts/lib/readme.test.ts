import { describe, expect, it } from 'vitest'
import { generateReadme } from './readme'
import type { Repository } from './types'

const createRepo = (overrides: Partial<Repository> = {}): Repository => ({
  id: 1,
  name: 'gh-test',
  full_name: 'user/gh-test',
  description: 'Test description',
  html_url: 'https://github.com/user/gh-test',
  stargazers_count: 100,
  updated_at: '2025-01-01T00:00:00Z',
  language: 'Go',
  topics: ['cli'],
  owner: 'user',
  archived: false,
  ...overrides,
})

describe('generateReadme', () => {
  it('generates README with header', () => {
    const repos = [createRepo()]
    const readme = generateReadme(repos)

    expect(readme).toContain('# awesome-gh-extensions')
    expect(readme).toContain('Auto-updated curated list')
  })

  it('includes extension count', () => {
    const repos = [createRepo(), createRepo({ id: 2, name: 'gh-other' })]
    const readme = generateReadme(repos)

    expect(readme).toContain('**Total extensions:** 2')
  })

  it('generates Most Starred section', () => {
    const repos = [
      createRepo({ stargazers_count: 1000 }),
      createRepo({ id: 2, name: 'gh-popular', stargazers_count: 5000 }),
    ]
    const readme = generateReadme(repos)

    expect(readme).toContain('## ⭐ Most Starred')
    expect(readme).toContain('5.0k')
  })

  it('generates Recently Updated section', () => {
    const repos = [createRepo()]
    const readme = generateReadme(repos)

    expect(readme).toContain('## 🆕 Recently Updated')
  })

  it('generates Categories section', () => {
    const repos = [createRepo({ name: 'gh-dash', topics: ['tui'] })]
    const readme = generateReadme(repos)

    expect(readme).toContain('## 🧩 Categories')
    expect(readme).toContain('### UI / Dashboard')
  })

  it('includes Contributing section', () => {
    const repos = [createRepo()]
    const readme = generateReadme(repos)

    expect(readme).toContain('## 🤝 Contributing')
    expect(readme).toContain('gh-extension')
  })

  it('formats table rows correctly', () => {
    const repos = [
      createRepo({ full_name: 'user/gh-test', stargazers_count: 100 }),
    ]
    const readme = generateReadme(repos)

    expect(readme).toContain('[user/gh-test](https://github.com/user/gh-test)')
    expect(readme).toContain('| 100 |')
  })
})
