/**
 * Tests for library exports to ensure they can be used by external applications
 */
import { describe, expect, it } from "vitest";
import {
  getFormula,
  evaluateFormulaOutputs,
  isCalculationFormula,
  formulaData,
  getAllFormulaIds,
  BSA_DuBois,
  GetZScore,
  buildHumanReadableData,
} from "../index";

describe("Library exports", () => {
  describe("Basic formula access", () => {
    it("should export getFormula function", () => {
      const formula = getFormula("bmi_adult");
      expect(formula).toBeDefined();
      expect(isCalculationFormula(formula!)).toBe(true);
    });

    it("should export formulaData", () => {
      expect(formulaData).toBeDefined();
      expect(formulaData._meta).toBeDefined();
      expect(formulaData["Body Structure Index"]).toBeDefined();
    });

    it("should export getAllFormulaIds", () => {
      const ids = getAllFormulaIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids).toContain("bmi_adult");
    });
  });

  describe("Formula evaluation", () => {
    it("should calculate BMI correctly", () => {
      const formula = getFormula("bmi_adult");
      expect(formula).toBeDefined();

      if (formula && isCalculationFormula(formula)) {
        const results = evaluateFormulaOutputs(formula, {
          height: 170,
          weight: 70,
        });

        expect(results.BMI).toBeCloseTo(24.2, 1);
      }
    });

    it("should calculate creatinine clearance correctly", () => {
      const formula = getFormula("ccr_adult");
      expect(formula).toBeDefined();

      if (formula && isCalculationFormula(formula)) {
        const results = evaluateFormulaOutputs(formula, {
          age: 50,
          sex: 1,
          weight: 70,
          scr: 1.0,
        });

        expect(results.cockcroft).toBeDefined();
        expect(typeof results.cockcroft).toBe("number");
        expect(results.cockcroft).toBeCloseTo(87.5, 1);
      }
    });
  });

  describe("Medical calculation utilities", () => {
    it("should calculate BSA using Du Bois formula", () => {
      const bsa = BSA_DuBois(170, 70);
      expect(bsa).toBeCloseTo(1.81, 2);
    });

    it("should calculate Z-score", () => {
      const zscore = GetZScore(100, 90, 5);
      expect(zscore).toBe(2);
    });
  });

  describe("Export utilities", () => {
    it("should build human-readable data", () => {
      const formula = getFormula("bmi_adult");
      expect(formula).toBeDefined();

      if (formula && isCalculationFormula(formula)) {
        const inputValues = { height: 170, weight: 70 };
        const results = evaluateFormulaOutputs(formula, inputValues);

        const readable = buildHumanReadableData(
          formula,
          "bmi_adult",
          inputValues,
          results,
          "en",
        );

        expect(readable).toContain("BMI");
        expect(readable).toContain("170");
        expect(readable).toContain("70");
      }
    });
  });

  describe("Type guards", () => {
    it("should correctly identify calculation formulas", () => {
      const calcFormula = getFormula("bmi_adult");
      expect(isCalculationFormula(calcFormula!)).toBe(true);
    });

    it("should correctly identify HTML formulas", () => {
      // Try to find an HTML formula if any exist
      const formula = getFormula("who_growth_chart_boy_0to2_height");
      if (formula) {
        const isHtml = "type" in formula && formula.type === "html";
        if (isHtml) {
          expect(isCalculationFormula(formula)).toBe(false);
        }
      }
    });
  });
});
