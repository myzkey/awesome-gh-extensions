import * as fs from 'node:fs'
import * as path from 'node:path'
import type { CachedData, Repository } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const HISTORY_DIR = path.join(DATA_DIR, 'history')
const CACHE_FILE = path.join(DATA_DIR, 'extensions.json')

export function loadCache(): CachedData | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('Failed to load cache:', error)
  }
  return null
}

export function saveCache(extensions: Repository[]): void {
  const now = new Date()
  const data: CachedData = {
    timestamp: now.toISOString(),
    extensions,
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  // Save current data
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
  console.log(`Cache saved: ${extensions.length} extensions`)

  // Save history
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true })
  }

  const dateStr = now.toISOString().split('T')[0]
  const historyFile = path.join(HISTORY_DIR, `${dateStr}.json`)
  fs.writeFileSync(historyFile, JSON.stringify(data, null, 2))
  console.log(`History saved: ${historyFile}`)
}
