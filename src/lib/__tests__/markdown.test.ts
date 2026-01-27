import { describe, expect, it } from "vitest";
import { getToppageMarkdown } from "@/lib/markdown";

describe("getToppageMarkdown", () => {
  it("should return pre-rendered HTML for English locale", () => {
    const html = getToppageMarkdown("en");

    // Verify it returns non-empty HTML
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(0);

    // Verify it contains HTML tags (not raw markdown)
    expect(html).toMatch(/<[a-z][\s\S]*>/i);
  });

  it("should return pre-rendered HTML for Japanese locale", () => {
    const html = getToppageMarkdown("ja");

    // Verify it returns non-empty HTML
    expect(html).toBeTruthy();
    expect(html.length).toBeGreaterThan(0);

    // Verify it contains HTML tags (not raw markdown)
    expect(html).toMatch(/<[a-z][\s\S]*>/i);
  });

  it("should return different content for different locales", () => {
    const enHtml = getToppageMarkdown("en");
    const jaHtml = getToppageMarkdown("ja");

    // Different locales should have different content
    expect(enHtml).not.toBe(jaHtml);
  });

  it("should fallback to English for unknown locale", () => {
    const unknownHtml = getToppageMarkdown("unknown");
    const enHtml = getToppageMarkdown("en");

    // Unknown locale should fallback to English
    expect(unknownHtml).toBe(enHtml);
  });

  it("should return the same HTML on multiple calls (cached)", () => {
    const html1 = getToppageMarkdown("en");
    const html2 = getToppageMarkdown("en");

    // Should be the exact same pre-rendered content (reference equality)
    expect(html1).toBe(html2);
  });

  it("should not contain raw markdown syntax", () => {
    const enHtml = getToppageMarkdown("en");
    const jaHtml = getToppageMarkdown("ja");

    // Should not contain markdown heading syntax
    expect(enHtml).not.toMatch(/^##\s/m);
    expect(jaHtml).not.toMatch(/^##\s/m);

    // Should not contain markdown list with bold syntax
    expect(enHtml).not.toContain("- **");
    expect(jaHtml).not.toContain("- **");
  });
});
