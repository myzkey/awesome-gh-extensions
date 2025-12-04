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

  const generateTable = (exts: Extension[]): string => {
    const rows = exts
      .map((ext) => {
        const desc = ext.description?.replace(/\|/g, "\\|") || "";
        return `| [${ext.full_name}](${ext.html_url}) | ${formatStars(ext.stargazers_count)} | ${formatDate(ext.updated_at)} | ${desc} |`;
      })
      .join("\n");

    return `| Extension | Stars | Updated | Description |
|-----------|-------|---------|-------------|
${rows}`;
  };

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

## Contributing

This list is auto-generated from GitHub repositories with the \`gh-extension\` topic.
To add your extension, simply add the \`gh-extension\` topic to your repository.

## License

MIT
`;
}

export function extensionsPlugin(): RspressPlugin {
  return {
    name: "extensions-plugin",
    async addPages() {
      const dataPath = path.resolve(process.cwd(), "../data/extensions.json");
      const rawData = fs.readFileSync(dataPath, "utf-8");
      const data: ExtensionsData = JSON.parse(rawData);

      return [
        {
          routePath: "/extensions",
          content: generateExtensionsPage(data),
        },
      ];
    },
  };
}
