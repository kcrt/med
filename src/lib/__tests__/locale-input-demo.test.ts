import { describe, expect, it } from "vitest";
import type { Formula } from "@/types/formula";
import { shouldDisplayInputForLocale } from "@/lib/formula";

describe("Locale Input Filtering Feature Demo", () => {
  const testFormula: Formula = {
    name: "Test Locale Input Filtering",
    info: "Demonstrates locale-specific input filtering",
    input: {
      height: {
        label: "Height",
        type: "float",
        unit: "cm",
        min: 30,
        max: 300,
      },
      weight: {
        label: "Weight",
        type: "float",
        unit: "kg",
        min: 3,
        max: 300,
      },
      japan_only_field: {
        label: "Japan-only Field",
        type: "float",
        locales_in: ["ja"],
        default: 0,
      },
    },
    output: {
      BMI: {
        label: "BMI",
        formula: "weight/(height/100)/(height/100)",
        unit: "kg/m²",
        precision: 1,
      },
    },
  };

  it("shows all inputs for Japanese locale", () => {
    const locale = "ja";
    const visibleInputs = Object.keys(testFormula.input).filter((key) =>
      shouldDisplayInputForLocale(testFormula.input[key]!, locale),
    );

    expect(visibleInputs).toContain("height");
    expect(visibleInputs).toContain("weight");
    expect(visibleInputs).toContain("japan_only_field");
    expect(visibleInputs).toHaveLength(3);
  });

  it("hides Japan-only input for English locale", () => {
    const locale = "en";
    const visibleInputs = Object.keys(testFormula.input).filter((key) =>
      shouldDisplayInputForLocale(testFormula.input[key]!, locale),
    );

    expect(visibleInputs).toContain("height");
    expect(visibleInputs).toContain("weight");
    expect(visibleInputs).not.toContain("japan_only_field");
    expect(visibleInputs).toHaveLength(2);
  });

  it("hides Japan-only input for other locales", () => {
    const locales = ["en", "zh-CN", "zh-TW", "fr", "de"];

    for (const locale of locales) {
      const visibleInputs = Object.keys(testFormula.input).filter((key) =>
        shouldDisplayInputForLocale(testFormula.input[key]!, locale),
      );

      expect(visibleInputs).not.toContain("japan_only_field");
    }
  });
});
