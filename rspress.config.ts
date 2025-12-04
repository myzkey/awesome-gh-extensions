import { defineConfig } from "rspress/config";
import { extensionsPlugin } from "./plugins/extensions-plugin";

export default defineConfig({
  root: "docs",
  title: "Awesome GH Extensions",
  description: "Auto-updated curated list of GitHub CLI extensions",
  plugins: [extensionsPlugin()],
  themeConfig: {
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
