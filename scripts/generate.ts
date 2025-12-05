import * as fs from 'node:fs'
import * as path from 'node:path'
import { loadCache, saveCache } from './lib/cache'
import { fetchExtensions } from './lib/github'
import { generateReadme } from './lib/readme'
import type { Repository } from './lib/types'

const README_FILE = path.join(process.cwd(), 'README.md')

async function main(): Promise<void> {
  const cacheOnly = process.argv.includes('--cache-only')
  let extensions: Repository[]

  if (cacheOnly) {
    const cache = loadCache()
    if (!cache) {
      throw new Error('No cache available. Run without --cache-only first.')
    }
    console.log(`Using cached data (${cache.timestamp})`)
    extensions = cache.extensions
  } else {
    try {
      extensions = await fetchExtensions()

      if (extensions.length === 0) {
        const cache = loadCache()
        if (cache) {
          console.log('Using cached data due to empty API response')
          extensions = cache.extensions
        } else {
          throw new Error('No extensions found and no cache available')
        }
      } else {
        saveCache(extensions)
      }
    } catch (error) {
      console.error('Error fetching extensions:', error)

      const cache = loadCache()
      if (cache) {
        console.log('Falling back to cached data')
        extensions = cache.extensions
      } else {
        throw error
      }
    }
  }

  const readme = generateReadme(extensions)
  fs.writeFileSync(README_FILE, readme)
  console.log(`README.md generated with ${extensions.length} extensions`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
