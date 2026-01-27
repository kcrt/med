import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";

// Read markdown files at module initialization (build time)
// This ensures the content is embedded in the build bundle
const enContent = readFileSync(
  join(process.cwd(), "src", "toppage", "en.md"),
  "utf-8",
);
const jaContent = readFileSync(
  join(process.cwd(), "src", "toppage", "ja.md"),
  "utf-8",
);

// Pre-render HTML at build time
const renderedHtmlContent: Record<string, string> = {
  en: marked.parse(enContent, { async: false }) as string,
  ja: marked.parse(jaContent, { async: false }) as string,
};

/**
 * Get pre-rendered HTML content for a locale.
 * Content is rendered at build time for optimal performance.
 * @param locale - The locale string (e.g., 'en', 'ja')
 * @returns The pre-rendered HTML string
 */
export function getToppageMarkdown(locale: string): string {
  return renderedHtmlContent[locale] || renderedHtmlContent.en;
}
