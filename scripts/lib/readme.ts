import { CATEGORY_ORDER, categorize } from './categorize'
import { formatDate, formatStars } from './format'
import type { Category, Repository } from './types'

function tableRow(repo: Repository): string {
  return `| [${repo.full_name}](${repo.html_url}) | ${formatStars(repo.stargazers_count)} | ${formatDate(repo.updated_at)} | ${repo.description ?? ''} |`
}

function generateTable(title: string, repos: Repository[]): string {
  return `## ${title}

| Extension | Stars | Updated | Description |
|-----------|-------|---------|-------------|
${repos.map(tableRow).join('\n')}`
}

export function generateReadme(extensions: Repository[]): string {
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
