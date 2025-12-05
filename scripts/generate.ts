import * as fs from 'node:fs'
import * as path from 'node:path'

const GITHUB_API_BASE = 'https://api.github.com'
const DATA_DIR = path.join(process.cwd(), 'data')
const CACHE_FILE = path.join(DATA_DIR, 'extensions.json')
const README_FILE = path.join(process.cwd(), 'README.md')

export interface Repository {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  updated_at: string
  topics: string[]
  owner: {
    login: string
  }
  fork: boolean
  archived: boolean
}

interface SearchResponse {
  total_count: number
  incomplete_results: boolean
  items: Repository[]
}

interface CachedData {
  timestamp: string
  extensions: Repository[]
}

type Category =
  | 'UI / Dashboard'
  | 'Repository Management'
  | 'Issue / PR Management'
  | 'Automation / DevOps'
  | 'Productivity / Workflow'
  | 'Search & Discovery'
  | 'Miscellaneous'

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'UI / Dashboard': [
    'dash',
    'dashboard',
    'tui',
    'ui',
    'terminal',
    'view',
    'browse',
  ],
  'Repository Management': [
    'repo',
    'repository',
    'clone',
    'fork',
    'branch',
    'template',
    'archive',
  ],
  'Issue / PR Management': [
    'issue',
    'pr',
    'pull',
    'request',
    'review',
    'merge',
    'comment',
  ],
  'Automation / DevOps': [
    'action',
    'workflow',
    'ci',
    'cd',
    'deploy',
    'release',
    'copilot',
    'ai',
  ],
  'Productivity / Workflow': [
    'notify',
    'notification',
    'todo',
    'label',
    'project',
    'milestone',
  ],
  'Search & Discovery': ['search', 'find', 'list', 'explore', 'discover'],
  Miscellaneous: [],
}

const CATEGORY_ORDER: Category[] = [
  'UI / Dashboard',
  'Repository Management',
  'Issue / PR Management',
  'Automation / DevOps',
  'Productivity / Workflow',
  'Search & Discovery',
  'Miscellaneous',
]

const MAX_SEARCH_RESULTS = 1000

async function fetchExtensions(): Promise<Repository[]> {
  const allExtensions: Repository[] = []
  let page = 1
  const perPage = 100

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'awesome-gh-extensions',
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  console.log('Fetching GitHub CLI extensions...')

  while (true) {
    const url = `${GITHUB_API_BASE}/search/repositories?q=topic:gh-extension&sort=stars&order=desc&per_page=${perPage}&page=${page}`

    const response = await fetch(url, { headers })

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Rate limit exceeded. Using cached data if available.')
        break
      }
      if (response.status === 422) {
        console.warn(
          'GitHub Search API limit (1000 results) reached. Stopping pagination.',
        )
        break
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data: SearchResponse = await response.json()
    allExtensions.push(...data.items)

    const effectiveTotal = Math.min(data.total_count, MAX_SEARCH_RESULTS)
    console.log(
      `Fetched page ${page}: ${data.items.length} extensions (total: ${allExtensions.length}/${effectiveTotal})`,
    )

    if (allExtensions.length >= effectiveTotal || data.items.length < perPage) {
      break
    }

    page++

    // Rate limit protection
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Filter out forks, archived repositories, and repos without gh- prefix
  const filtered = allExtensions.filter(
    (repo) => !repo.fork && !repo.archived && repo.name.startsWith('gh-'),
  )
  console.log(
    `Filtered: ${allExtensions.length} -> ${filtered.length} (removed ${allExtensions.length - filtered.length} forks/archived/non-gh-prefix)`,
  )

  return filtered
}

export function categorize(repo: Repository): Category {
  const text = [
    repo.name.toLowerCase(),
    repo.description?.toLowerCase() ?? '',
    ...repo.topics.map((t) => t.toLowerCase()),
  ].join(' ')

  for (const category of CATEGORY_ORDER) {
    if (category === 'Miscellaneous') continue

    const keywords = CATEGORY_KEYWORDS[category]
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category
    }
  }

  return 'Miscellaneous'
}

export function formatDate(iso: string): string {
  return iso.split('T')[0]
}

export function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toString()
}

function tableRow(repo: Repository): string {
  return `| [${repo.full_name}](${repo.html_url}) | ${formatStars(repo.stargazers_count)} | ${formatDate(repo.updated_at)} | ${repo.description ?? ''} |`
}

function generateTable(title: string, repos: Repository[]): string {
  return `## ${title}

| Extension | Stars | Updated | Description |
|-----------|-------|---------|-------------|
${repos.map(tableRow).join('\n')}`
}

function generateReadme(extensions: Repository[]): string {
  const now = new Date().toISOString().split('T')[0]

  // Sort by stars for "Most Starred"
  const byStars = [...extensions].sort(
    (a, b) => b.stargazers_count - a.stargazers_count,
  )
  const topStarred = byStars.slice(0, 20)

  // Sort by updated_at for "Recently Updated"
  const byUpdated = [...extensions].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )
  const recentlyUpdated = byUpdated.slice(0, 10)

  // Categorize all extensions
  const categorized = new Map<Category, Repository[]>()
  for (const category of CATEGORY_ORDER) {
    categorized.set(category, [])
  }

  for (const ext of extensions) {
    const category = categorize(ext)
    categorized.get(category)?.push(ext)
  }

  // Sort each category by stars
  for (const [, repos] of categorized) {
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count)
  }

  let readme = `# awesome-gh-extensions

> Auto-updated curated list of GitHub CLI extensions.

[![Update Extensions](https://github.com/myzkey/awesome-gh-extensions/actions/workflows/update.yml/badge.svg)](https://github.com/myzkey/awesome-gh-extensions/actions/workflows/update.yml)

**Last updated:** ${now} | **Total extensions:** ${extensions.length}

---

${generateTable('⭐ Most Starred', topStarred)}

---

${generateTable('🆕 Recently Updated', recentlyUpdated)}

---

## 🧩 Categories

`

  const CATEGORY_LIMIT = 20

  for (const category of CATEGORY_ORDER) {
    const repos = categorized.get(category)
    if (!repos || repos.length === 0) continue

    const displayRepos = repos.slice(0, CATEGORY_LIMIT)

    readme += `### ${category}\n\n`
    readme += `| Extension | Stars | Updated | Description |\n`
    readme += `|-----------|-------|---------|-------------|\n`
    readme += displayRepos.map(tableRow).join('\n')
    readme += '\n\n'
  }

  readme += `---

## 🤝 Contributing

This list is auto-generated from GitHub repositories with the \`gh-extension\` topic.
To add your extension, simply add the \`gh-extension\` topic to your repository.

## 📜 License

MIT
`

  return readme
}

function loadCache(): CachedData | null {
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

function saveCache(extensions: Repository[]): void {
  const data: CachedData = {
    timestamp: new Date().toISOString(),
    extensions,
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2))
  console.log(`Cache saved: ${extensions.length} extensions`)
}

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
