import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchExtensions } from './github'

describe('fetchExtensions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and slimifies repositories', async () => {
    const mockResponse = {
      total_count: 1,
      items: [
        {
          id: 123,
          name: 'gh-test',
          full_name: 'user/gh-test',
          description: 'Test extension',
          html_url: 'https://github.com/user/gh-test',
          stargazers_count: 100,
          updated_at: '2025-01-01T00:00:00Z',
          language: 'Go',
          topics: ['gh-extension'],
          owner: {
            login: 'user',
            id: 1,
            avatar_url: 'https://example.com/avatar',
          },
          fork: false,
          archived: false,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchExtensions()

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 123,
      name: 'gh-test',
      full_name: 'user/gh-test',
      description: 'Test extension',
      html_url: 'https://github.com/user/gh-test',
      stargazers_count: 100,
      updated_at: '2025-01-01T00:00:00Z',
      language: 'Go',
      topics: ['gh-extension'],
      owner: 'user',
      archived: false,
    })
  })

  it('filters out forks', async () => {
    const mockResponse = {
      total_count: 2,
      items: [
        {
          id: 1,
          name: 'gh-original',
          full_name: 'user/gh-original',
          description: null,
          html_url: 'https://github.com/user/gh-original',
          stargazers_count: 0,
          updated_at: '2025-01-01T00:00:00Z',
          language: null,
          topics: [],
          owner: { login: 'user' },
          fork: false,
          archived: false,
        },
        {
          id: 2,
          name: 'gh-forked',
          full_name: 'user/gh-forked',
          description: null,
          html_url: 'https://github.com/user/gh-forked',
          stargazers_count: 0,
          updated_at: '2025-01-01T00:00:00Z',
          language: null,
          topics: [],
          owner: { login: 'user' },
          fork: true,
          archived: false,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchExtensions()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('gh-original')
  })

  it('filters out archived repositories', async () => {
    const mockResponse = {
      total_count: 1,
      items: [
        {
          id: 1,
          name: 'gh-archived',
          full_name: 'user/gh-archived',
          description: null,
          html_url: 'https://github.com/user/gh-archived',
          stargazers_count: 0,
          updated_at: '2025-01-01T00:00:00Z',
          language: null,
          topics: [],
          owner: { login: 'user' },
          fork: false,
          archived: true,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchExtensions()

    expect(result).toHaveLength(0)
  })

  it('filters out repos without gh- prefix', async () => {
    const mockResponse = {
      total_count: 2,
      items: [
        {
          id: 1,
          name: 'gh-valid',
          full_name: 'user/gh-valid',
          description: null,
          html_url: 'https://github.com/user/gh-valid',
          stargazers_count: 0,
          updated_at: '2025-01-01T00:00:00Z',
          language: null,
          topics: [],
          owner: { login: 'user' },
          fork: false,
          archived: false,
        },
        {
          id: 2,
          name: 'not-gh-extension',
          full_name: 'user/not-gh-extension',
          description: null,
          html_url: 'https://github.com/user/not-gh-extension',
          stargazers_count: 0,
          updated_at: '2025-01-01T00:00:00Z',
          language: null,
          topics: [],
          owner: { login: 'user' },
          fork: false,
          archived: false,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchExtensions()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('gh-valid')
  })

  it('throws error on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(fetchExtensions()).rejects.toThrow('GitHub API error: 500')
  })

  it('handles rate limit by returning empty array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    })

    const result = await fetchExtensions()

    expect(result).toHaveLength(0)
  })
})
