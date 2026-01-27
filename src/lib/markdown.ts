import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { marked } from "marked";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./locale";

// Read and pre-render markdown files at build time
// This ensures the content is embedded in the build bundle
const renderedHtmlContent: Record<string, string> = {};

for (const locale of SUPPORTED_LOCALES) {
  const filePath = join(process.cwd(), "src", "toppage", `${locale}.md`);

  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf-8");
    renderedHtmlContent[locale] = marked.parse(content, { async: false });
  }
}

/**
 * Get pre-rendered HTML content for a locale.
 * Content is rendered at build time for optimal performance.
 * Falls back to default locale if the requested locale is not available.
 * @param locale - The locale string (e.g., 'en', 'ja')
 * @returns The pre-rendered HTML string
 */
export function getToppageMarkdown(locale: string): string {
  return renderedHtmlContent[locale] || renderedHtmlContent[DEFAULT_LOCALE];
}
