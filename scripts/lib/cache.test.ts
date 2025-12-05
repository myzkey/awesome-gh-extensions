import * as fs from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCache, saveCache } from './cache'
import type { Repository } from './types'

vi.mock('node:fs')

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

describe('loadCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when cache file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = loadCache()

    expect(result).toBeNull()
  })

  it('returns parsed data when cache file exists', () => {
    const cachedData = {
      timestamp: '2025-01-01T00:00:00Z',
      extensions: [createRepo()],
    }
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(cachedData))

    const result = loadCache()

    expect(result).toEqual(cachedData)
  })

  it('returns null and logs warning on parse error', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue('invalid json')
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = loadCache()

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })
})

describe('saveCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates data directory if it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined)
    vi.mocked(fs.writeFileSync).mockImplementation(() => {})

    saveCache([createRepo()])

    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('data'), {
      recursive: true,
    })
  })

  it('writes cache file with timestamp', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.writeFileSync).mockImplementation(() => {})

    const repos = [createRepo()]
    saveCache(repos)

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('extensions.json'),
      expect.stringContaining('2025-06-15T12:00:00.000Z'),
    )
  })

  it('saves history file with date', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.writeFileSync).mockImplementation(() => {})

    saveCache([createRepo()])

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('2025-06-15.json'),
      expect.any(String),
    )
  })
})
