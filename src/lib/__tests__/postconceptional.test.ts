import { describe, it, expect } from "vitest";
import {
  getFormula,
  evaluateFormulaOutputs,
  isCalculationFormula,
  type CalculationFormula,
} from "@/lib/formula";

describe("postconceptional_days formula", () => {
  it("evaluates all three outputs in English", () => {
    const formula = getFormula("postconceptional_days");
    expect(formula).toBeDefined();
    expect(isCalculationFormula(formula!)).toBe(true);

    // Check output labels in English (base data)
    const calcFormula = formula! as CalculationFormula;
    const outputs = calcFormula.output;

    const getFormulaOutput = (key: string) => {
      const output = outputs[key];
      expect(output).toBeDefined();
      expect(output).toHaveProperty("label");
      return output as { label: string };
    };

    expect(getFormulaOutput("postconceptional_days").label).toBe(
      "Postconceptional Days",
    );
    expect(getFormulaOutput("postconceptional_age").label).toBe(
      "Postconceptional Age",
    );
    expect(getFormulaOutput("corrected_age").label).toBe("Corrected Age");

    // Test evaluation
    const inputValues = {
      edc: 1705276800,
      target_date: 1705276800,
    };

    const results = evaluateFormulaOutputs(formula!, inputValues);

    // Verify all outputs are evaluated
    expect(results.postconceptional_days).toBe(280);
    expect(results.postconceptional_age).toBeDefined();
    expect(results.corrected_age).toBeDefined();
  });

  it("formulas return English base data (Japanese translations via next-intl)", () => {
    // Formula data is always in English
    // Japanese translations are accessed via next-intl messages
    const formula = getFormula("postconceptional_days");
    expect(formula).toBeDefined();
    expect(isCalculationFormula(formula!)).toBe(true);

    // Check that all three output definitions exist and have formulas
    const calcFormula = formula! as CalculationFormula;
    const outputs = calcFormula.output;

    // Helper to get formula output with type assertion
    const getFormulaOutput = (key: string) => {
      const output = outputs[key];
      expect(output).toBeDefined();
      expect(output).toHaveProperty("label");
      expect(output).toHaveProperty("formula");
      return output as { label: string; formula: string };
    };

    // Base data is in English
    expect(getFormulaOutput("postconceptional_days").label).toBe("Postconceptional Days");
    expect(getFormulaOutput("postconceptional_age").label).toBe("Postconceptional Age");
    expect(getFormulaOutput("corrected_age").label).toBe("Corrected Age");

    // Test evaluation with same EDC and target date (term birth)
    const inputValues = {
      edc: 1705276800, // Jan 15, 2024
      target_date: 1705276800, // Same date
    };

    const results = evaluateFormulaOutputs(formula!, inputValues);

    // All three outputs should be evaluated
    expect(results.postconceptional_days).toBeDefined();
    expect(results.postconceptional_days).toBe(280);

    expect(results.postconceptional_age).toBeDefined();
    expect(results.postconceptional_age).toContain("weeks");
    expect(results.postconceptional_age).toContain("days");

    expect(results.corrected_age).toBeDefined();
    expect(results.corrected_age).toContain("months");
    expect(results.corrected_age).toContain("days");
  });
});
