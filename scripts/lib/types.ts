export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  updated_at: string
  language: string | null
  topics: string[]
  owner: string
  archived: boolean
}

export interface CachedData {
  timestamp: string
  extensions: Repository[]
}

export type Category =
  | 'UI / Dashboard'
  | 'Repository Management'
  | 'Issue / PR Management'
  | 'Automation / DevOps'
  | 'Productivity / Workflow'
  | 'Search & Discovery'
  | 'Miscellaneous'
