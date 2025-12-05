import type { Repository } from './types'

const GITHUB_API_BASE = 'https://api.github.com'
const MAX_SEARCH_RESULTS = 1000

interface SearchResponse {
  total_count: number
  incomplete_results: boolean
  items: Repository[]
}

// biome-ignore lint/suspicious/noExplicitAny: GitHub API response type
function slimifyRepository(repo: any): Repository {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count,
    updated_at: repo.updated_at,
    language: repo.language,
    topics: repo.topics,
    owner: repo.owner.login,
    archived: repo.archived,
  }
}

export async function fetchExtensions(): Promise<Repository[]> {
  // biome-ignore lint/suspicious/noExplicitAny: Store raw API response for filtering
  const allExtensions: any[] = []
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

  // Slimify after filtering
  return filtered.map(slimifyRepository)
}
