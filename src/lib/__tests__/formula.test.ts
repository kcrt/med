import { describe, expect, it } from "vitest";
import {
  BSA_DuBois,
  type CalculationFormula,
  erf,
  evaluateFormula,
  evaluateFormulaOutputs,
  formulaData,
  GetPercentileFromZScore,
  GetValueFromZScore,
  GetZScore,
  GetZScoreFromLMS,
  GetZScoreStr,
  getFormula,
  getFormulaData,
  getFormulaOutputs,
  getMenuItems,
  type HtmlFormula,
  hasFormulaProperty,
  iif,
  isCalculationFormula,
  isHtmlFormula,
  iterateFormulas,
  shouldDisplayForLocale,
  shouldDisplayForCondition,
  validateAssertions,
} from "@/lib/formula";

describe("formula.json tests", () => {
  // Iterate through all categories
  for (const [categoryKey, categoryData] of Object.entries(formulaData)) {
    // Skip metadata
    if (categoryKey === "_meta") continue;

    describe(`Category: ${categoryKey}`, () => {
      // Iterate through all formulas in the category
      for (const [formulaKey, formula] of Object.entries(categoryData)) {
        const formulaId = `${categoryKey}/${formulaKey}`;

        describe(`Formula: ${formulaId}`, () => {
          // Run embedded tests if they exist
          if (formula.test && formula.test.length > 0) {
            for (let i = 0; i < formula.test.length; i++) {
              const testCase = formula.test[i]!;

              it(`test case ${i + 1}: ${JSON.stringify(testCase.input)}`, () => {
                const actualOutputs = evaluateFormulaOutputs(
                  formula,
                  testCase.input,
                );

                // Compare with expected outputs
                for (const [key, expectedValue] of Object.entries(
                  testCase.output,
                )) {
                  const actualValue = actualOutputs[key];
                  expect(actualValue).toEqual(expectedValue);
                }
              });
            }
          } else {
            it.skip("no test cases defined");
          }
        });
      }
    });
  }
});

