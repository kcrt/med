import { describe, expect, it } from "vitest";
import { getToppageMarkdown } from "@/lib/markdown";

describe("getToppageMarkdown", () => {
  it("should return pre-rendered HTML for English locale", () => {
    const html = getToppageMarkdown("en");

    // Verify it returns HTML, not markdown
    expect(html).toContain("<h2>");
    expect(html).toContain("</h2>");

    // Verify it contains expected content (with HTML-encoded apostrophe)
    expect(html).toContain("What&#39;s New");
    expect(html).toContain("Phoenix Sepsis Score");
  });

  it("should return pre-rendered HTML for Japanese locale", () => {
    const html = getToppageMarkdown("ja");

    // Verify it returns HTML, not markdown
    expect(html).toContain("<h2>");
    expect(html).toContain("</h2>");

    // Verify it contains expected content
    expect(html).toContain("更新情報");
    expect(html).toContain("Phoenix敗血症スコア");
  });

  it("should fallback to English for unknown locale", () => {
    const html = getToppageMarkdown("unknown");

    // Should return English content (with HTML-encoded apostrophe)
    expect(html).toContain("What&#39;s New");
    expect(html).toContain("Phoenix Sepsis Score");
  });

  it("should return the same HTML on multiple calls (cached)", () => {
    const html1 = getToppageMarkdown("en");
    const html2 = getToppageMarkdown("en");

    // Should be the exact same pre-rendered content
    expect(html1).toBe(html2);
  });

  it("should have HTML-escaped markdown special characters", () => {
    const html = getToppageMarkdown("en");

    // Should not contain markdown syntax
    expect(html).not.toContain("## ");
    expect(html).not.toContain("- **");
  });
});
