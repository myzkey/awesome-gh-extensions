import type { RspressPlugin } from "@rspress/shared";
import * as fs from "node:fs";
import * as path from "node:path";

interface Extension {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  updated_at: string;
  language: string | null;
  topics: string[];
}

interface ExtensionsData {
  timestamp: string;
  extensions: Extension[];
}

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function formatDate(dateStr: string): string {
  return dateStr.split("T")[0];
}

function escapeForMdx(text: string): string {
  return text
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateTable(exts: Extension[]): string {
  const rows = exts
    .map((ext) => {
      const desc = escapeForMdx(ext.description || "");
      return `| [${ext.full_name}](${ext.html_url}) | ${formatStars(ext.stargazers_count)} | ${formatDate(ext.updated_at)} | ${desc} |`;
    })
    .join("\n");

  return `| Extension | Stars | Updated | Description |
|-----------|-------|---------|-------------|
${rows}`;
}

function generateExtensionsPage(data: ExtensionsData): string {
  const { extensions, timestamp } = data;

  const sortedByStars = [...extensions].sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  );
  const sortedByUpdated = [...extensions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const topStarred = sortedByStars.slice(0, 20);
  const recentlyUpdated = sortedByUpdated.slice(0, 10);

  return `# GitHub CLI Extensions

> Auto-updated curated list of GitHub CLI extensions.

**Last updated:** ${formatDate(timestamp)} | **Total extensions:** ${extensions.length}

---

## Most Starred

${generateTable(topStarred)}

---

## Recently Updated

${generateTable(recentlyUpdated)}

---

## Explore More

- [All Extensions](/all) - Browse all ${extensions.length} extensions
- [By Language](/languages/) - Filter by programming language
- [By Category](/categories/) - Browse by topic/category
- [Getting Started](/guide) - Learn how to install and use gh extensions
`;
}

function generateAllExtensionsPage(data: ExtensionsData): string {
  const { extensions, timestamp } = data;

  const sortedByStars = [...extensions].sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  );

  return `# All Extensions

> Complete list of all ${extensions.length} GitHub CLI extensions, sorted by stars.

**Last updated:** ${formatDate(timestamp)}

${generateTable(sortedByStars)}
`;
}

function generateLanguagesIndexPage(data: ExtensionsData): string {
  const { extensions } = data;

  const languageCounts = new Map<string, number>();
  for (const ext of extensions) {
    const lang = ext.language || "Unknown";
    languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
  }

  const sortedLanguages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([lang]) => lang !== "Unknown");

  const rows = sortedLanguages
    .map(([lang, count]) => {
      const slug = lang.toLowerCase().replace(/[^a-z0-9]/g, "-");
      return `| [${lang}](/languages/${slug}) | ${count} |`;
    })
    .join("\n");

  return `# Extensions by Language

Browse GitHub CLI extensions organized by programming language.

| Language | Extensions |
|----------|------------|
${rows}
`;
}

function generateLanguagePage(language: string, extensions: Extension[]): string {
  const sorted = [...extensions].sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  );

  return `# ${language} Extensions

> ${extensions.length} extensions written in ${language}

${generateTable(sorted)}
`;
}

function generateCategoriesIndexPage(data: ExtensionsData): string {
  const { extensions } = data;

  // Define meaningful categories based on topics
  const categories: Record<string, { name: string; topics: string[]; description: string }> = {
    "tui": {
      name: "Terminal UI",
      topics: ["tui", "terminal", "bubbletea", "lipgloss"],
      description: "Beautiful terminal user interfaces"
    },
    "github-actions": {
      name: "GitHub Actions",
      topics: ["github-actions", "actions", "workflow", "ci-cd"],
      description: "CI/CD and GitHub Actions related"
    },
    "git": {
      name: "Git Utilities",
      topics: ["git", "branch", "merge", "rebase"],
      description: "Git workflow enhancements"
    },
    "productivity": {
      name: "Productivity",
      topics: ["fzf", "productivity", "automation"],
      description: "Tools to boost your productivity"
    },
    "security": {
      name: "Security",
      topics: ["security", "secret", "vulnerability", "dependabot"],
      description: "Security and vulnerability scanning"
    },
    "api": {
      name: "API & Integration",
      topics: ["github-api", "api", "graphql"],
      description: "GitHub API utilities and integrations"
    }
  };

  const categoryStats: { slug: string; name: string; count: number; description: string }[] = [];

  for (const [slug, config] of Object.entries(categories)) {
    const matchingExts = extensions.filter((ext) =>
      ext.topics.some((t) => config.topics.includes(t.toLowerCase()))
    );
    if (matchingExts.length > 0) {
      categoryStats.push({
        slug,
        name: config.name,
        count: matchingExts.length,
        description: config.description
      });
    }
  }

  categoryStats.sort((a, b) => b.count - a.count);

  const rows = categoryStats
    .map(({ slug, name, count, description }) =>
      `| [${name}](/categories/${slug}) | ${count} | ${description} |`
    )
    .join("\n");

  return `# Extensions by Category

Browse GitHub CLI extensions organized by category.

| Category | Extensions | Description |
|----------|------------|-------------|
${rows}
`;
}

function generateCategoryPage(
  categoryName: string,
  description: string,
  extensions: Extension[]
): string {
  const sorted = [...extensions].sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  );

  return `# ${categoryName}

> ${description}

**${extensions.length} extensions** in this category.

${generateTable(sorted)}
`;
}