describe("Formula data tests", () => {
  describe("getFormulaData", () => {
    it("returns formula data", () => {
      const data = getFormulaData();
      expect(data).toBeDefined();
      const bmiFormula = data["Body Structure Index"]["bmi_adult"];
      expect(bmiFormula?.input["height"]?.label).toBe("Height");
      expect(bmiFormula?.input["height"]?.unit).toBe("cm");
    });
  });

  describe("getFormula", () => {
    it("returns English formula by default", () => {
      const formula = getFormula("bmi_adult");
      expect(formula).toBeDefined();
      expect(formula?.input["height"]?.label).toBe("Height");
      expect(formula?.input["height"]?.unit).toBe("cm");
    });

    it("returns formula structure (translations via next-intl)", () => {
      const formula = getFormula("bmi_adult");
      expect(formula).toBeDefined();
      // Formula returns English base data
      // Translations are handled separately via next-intl messages
      expect(formula?.input["height"]?.label).toBe("Height");
      expect(formula?.input["height"]?.unit).toBe("cm");
    });
  });

  describe("shouldDisplayForLocale", () => {
    it("returns true for outputs without locale restrictions", () => {
      const output = { label: "Test", text: "No restrictions" };
      expect(shouldDisplayForLocale(output, "en")).toBe(true);
      expect(shouldDisplayForLocale(output, "ja")).toBe(true);
    });

    it("respects locales_in filter", () => {
      const output = {
        label: "Test",
        text: "Japanese only",
        locales_in: ["ja"],
      };
      expect(shouldDisplayForLocale(output, "ja")).toBe(true);
      expect(shouldDisplayForLocale(output, "en")).toBe(false);
    });

    it("respects locales_not_in filter", () => {
      const output = {
        label: "Test",
        text: "Not for Japanese",
        locales_not_in: ["ja"],
      };
      expect(shouldDisplayForLocale(output, "en")).toBe(true);
      expect(shouldDisplayForLocale(output, "ja")).toBe(false);
    });

    it("returns true for inputs without locale restrictions", () => {
      const input = { label: "Test", type: "float" as const };
      expect(shouldDisplayForLocale(input, "en")).toBe(true);
      expect(shouldDisplayForLocale(input, "ja")).toBe(true);
    });

    it("respects locales_in filter for inputs", () => {
      const input = {
        label: "Test",
        type: "float" as const,
        locales_in: ["ja"],
      };
      expect(shouldDisplayForLocale(input, "ja")).toBe(true);
      expect(shouldDisplayForLocale(input, "en")).toBe(false);
    });

    it("respects locales_not_in filter for inputs", () => {
      const input = {
        label: "Test",
        type: "float" as const,
        locales_not_in: ["ja"],
      };
      expect(shouldDisplayForLocale(input, "en")).toBe(true);
      expect(shouldDisplayForLocale(input, "ja")).toBe(false);
    });

    it("returns true for formulas without locale restrictions", () => {
      const formula = {
        name: "Test Formula",
        input: {},
        output: {},
      };
      expect(shouldDisplayForLocale(formula, "en")).toBe(true);
      expect(shouldDisplayForLocale(formula, "ja")).toBe(true);
    });

    it("respects locales_in filter for calculation formulas", () => {
      const formula = {
        name: "Test Formula",
        input: {},
        output: {},
        locales_in: ["ja"],
      };
      expect(shouldDisplayForLocale(formula, "ja")).toBe(true);
      expect(shouldDisplayForLocale(formula, "en")).toBe(false);
    });

    it("respects locales_not_in filter for calculation formulas", () => {
      const formula = {
        name: "Test Formula",
        input: {},
        output: {},
        locales_not_in: ["ja"],
      };
      expect(shouldDisplayForLocale(formula, "en")).toBe(true);
      expect(shouldDisplayForLocale(formula, "ja")).toBe(false);
    });

    it("respects locales_in filter for HTML formulas", () => {
      const formula = {
        name: "Test HTML Formula",
        type: "html" as const,
        html: "<div>Test</div>",
        locales_in: ["ja"],
      };
      expect(shouldDisplayForLocale(formula, "ja")).toBe(true);
      expect(shouldDisplayForLocale(formula, "en")).toBe(false);
    });

    it("respects locales_not_in filter for HTML formulas", () => {
      const formula = {
        name: "Test HTML Formula",
        type: "html" as const,
        html: "<div>Test</div>",
        locales_not_in: ["ja"],
      };
      expect(shouldDisplayForLocale(formula, "en")).toBe(true);
      expect(shouldDisplayForLocale(formula, "ja")).toBe(false);
    });
  });

  describe("shouldDisplayForCondition", () => {
    it("returns true when no condition is specified", () => {
      const inputDef = { label: "Test", type: "select" as const };
      expect(shouldDisplayForCondition(inputDef, {})).toBe(true);
    });

    it("evaluates condition correctly - equality", () => {
      const inputDef = {
        label: "Test",
        type: "select" as const,
        visibleWhen: "is_pbc == 1",
      };
      expect(shouldDisplayForCondition(inputDef, { is_pbc: 1 })).toBe(true);
      expect(shouldDisplayForCondition(inputDef, { is_pbc: 0 })).toBe(false);
    });

    it("evaluates condition correctly - inequality", () => {
      const inputDef = {
        label: "Test",
        type: "select" as const,
        visibleWhen: "age >= 18",
      };
      expect(shouldDisplayForCondition(inputDef, { age: 18 })).toBe(true);
      expect(shouldDisplayForCondition(inputDef, { age: 25 })).toBe(true);
      expect(shouldDisplayForCondition(inputDef, { age: 17 })).toBe(false);
    });

    it("handles missing variables gracefully", () => {
      const inputDef = {
        label: "Test",
        type: "select" as const,
        visibleWhen: "is_pbc == 1",
      };
      expect(shouldDisplayForCondition(inputDef, {})).toBe(true);
    });

    it("evaluates conditions matching the Child-Pugh use case", () => {
      const pbcOffInput = {
        label: "Test",
        type: "select" as const,
        visibleWhen: "is_pbc == 0",
      };
      const pbcOnInput = {
        label: "Test",
        type: "select" as const,
        visibleWhen: "is_pbc == 1",
      };

      // PBC OFF (is_pbc = 0)
      expect(shouldDisplayForCondition(pbcOffInput, { is_pbc: 0 })).toBe(true);
      expect(shouldDisplayForCondition(pbcOffInput, { is_pbc: 1 })).toBe(false);

      // PBC ON (is_pbc = 1)
      expect(shouldDisplayForCondition(pbcOnInput, { is_pbc: 1 })).toBe(true);
      expect(shouldDisplayForCondition(pbcOnInput, { is_pbc: 0 })).toBe(false);

      // Missing variable - should show by default
      expect(shouldDisplayForCondition(pbcOnInput, {})).toBe(true);
    });
  });

  describe("getMenuItems", () => {
    it("returns English menu items", () => {
      const items = getMenuItems();
      expect(items).toBeDefined();
      const bodyIndices = items.find((i) => i.label === "Body Structure Index");
      expect(bodyIndices).toBeDefined();
      const bmiItem = bodyIndices?.items.find(
        (i) => i.path === "/formula/bmi_adult",
      );
      expect(bmiItem?.label).toBe("BMI (Adult)");
    });

    it("menu items use English base data (translations via next-intl)", () => {
      const items = getMenuItems();
      expect(items).toBeDefined();
      // Menu items return English base data
      // Translated labels are handled via next-intl in components
      const bodyIndices = items.find((i) => i.label === "Body Structure Index");
      expect(bodyIndices).toBeDefined();
      const bmiItem = bodyIndices?.items.find(
        (i) => i.path === "/formula/bmi_adult",
      );
      expect(bmiItem?.label).toBe("BMI (Adult)");
    });
  });
});

