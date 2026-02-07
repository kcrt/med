/**
 * Tests for calculation export utilities
 */
import { describe, expect, it } from "vitest";
import { buildHumanReadableData } from "../calculation-export";
import type { CalculationFormula } from "../formula";

describe("buildHumanReadableData", () => {
  it("should display Yes/No for onoff inputs", () => {
    const formula: CalculationFormula = {
      name: "Test Formula",
      info: "Test formula for onoff inputs",
      input: {
        hypertension: {
          label: "Hypertension",
          type: "onoff",
        },
        diabetes: {
          label: "Diabetes",
          type: "onoff",
        },
      },
      output: {
        result: {
          label: "Result",
          formula: "hypertension + diabetes",
        },
      },
    };

    const inputValues = {
      hypertension: 1,
      diabetes: 0,
    };

    const outputResults = {
      result: 1,
    };

    const readable = buildHumanReadableData(
      formula,
      "test_formula",
      inputValues,
      outputResults,
    );

    expect(readable).toContain("Hypertension: Yes");
    expect(readable).toContain("Diabetes: No");
  });

  it("should display Male/Female for sex inputs", () => {
    const formula: CalculationFormula = {
      name: "Test Formula",
      info: "Test formula for sex inputs",
      input: {
        sex: {
          label: "Sex",
          type: "sex",
        },
      },
      output: {
        result: {
          label: "Result",
          formula: "sex",
        },
      },
    };

    // Test with male (1)
    let inputValues = { sex: 1 };
    let outputResults = { result: 1 };
    let readable = buildHumanReadableData(
      formula,
      "test_formula",
      inputValues,
      outputResults,
    );
    expect(readable).toContain("Sex: Male");

    // Test with female (0)
    inputValues = { sex: 0 };
    outputResults = { result: 0 };
    readable = buildHumanReadableData(
      formula,
      "test_formula",
      inputValues,
      outputResults,
    );
    expect(readable).toContain("Sex: Female");
  });

  it("should display option labels for select inputs", () => {
    const formula: CalculationFormula = {
      name: "Test Formula",
      info: "Test formula for select inputs",
      input: {
        killip_class: {
          label: "Killip Class",
          type: "select",
          options: [
            { value: 0, label: "I - No heart failure" },
            { value: 15, label: "II - Rales/JVD" },
            { value: 30, label: "III - Pulmonary edema" },
            { value: 45, label: "IV - Cardiogenic shock" },
          ],
        },
      },
      output: {
        result: {
          label: "Result",
          formula: "killip_class",
        },
      },
    };

    const inputValues = {
      killip_class: 15,
    };

    const outputResults = {
      result: 15,
    };

    const readable = buildHumanReadableData(
      formula,
      "test_formula",
      inputValues,
      outputResults,
    );

    expect(readable).toContain("Killip Class: II - Rales/JVD");
  });

  it("should display numeric values for numeric inputs", () => {
    const formula: CalculationFormula = {
      name: "BMI",
      info: "Body Mass Index",
      input: {
        height: {
          label: "Height",
          type: "float",
          unit: "cm",
        },
        weight: {
          label: "Weight",
          type: "float",
          unit: "kg",
        },
      },
      output: {
        bmi: {
          label: "BMI",
          formula: "weight / (height / 100) ** 2",
        },
      },
    };

    const inputValues = {
      height: 170,
      weight: 70,
    };

    const outputResults = {
      bmi: 24.2,
    };

    const readable = buildHumanReadableData(
      formula,
      "bmi_test",
      inputValues,
      outputResults,
    );

    expect(readable).toContain("Height: 170");
    expect(readable).toContain("Weight: 70");
  });

  it("should handle mixed input types", () => {
    const formula: CalculationFormula = {
      name: "Mixed Formula",
      info: "Test formula with mixed input types",
      input: {
        age: {
          label: "Age",
          type: "int",
          unit: "years",
        },
        diabetes: {
          label: "Diabetes",
          type: "onoff",
        },
        sex: {
          label: "Sex",
          type: "sex",
        },
        risk_level: {
          label: "Risk Level",
          type: "select",
          options: [
            { value: 0, label: "Low" },
            { value: 1, label: "Medium" },
            { value: 2, label: "High" },
          ],
        },
      },
      output: {
        score: {
          label: "Score",
          formula: "age + diabetes + sex + risk_level",
        },
      },
    };

    const inputValues = {
      age: 50,
      diabetes: 1,
      sex: 0,
      risk_level: 2,
    };

    const outputResults = {
      score: 53,
    };

    const readable = buildHumanReadableData(
      formula,
      "mixed_test",
      inputValues,
      outputResults,
    );

    expect(readable).toContain("Age: 50");
    expect(readable).toContain("Diabetes: Yes");
    expect(readable).toContain("Sex: Female");
    expect(readable).toContain("Risk Level: High");
  });

  it("should handle select inputs with string values", () => {
    const formula: CalculationFormula = {
      name: "Test Formula",
      info: "Test formula with string select values",
      input: {
        category: {
          label: "Category",
          type: "select",
          options: [
            { value: "low", label: "Low Risk" },
            { value: "medium", label: "Medium Risk" },
            { value: "high", label: "High Risk" },
          ],
        },
      },
      output: {
        result: {
          label: "Result",
          text: "Category selected",
        },
      },
    };

    const inputValues = {
      category: "medium",
    };

    const outputResults = {
      result: "Category selected",
    };

    const readable = buildHumanReadableData(
      formula,
      "test_formula",
      inputValues,
      outputResults,
    );

    expect(readable).toContain("Category: Medium Risk");
  });
});
