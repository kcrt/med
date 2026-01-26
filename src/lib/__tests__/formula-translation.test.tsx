import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import {
  useFormulaName,
  useInputLabel,
  useOutputLabel,
  useOutputText,
} from "../formula-translation";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";

describe("formula-translation", () => {
  const createWrapper = (locale: string, messages: Record<string, unknown>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    );
  };

  describe("useFormulaName", () => {
    it("should return English name for English locale", () => {
      const formula: Formula = {
        name: "Test Formula",
        input: {},
        output: {},
      };

      const { result } = renderHook(
        () => useFormulaName("test", formula),
        {
          wrapper: createWrapper("en", {}),
        }
      );

      expect(result.current).toBe("Test Formula");
    });

    it("should return translated name for Japanese locale", () => {
      const formula: Formula = {
        name: "Test Formula",
        input: {},
        output: {},
      };

      const messages = {
        labels: {
          "Test Formula": "テスト式",
        },
      };

      const { result } = renderHook(
        () => useFormulaName("test", formula),
        {
          wrapper: createWrapper("ja", messages),
        }
      );

      expect(result.current).toBe("テスト式");
    });

    it("should fallback to English if translation not found", () => {
      const formula: Formula = {
        name: "Untranslated Formula",
        input: {},
        output: {},
      };

      const messages = {
        labels: {},
      };

      const { result } = renderHook(
        () => useFormulaName("test", formula),
        {
          wrapper: createWrapper("ja", messages),
        }
      );

      expect(result.current).toBe("Untranslated Formula");
    });
  });

  describe("useOutputText", () => {
    it("should return English text for English locale", () => {
      const output: FormulaOutput = {
        label: "Test",
        text: "This is a test text.",
      };

      const { result } = renderHook(
        () => useOutputText("test", "output", output),
        {
          wrapper: createWrapper("en", {}),
        }
      );

      expect(result.current).toBe("This is a test text.");
    });

    it("should handle text with multiple dots correctly using semantic keys", () => {
      const output: FormulaOutput = {
        label: "Note",
        text: "ABCD²-I adds DWI imaging to ABCD². Score range: 0-9. DWI lesion adds 2 points.",
      };

      const messages = {
        labels: {
          // Use semantic key for text entries with dots
          "abcd2i.note.text": "ABCD²-IはDWI画像診断を追加。スコア範囲: 0-9点。DWI病変ありで2点。",
        },
      };

      const { result } = renderHook(
        () => useOutputText("abcd2i", "note", output),
        {
          wrapper: createWrapper("ja", messages),
        }
      );

      expect(result.current).toBe(
        "ABCD²-IはDWI画像診断を追加。スコア範囲: 0-9点。DWI病変ありで2点。"
      );
    });

    it("should return undefined for output without text", () => {
      const output: FormulaOutput = {
        label: "Test",
      };

      const { result } = renderHook(
        () => useOutputText("test", "output", output),
        {
          wrapper: createWrapper("en", {}),
        }
      );

      expect(result.current).toBeUndefined();
    });
  });

  describe("useInputLabel", () => {
    it("should handle labels with brackets correctly", () => {
      const input: FormulaInput = {
        label: "Height [cm]",
        type: "number",
      };

      const messages = {
        labels: {
          "Height [cm]": "身長 [cm]",
        },
      };

      const { result } = renderHook(
        () => useInputLabel("test", "height", input),
        {
          wrapper: createWrapper("ja", messages),
        }
      );

      expect(result.current).toBe("身長 [cm]");
    });
  });

  describe("useOutputLabel", () => {
    it("should handle labels with units containing dots", () => {
      const output: FormulaOutput = {
        label: "eGFR [mL/min/1.73m²]",
      };

      const messages = {
        labels: {
          // Labels with dots use escaped format for backward compatibility
          "eGFR [mL/min/1{{dot}}73m²]": "推算GFR [mL/min/1.73m²]",
        },
      };

      const { result } = renderHook(
        () => useOutputLabel("test", "egfr", output),
        {
          wrapper: createWrapper("ja", messages),
        }
      );

      expect(result.current).toBe("推算GFR [mL/min/1.73m²]");
    });
  });
});