describe("Type Guards", () => {
  describe("isCalculationFormula", () => {
    it("returns true for calculation formulas", () => {
      const formula = getFormula("bmi_adult", "en");
      expect(formula).toBeDefined();
      expect(isCalculationFormula(formula!)).toBe(true);
    });

    it("returns false for HTML formulas", () => {
      // Find an HTML formula if one exists in the data
      const htmlFormula: HtmlFormula = {
        type: "html",
        name: "Test HTML",
        html: "<div>Test</div>",
      };
      expect(isCalculationFormula(htmlFormula)).toBe(false);
    });
  });

  describe("isHtmlFormula", () => {
    it("returns true for HTML formulas", () => {
      const htmlFormula: HtmlFormula = {
        type: "html",
        name: "Test HTML",
        html: "<div>Test</div>",
      };
      expect(isHtmlFormula(htmlFormula)).toBe(true);
    });

    it("returns false for calculation formulas", () => {
      const formula = getFormula("bmi_adult", "en");
      expect(formula).toBeDefined();
      expect(isHtmlFormula(formula!)).toBe(false);
    });
  });

  describe("hasFormulaProperty", () => {
    it("returns true for outputs with formula property", () => {
      const output = {
        label: "BMI",
        formula: "weight / ((height / 100) ** 2)",
        precision: 1,
      };
      expect(hasFormulaProperty(output)).toBe(true);
    });

    it("returns false for text-only outputs", () => {
      const output = {
        text: "Static text output",
      };
      expect(hasFormulaProperty(output)).toBe(false);
    });

    it("returns false for outputs without formula", () => {
      const output = {
        label: "Result",
        text: "No formula here",
      };
      expect(hasFormulaProperty(output)).toBe(false);
    });
  });
});

