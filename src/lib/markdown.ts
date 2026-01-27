import { readFileSync } from "fs";
import { join } from "path";
import { marked } from "marked";

// Read markdown files at module initialization (build time)
// This ensures the content is embedded in the build bundle
const enContent = readFileSync(
  join(process.cwd(), "src", "toppage", "en.md"),
  "utf-8"
);
const jaContent = readFileSync(
  join(process.cwd(), "src", "toppage", "ja.md"),
  "utf-8"
);

const markdownContent: Record<string, string> = {
  en: enContent,
  ja: jaContent,
};

/**
 * Get rendered markdown content for a locale.
 * Content is embedded at build time via static file reads.
 * @param locale - The locale string (e.g., 'en', 'ja')
 * @returns The rendered HTML string
 */
export function getToppageMarkdown(locale: string): string {
  const content = markdownContent[locale] || markdownContent["en"];
  return marked.parse(content, { async: false });
}