function generateGuidePage(): string {
  return `# Getting Started with GitHub CLI Extensions

GitHub CLI extensions are custom commands that extend the functionality of \`gh\`, the official GitHub CLI tool.

## Prerequisites

Before installing extensions, make sure you have GitHub CLI installed:

\`\`\`bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux (Debian/Ubuntu)
sudo apt install gh
\`\`\`

Then authenticate with GitHub:

\`\`\`bash
gh auth login
\`\`\`

## Installing Extensions

### Basic Installation

To install an extension, use the \`gh extension install\` command:

\`\`\`bash
gh extension install owner/repo
\`\`\`

For example, to install the popular \`gh-dash\` extension:

\`\`\`bash
gh extension install dlvhdr/gh-dash
\`\`\`

### From GitHub URL

You can also install directly from a GitHub URL:

\`\`\`bash
gh extension install https://github.com/dlvhdr/gh-dash
\`\`\`

## Managing Extensions

### List Installed Extensions

\`\`\`bash
gh extension list
\`\`\`

### Update Extensions

Update a specific extension:

\`\`\`bash
gh extension upgrade owner/repo
\`\`\`

Update all extensions:

\`\`\`bash
gh extension upgrade --all
\`\`\`

### Remove Extensions

\`\`\`bash
gh extension remove owner/repo
\`\`\`

## Using Extensions

Once installed, extensions are available as \`gh\` subcommands:

\`\`\`bash
# If you installed gh-dash
gh dash

# If you installed gh-poi
gh poi
\`\`\`

## Popular Extensions to Try

Here are some highly recommended extensions to get started:

| Extension | Description |
|-----------|-------------|
| [dlvhdr/gh-dash](https://github.com/dlvhdr/gh-dash) | A beautiful dashboard for PRs and issues |
| [seachicken/gh-poi](https://github.com/seachicken/gh-poi) | Safely clean up local branches |
| [github/gh-copilot](https://github.com/github/gh-copilot) | GitHub Copilot in your terminal |
| [vilmibm/gh-screensaver](https://github.com/vilmibm/gh-screensaver) | Fun terminal screensavers |

## Creating Your Own Extension

Want to create your own extension? Check out the [official documentation](https://docs.github.com/en/github-cli/github-cli/creating-github-cli-extensions).

\`\`\`bash
# Create a new extension
gh extension create my-extension

# Or create a Go-based extension
gh extension create --precompiled=go my-extension
\`\`\`

## Troubleshooting

### Extension Not Found

If you get an error that an extension is not found:

1. Check the repository exists and is public
2. Ensure the repo has the \`gh-extension\` topic
3. Verify the repo has a valid extension manifest

### Permission Denied

If you get permission errors:

\`\`\`bash
# Re-authenticate with required scopes
gh auth refresh -s read:org
\`\`\`

## Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Extension Development Guide](https://docs.github.com/en/github-cli/github-cli/creating-github-cli-extensions)
- [gh-extension Topic on GitHub](https://github.com/topics/gh-extension)
`;
}

export function extensionsPlugin(): RspressPlugin {
  return {
    name: "extensions-plugin",
    async addPages() {
      const dataPath = path.resolve(process.cwd(), "../data/extensions.json");
      const rawData = fs.readFileSync(dataPath, "utf-8");
      const data: ExtensionsData = JSON.parse(rawData);

      const pages: { routePath: string; content: string }[] = [];

      // Main extensions page
      pages.push({
        routePath: "/extensions",
        content: generateExtensionsPage(data),
      });

      // All extensions page
      pages.push({
        routePath: "/all",
        content: generateAllExtensionsPage(data),
      });

      // Guide page
      pages.push({
        routePath: "/guide",
        content: generateGuidePage(),
      });

      // Languages index page
      pages.push({
        routePath: "/languages/",
        content: generateLanguagesIndexPage(data),
      });

      // Individual language pages
      const languageGroups = new Map<string, Extension[]>();
      for (const ext of data.extensions) {
        const lang = ext.language || "Unknown";
        if (lang === "Unknown") continue;
        if (!languageGroups.has(lang)) {
          languageGroups.set(lang, []);
        }
        languageGroups.get(lang)!.push(ext);
      }

      for (const [lang, exts] of languageGroups) {
        const slug = lang.toLowerCase().replace(/[^a-z0-9]/g, "-");
        pages.push({
          routePath: `/languages/${slug}`,
          content: generateLanguagePage(lang, exts),
        });
      }

      // Categories index page
      pages.push({
        routePath: "/categories/",
        content: generateCategoriesIndexPage(data),
      });

      // Individual category pages
      const categories: Record<string, { name: string; topics: string[]; description: string }> = {
        "tui": {
          name: "Terminal UI",
          topics: ["tui", "terminal", "bubbletea", "lipgloss"],
          description: "Beautiful terminal user interfaces"
        },
        "github-actions": {
          name: "GitHub Actions",
          topics: ["github-actions", "actions", "workflow", "ci-cd"],
          description: "CI/CD and GitHub Actions related"
        },
        "git": {
          name: "Git Utilities",
          topics: ["git", "branch", "merge", "rebase"],
          description: "Git workflow enhancements"
        },
        "productivity": {
          name: "Productivity",
          topics: ["fzf", "productivity", "automation"],
          description: "Tools to boost your productivity"
        },
        "security": {
          name: "Security",
          topics: ["security", "secret", "vulnerability", "dependabot"],
          description: "Security and vulnerability scanning"
        },
        "api": {
          name: "API & Integration",
          topics: ["github-api", "api", "graphql"],
          description: "GitHub API utilities and integrations"
        }
      };

      for (const [slug, config] of Object.entries(categories)) {
        const matchingExts = data.extensions.filter((ext) =>
          ext.topics.some((t) => config.topics.includes(t.toLowerCase()))
        );
        if (matchingExts.length > 0) {
          pages.push({
            routePath: `/categories/${slug}`,
            content: generateCategoryPage(config.name, config.description, matchingExts),
          });
        }
      }

      return pages;
    },
  };
}