describe("Formula Evaluation Functions", () => {
  describe("evaluateFormula", () => {
    it("evaluates simple arithmetic expressions", () => {
      expect(evaluateFormula("2 + 2", {})).toBe(4);
      expect(evaluateFormula("10 - 3", {})).toBe(7);
      expect(evaluateFormula("5 * 4", {})).toBe(20);
      expect(evaluateFormula("20 / 4", {})).toBe(5);
    });

    it("evaluates expressions with variables", () => {
      expect(
        evaluateFormula("weight / ((height / 100) ^ 2)", {
          weight: 70,
          height: 170,
        }),
      ).toBeCloseTo(24.22, 2);
    });

    it("evaluates expressions with custom functions", () => {
      expect(evaluateFormula("max(10, 20)", {})).toBe(20);
      expect(evaluateFormula("min(10, 20)", {})).toBe(10);
      expect(evaluateFormula("sqrt(16)", {})).toBe(4);
    });

    it("evaluates iif function", () => {
      expect(
        evaluateFormula('iif(age >= 18, "adult", "child")', { age: 25 }),
      ).toBe("adult");
      expect(
        evaluateFormula('iif(age >= 18, "adult", "child")', { age: 15 }),
      ).toBe("child");
    });
  });

  describe("evaluateFormulaOutputs", () => {
    it("returns empty object for HTML formulas", () => {
      const htmlFormula: HtmlFormula = {
        type: "html",
        html: "<div>Test</div>",
      };
      const results = evaluateFormulaOutputs(htmlFormula, {});
      expect(results).toEqual({});
    });

    it("evaluates all outputs for calculation formulas", () => {
      const formula = getFormula("bmi_adult", "en");
      expect(formula).toBeDefined();
      expect(isCalculationFormula(formula!)).toBe(true);

      const results = evaluateFormulaOutputs(formula!, {
        height: 170,
        weight: 70,
      });
      expect(results.BMI).toBeDefined();
      expect(typeof results.BMI).toBe("number");
    });

    it("handles dependent outputs (iterative evaluation)", () => {
      const calcFormula: CalculationFormula = {
        name: "Test",
        input: {
          x: { type: "float", label: "X" },
        },
        output: {
          doubled: {
            label: "Doubled",
            formula: "x * 2",
            precision: 0,
          },
          quadrupled: {
            label: "Quadrupled",
            formula: "doubled * 2",
            precision: 0,
          },
        },
      };

      const results = evaluateFormulaOutputs(calcFormula, { x: 5 });
      expect(results.doubled).toBe(10);
      expect(results.quadrupled).toBe(20);
    });

    it("handles missing inputs gracefully", () => {
      const formula = getFormula("bmi_adult", "en");
      expect(formula).toBeDefined();

      // Partial input should not throw
      const results = evaluateFormulaOutputs(formula!, { height: 170 });
      expect(results).toBeDefined();
    });
  });

  describe("getFormulaOutputs", () => {
    it("returns empty object for HTML formulas", () => {
      const htmlFormula: HtmlFormula = {
        type: "html",
        html: "<div>Test</div>",
      };
      const outputs = getFormulaOutputs(htmlFormula);
      expect(outputs).toEqual({});
    });

    it("returns output definitions for calculation formulas", () => {
      const formula = getFormula("bmi_adult", "en");
      expect(formula).toBeDefined();
      expect(isCalculationFormula(formula!)).toBe(true);

      const outputs = getFormulaOutputs(formula!);
      expect(Object.keys(outputs).length).toBeGreaterThan(0);

      // All outputs should have label property
      for (const output of Object.values(outputs)) {
        expect("label" in output || "text" in output).toBe(true);
      }
    });
  });
});

describe("Validation Functions", () => {
  describe("validateAssertions", () => {
    it("returns empty array when all assertions pass", () => {
      const assertions = [
        { condition: "age >= 18", message: "Must be 18 or older" },
        { condition: "weight > 0", message: "Weight must be positive" },
      ];
      const errors = validateAssertions(assertions, { age: 25, weight: 70 });
      expect(errors).toEqual([]);
    });

    it("returns error messages when assertions fail", () => {
      const assertions = [
        { condition: "age >= 18", message: "Must be 18 or older" },
        { condition: "weight > 0", message: "Weight must be positive" },
      ];
      const errors = validateAssertions(assertions, { age: 15, weight: 70 });
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe("Must be 18 or older");
    });

    it("returns multiple error messages when multiple assertions fail", () => {
      const assertions = [
        { condition: "age >= 18", message: "Must be 18 or older" },
        { condition: "weight > 0", message: "Weight must be positive" },
      ];
      const errors = validateAssertions(assertions, { age: 15, weight: -5 });
      expect(errors).toHaveLength(2);
    });

    it("handles missing variables gracefully", () => {
      const assertions = [
        { condition: "age >= 18", message: "Must be 18 or older" },
      ];
      // Should not throw when variable is missing
      const errors = validateAssertions(assertions, {});
      expect(errors).toBeDefined();
    });
  });
});

