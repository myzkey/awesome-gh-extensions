import type { Category, Repository } from './types'

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
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

export const CATEGORY_ORDER: Category[] = [
  'UI / Dashboard',
  'Repository Management',
  'Issue / PR Management',
  'Automation / DevOps',
  'Productivity / Workflow',
  'Search & Discovery',
  'Miscellaneous',
]

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
