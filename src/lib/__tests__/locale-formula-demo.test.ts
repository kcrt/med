import { describe, expect, it } from "vitest";
import type { Formula } from "@/types/formula";
import { getMenuItems, shouldDisplayFormula } from "@/lib/formula";

describe("Formula-level Locale Filtering Feature Demo", () => {
  describe("shouldDisplayFormula", () => {
    it("shows formulas without locale restrictions for all locales", () => {
      const formula: Formula = {
        name: "Universal Formula",
        input: {
          value: { label: "Value", type: "float" },
        },
        output: {
          result: { label: "Result", formula: "value * 2" },
        },
      };

      expect(shouldDisplayFormula(formula, "en")).toBe(true);
      expect(shouldDisplayFormula(formula, "ja")).toBe(true);
      expect(shouldDisplayFormula(formula, "zh-CN")).toBe(true);
    });

    it("filters formulas with locales_in restriction", () => {
      const japanOnlyFormula: Formula = {
        name: "Japan-only Formula",
        input: {
          value: { label: "Value", type: "float" },
        },
        output: {
          result: { label: "Result", formula: "value * 2" },
        },
        locales_in: ["ja"],
      };

      expect(shouldDisplayFormula(japanOnlyFormula, "ja")).toBe(true);
      expect(shouldDisplayFormula(japanOnlyFormula, "en")).toBe(false);
      expect(shouldDisplayFormula(japanOnlyFormula, "zh-CN")).toBe(false);
    });

    it("filters formulas with locales_not_in restriction", () => {
      const nonJapanFormula: Formula = {
        name: "Non-Japan Formula",
        input: {
          value: { label: "Value", type: "float" },
        },
        output: {
          result: { label: "Result", formula: "value * 2" },
        },
        locales_not_in: ["ja"],
      };

      expect(shouldDisplayFormula(nonJapanFormula, "en")).toBe(true);
      expect(shouldDisplayFormula(nonJapanFormula, "ja")).toBe(false);
      expect(shouldDisplayFormula(nonJapanFormula, "zh-CN")).toBe(true);
    });

    it("supports multiple locales in locales_in", () => {
      const asianFormula: Formula = {
        name: "Asian Formula",
        input: {
          value: { label: "Value", type: "float" },
        },
        output: {
          result: { label: "Result", formula: "value * 2" },
        },
        locales_in: ["ja", "zh-CN", "zh-TW"],
      };

      expect(shouldDisplayFormula(asianFormula, "ja")).toBe(true);
      expect(shouldDisplayFormula(asianFormula, "zh-CN")).toBe(true);
      expect(shouldDisplayFormula(asianFormula, "zh-TW")).toBe(true);
      expect(shouldDisplayFormula(asianFormula, "en")).toBe(false);
    });
  });

  describe("getMenuItems with locale filtering", () => {
    it("returns all formulas when no locale is specified", () => {
      const items = getMenuItems();
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
      
      // Should include all categories with formulas
      const totalFormulas = items.reduce(
        (sum, category) => sum + category.items.length,
        0,
      );
      expect(totalFormulas).toBeGreaterThan(0);
    });

    it("filters formulas by locale when locale is specified", () => {
      const allItems = getMenuItems();
      const enItems = getMenuItems("en");
      const jaItems = getMenuItems("ja");

      // All items should include everything
      expect(allItems.length).toBeGreaterThanOrEqual(enItems.length);
      expect(allItems.length).toBeGreaterThanOrEqual(jaItems.length);

      // Each locale-filtered result should be a subset of all items
      for (const category of enItems) {
        const allCategory = allItems.find((c) => c.label === category.label);
        expect(allCategory).toBeDefined();
      }

      for (const category of jaItems) {
        const allCategory = allItems.find((c) => c.label === category.label);
        expect(allCategory).toBeDefined();
      }
    });

    it("excludes empty categories after filtering", () => {
      // If a category has all formulas filtered out, the category shouldn't appear
      const items = getMenuItems("en");
      
      // All categories should have at least one formula
      for (const category of items) {
        expect(category.items.length).toBeGreaterThan(0);
      }
    });
  });
});
