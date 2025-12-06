import { defineConfig } from "rspress/config";
import { extensionsPlugin } from "./plugins/extensions-plugin";

export default defineConfig({
  root: "docs",
  base: "/awesome-gh-extensions/",
  title: "Awesome GH Extensions",
  description: "Auto-updated curated list of GitHub CLI extensions",
  plugins: [extensionsPlugin()],
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Extensions", link: "/extensions" },
      { text: "All", link: "/all" },
      {
        text: "Browse",
        items: [
          { text: "By Language", link: "/languages/" },
          { text: "By Category", link: "/categories/" },
        ],
      },
      { text: "Guide", link: "/guide" },
    ],
    sidebar: {
      "/": [
        {
          text: "Overview",
          items: [
            { text: "Home", link: "/" },
            { text: "Extensions", link: "/extensions" },
            { text: "All Extensions", link: "/all" },
          ],
        },
        {
          text: "Browse",
          items: [
            { text: "By Language", link: "/languages/" },
            { text: "By Category", link: "/categories/" },
          ],
        },
        {
          text: "Getting Started",
          items: [{ text: "Guide", link: "/guide" }],
        },
      ],
      "/languages/": [
        {
          text: "Languages",
          items: [
            { text: "Overview", link: "/languages/" },
            { text: "Go", link: "/languages/go" },
            { text: "Shell", link: "/languages/shell" },
            { text: "Python", link: "/languages/python" },
            { text: "Rust", link: "/languages/rust" },
            { text: "JavaScript", link: "/languages/javascript" },
            { text: "TypeScript", link: "/languages/typescript" },
            { text: "Ruby", link: "/languages/ruby" },
            { text: "C#", link: "/languages/c-" },
          ],
        },
      ],
      "/categories/": [
        {
          text: "Categories",
          items: [
            { text: "Overview", link: "/categories/" },
            { text: "Terminal UI", link: "/categories/tui" },
            { text: "GitHub Actions", link: "/categories/github-actions" },
            { text: "Git Utilities", link: "/categories/git" },
            { text: "Productivity", link: "/categories/productivity" },
            { text: "Security", link: "/categories/security" },
            { text: "API & Integration", link: "/categories/api" },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/myzkey/awesome-gh-extensions",
      },
    ],
    footer: {
      message: "MIT License",
    },
  },
  markdown: {
    showLineNumbers: true,
  },
});