describe("Mathematical Helper Functions", () => {
  describe("BSA_DuBois", () => {
    it("calculates body surface area correctly", () => {
      const bsa = BSA_DuBois(170, 70);
      expect(bsa).toBeCloseTo(1.81, 2);
    });

    it("handles different inputs", () => {
      const bsa1 = BSA_DuBois(180, 80);
      const bsa2 = BSA_DuBois(160, 60);
      expect(bsa1).toBeGreaterThan(bsa2);
    });
  });

  describe("GetZScore", () => {
    it("calculates z-score correctly", () => {
      expect(GetZScore(110, 100, 10)).toBe(1);
      expect(GetZScore(90, 100, 10)).toBe(-1);
      expect(GetZScore(100, 100, 10)).toBe(0);
    });
  });

  describe("GetZScoreStr", () => {
    it("formats positive z-scores with + sign", () => {
      const result = GetZScoreStr(110, 100, 10);
      expect(result).toContain("+1.00 SD");
    });

    it("formats negative z-scores with - sign", () => {
      const result = GetZScoreStr(90, 100, 10);
      expect(result).toContain("-1.00 SD");
    });

    it("formats zero z-scores with ± sign", () => {
      const result = GetZScoreStr(100, 100, 10);
      expect(result).toContain("±0.00 SD");
    });
  });

  describe("erf", () => {
    it("calculates error function", () => {
      expect(erf(0)).toBeCloseTo(0, 5);
      expect(erf(1)).toBeCloseTo(0.8427, 3);
      expect(erf(-1)).toBeCloseTo(-0.8427, 3);
    });
  });

  describe("GetZScoreFromLMS", () => {
    it("calculates z-score from LMS when L=0", () => {
      const zscore = GetZScoreFromLMS(110, 0, 100, 0.1);
      expect(zscore).toBeCloseTo(0.9531, 3);
    });

    it("calculates z-score from LMS when L!=0", () => {
      const zscore = GetZScoreFromLMS(110, 1, 100, 0.1);
      expect(zscore).toBeDefined();
      expect(typeof zscore).toBe("number");
    });
  });

  describe("GetPercentileFromZScore", () => {
    it("returns 50th percentile for z-score of 0", () => {
      const percentile = GetPercentileFromZScore(0);
      expect(percentile).toBeCloseTo(50, 1);
    });

    it("returns higher percentile for positive z-score", () => {
      const percentile = GetPercentileFromZScore(1);
      expect(percentile).toBeGreaterThan(50);
    });

    it("returns lower percentile for negative z-score", () => {
      const percentile = GetPercentileFromZScore(-1);
      expect(percentile).toBeLessThan(50);
    });
  });

  describe("GetValueFromZScore", () => {
    it("calculates value from z-score when L=0", () => {
      const value = GetValueFromZScore(1, 0, 100, 0.1);
      expect(value).toBeCloseTo(110.52, 1);
    });

    it("calculates value from z-score when L!=0", () => {
      const value = GetValueFromZScore(1, 1, 100, 0.1);
      expect(value).toBeDefined();
      expect(typeof value).toBe("number");
    });
  });

  describe("iif", () => {
    it("returns first value when first condition is true", () => {
      expect(iif(true, "a", false, "b", "c")).toBe("a");
    });

    it("returns second value when first condition is false and second is true", () => {
      expect(iif(false, "a", true, "b", "c")).toBe("b");
    });

    it("returns default value when all conditions are false", () => {
      expect(iif(false, "a", false, "b", "c")).toBe("c");
    });

    it("works with numeric conditions", () => {
      const bmi = 28;
      const result = iif(bmi >= 30, "obese", bmi >= 25, "overweight", "normal");
      expect(result).toBe("overweight");
    });
  });

  describe("iterateFormulas", () => {
    it("should iterate through all formulas", () => {
      const formulaIds: string[] = [];
      iterateFormulas((_, formulaId) => {
        formulaIds.push(formulaId);
      });

      expect(formulaIds.length).toBeGreaterThan(0);
      expect(formulaIds).toContain("bmi_adult"); // Known formula
    });

    it("should skip _meta category", () => {
      const categories: string[] = [];
      iterateFormulas((categoryName) => {
        if (!categories.includes(categoryName)) {
          categories.push(categoryName);
        }
      });

      expect(categories).not.toContain("_meta");
    });

    it("should provide category name, formula ID, and formula object", () => {
      let found = false;
      iterateFormulas((categoryName, formulaId, formula) => {
        if (formulaId === "bmi_adult") {
          expect(categoryName).toBe("Body Structure Index");
          expect(formula).toBeDefined();
          expect(formula.name).toBeDefined();
          found = true;
        }
      });

      expect(found).toBe(true);
    });
  });
});
