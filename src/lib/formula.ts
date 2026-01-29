import {
  FormulaDataSchema,
  type FormulaData,
  type Formula,
  type FormulaOutput,
  type FormulaInput,
} from "@/types/formula";
import { Parser } from "expr-eval";

// Import modular formula structure
import formulasIndex from "@/formulas/index.json";
import bodyStructureIndex from "@/formulas/body-structure-index.json";
import cardiology from "@/formulas/cardiology.json";
import emergencyMedicine from "@/formulas/emergency-medicine.json";
import endocrinologyAndMetabolism from "@/formulas/endocrinology-and-metabolism.json";
import gastroenterology from "@/formulas/gastroenterology.json";
import hepatology from "@/formulas/hepatology.json";
import infectiousDiseases from "@/formulas/infectious-diseases.json";
import neurology from "@/formulas/neurology.json";
import nutrition from "@/formulas/nutrition.json";
import obstetrics from "@/formulas/obstetrics.json";
import others from "@/formulas/others.json";
import pediatrics from "@/formulas/pediatrics.json";
import psychiatry from "@/formulas/psychiatry.json";
import pulmonology from "@/formulas/pulmonology.json";
import renalFunction from "@/formulas/renal-function.json";
import electrolytes from "@/formulas/electrolytes.json";
import hematology from "@/formulas/hematology.json";
import neonatology from "@/formulas/neonatology.json";
import pediatricScoring from "@/formulas/pediatric-scoring.json";

// Map category names to imported data
const categoryModules: Record<string, Record<string, Formula>> = {
  "Body Structure Index": bodyStructureIndex as Record<string, Formula>,
  Gastroenterology: gastroenterology as Record<string, Formula>,
  Hepatology: hepatology as Record<string, Formula>,
  Cardiology: cardiology as Record<string, Formula>,
  "Endocrinology and Metabolism": endocrinologyAndMetabolism as Record<
    string,
    Formula
  >,
  "Renal Function": renalFunction as Record<string, Formula>,
  "Electrolytes and Fluid Balance": electrolytes as Record<string, Formula>,
  /* Immunology and Allergy here */
  Hematology: hematology as Record<string, Formula>,
  "Infectious Diseases": infectiousDiseases as Record<string, Formula>,
  Pulmonology: pulmonology as Record<string, Formula>,
  Neurology: neurology as Record<string, Formula>,
  /* Toxin here */
  "Emergency Medicine": emergencyMedicine as Record<string, Formula>,
  /* Anethesiology here */
  Obstetrics: obstetrics as Record<string, Formula>,
  Pediatrics: pediatrics as Record<string, Formula>,
  Neonatology: neonatology as Record<string, Formula>,
  "Pediatric Scoring Systems": pediatricScoring as Record<string, Formula>,
  Nutrition: nutrition as Record<string, Formula>,
  Psychiatry: psychiatry as Record<string, Formula>,
  Others: others as Record<string, Formula>,
};

// Reconstruct the original formulaJson structure from modular files
const formulaJson: FormulaData = {
  _meta: formulasIndex._meta,
  ...categoryModules,
};

// Type guards for Formula types
export type CalculationFormula = {
  name?: string;
  input: Record<string, FormulaInput>;
  output: Record<string, FormulaOutput>;
  assert?: Array<{ condition: string; message: string }>;
  test?: Array<{
    input: Record<string, number | string>;
    output: Record<string, number | string>;
  }>;
  ref?: Record<string, string>;
};

export type HtmlFormula = {
  name?: string;
  type: "html";
  html: string;
  ref?: Record<string, string>;
};

export function isCalculationFormula(
  formula: Formula,
): formula is CalculationFormula {
  return "input" in formula && "output" in formula;
}

export function isHtmlFormula(formula: Formula): formula is HtmlFormula {
  return "type" in formula && formula.type === "html";
}

export function hasFormulaProperty(
  output: FormulaOutput,
): output is FormulaOutput & { formula: string } {
  return "formula" in output && typeof output.formula === "string";
}

/**
 * Get formula data (always returns English base data).
 * Translations are handled via next-intl messages.
 *
 * @returns Formula data
 */
export function getFormulaData(): FormulaData {
  return FormulaDataSchema.parse(formulaJson);
}

/**
 * Check if an output should be displayed for the given locale.
 *
 * @param output - The output definition (FormulaOutput)
 * @param locale - The locale code (e.g., "en", "ja")
 * @returns True if the output should be displayed, false otherwise
 */
export function shouldDisplayForLocale(
  output: FormulaOutput,
  locale: string,
): boolean {
  // locales_in: only show if locale is in the list
  if (
    "locales_in" in output &&
    output.locales_in &&
    output.locales_in.length > 0
  ) {
    return output.locales_in.includes(locale);
  }

  // locales_not_in: hide if locale is in the list
  if (
    "locales_not_in" in output &&
    output.locales_not_in &&
    output.locales_not_in.length > 0
  ) {
    return !output.locales_not_in.includes(locale);
  }

  // No locale restrictions: show for all
  return true;
}

/**
 * Singleton instance of the validated formula data.
 *
 * The JSON is validated at import time using Zod. If the JSON structure
 * doesn't match the schema, an error will be thrown immediately with
 * detailed information about what's wrong.
 */
const _validatedData = FormulaDataSchema.parse(formulaJson);

/**
 * Type-safe, validated formula data (English base data).
 * Translations are handled via next-intl messages.
 *
 * @example
 * ```ts
 * import { formulaData } from '@/lib/formula';
 *
 * const bmiFormula = formulaData['Body Structure Index']['bmi_adult'];
 * const heightInput = bmiFormula.input['height'];
 * console.log(heightInput.label); // "Height [cm]"
 * ```
 */
export const formulaData: FormulaData = _validatedData;

/**
 * Type for the callback function used in iterateFormulas.
 */
type FormulaCallback = (
  categoryName: string,
  formulaId: string,
  formula: Formula,
) => void;

/**
 * Utility to iterate over all formulas in formulaData.
 * Provides a DRY (Don't Repeat Yourself) abstraction for formula iteration.
 * Automatically skips the "_meta" category.
 *
 * @param callback - Function called for each formula with category name, formula ID, and formula object
 *
 * @example
 * ```ts
 * // Collect all formula IDs
 * const ids: string[] = [];
 * iterateFormulas((_, formulaId) => {
 *   ids.push(formulaId);
 * });
 *
 * // Find a specific formula
 * let found: Formula | undefined;
 * iterateFormulas((_, formulaId, formula) => {
 *   if (formulaId === 'bmi_adult') {
 *     found = formula;
 *   }
 * });
 * ```
 */
export function iterateFormulas(callback: FormulaCallback): void {
  const data = formulaData;

  for (const [categoryName, categoryData] of Object.entries(data)) {
    if (categoryName === "_meta") continue;
    const categoryRecord = categoryData as Record<string, Formula>;
    for (const [formulaId, formula] of Object.entries(categoryRecord)) {
      callback(categoryName, formulaId, formula);
    }
  }
}

/**
 * Get a formula by ID (searches across all categories).
 * Returns English base data. Use translation helpers for localized labels.
 *
 * @param id - The formula ID (e.g., "bmi_adult")
 * @returns The formula definition, or undefined if not found
 */
export function getFormula(id: string): Formula | undefined {
  let found: Formula | undefined;
  
  iterateFormulas((_, formulaId, formula) => {
    if (formulaId === id) {
      found = formula;
    }
  });
  
  return found;
}

/**
 * Build a map of formula ID to category name.
 * Returns English category names. Use translation helpers for localized labels.
 * Useful for quick category lookups without repeated iteration.
 *
 * @returns A Map of formula ID to category name
 *
 * @example
 * ```ts
 * import { getCategoryMap } from '@/lib/formula';
 *
 * const categoryMap = getCategoryMap();
 * const category = categoryMap.get('bmi_adult'); // Returns "Body Structure Index"
 * ```
 */
export function getCategoryMap(): Map<string, string> {
  const map = new Map<string, string>();

  iterateFormulas((categoryName, formulaId) => {
    map.set(formulaId, categoryName);
  });

  return map;
}

/**
 * Custom iif function for conditional expressions (like Excel's IF function).
 * Supports multiple conditions in order: iif(cond1, val1, cond2, val2, ..., defaultVal)
 *
 * @example
 * iif(BMI >= 30, 'obese', BMI >= 25, 'overweight', 'normal')
 * // Returns 'obese' if BMI >= 30, 'overweight' if BMI >= 25, otherwise 'normal'
 */
export function iif(...args: unknown[]): unknown {
  for (let i = 0; i < args.length - 1; i += 2) {
    const condition = args[i];
    const value = args[i + 1];
    if (condition) {
      return value;
    }
  }
  // If odd number of args, the last one is the default value
  if (args.length % 2 === 1) {
    return args[args.length - 1];
  }
  return undefined;
}

/**
 * Body Surface Area calculation using Du Bois formula.
 *
 * BSA = 0.007184 × height^0.725 × weight^0.425
 *
 * @param height - Height in centimeters
 * @param weight - Weight in kilograms
 * @returns Body Surface Area in square meters
 *
 * @example
 * BSA_DuBois(170, 70) // Returns approximately 1.81
 */
export function BSA_DuBois(height: number, weight: number): number {
  return 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
}

/**
 * Calculate Z-score.
 *
 * @param value - The observed value
 * @param average - The mean/average value
 * @param sd - The standard deviation
 * @returns The Z-score
 */
export function GetZScore(value: number, average: number, sd: number): number {
  return (value - average) / sd;
}

/**
 * Calculate Z-score with formatted string.
 *
 * @param value - The observed value
 * @param average - The mean/average value
 * @param sd - The standard deviation
 * @returns Formatted string with Z-score notation
 */
export function GetZScoreStr(
  value: number,
  average: number,
  sd: number,
): string {
  const zscore = GetZScore(value, average, sd).toFixed(2);
  if (zscore === "0.00" || zscore === "-0.00") {
    return `${value} ( ±0.00 SD )`;
  } else if (parseFloat(zscore) > 0) {
    return `${value} ( +${zscore} SD )`;
  } else {
    return `${value} ( ${zscore} SD )`;
  }
}

/**
 * Helper function to calculate factorial.
 *
 * @param n - The number to calculate factorial for (must be non-negative integer)
 * @returns The factorial of n
 * @throws {Error} If n is negative or not an integer
 */
function factorialHelper(n: number): number {
  if (n < 0) {
    throw new Error("Factorial is not defined for negative numbers");
  }
  if (!Number.isInteger(n)) {
    throw new Error("Factorial is only defined for integers");
  }

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Error function (erf) approximation using Taylor expansion.
 *
 * @param x - Input value
 * @returns Error function value
 */
export function erf(x: number): number {
  const m = 1.0;
  let s = 1.0;
  let sum = x * 1.0;
  for (let i = 1; i < 50; i++) {
    const factorial = factorialHelper(i);
    s *= -1;
    sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (factorial * (2.0 * i + 1.0));
  }
  return (2 * sum) / Math.sqrt(Math.PI);
}

/**
 * Get Z-score from LMS parameters (Box-Cox transformation).
 *
 * @param value - The observed value
 * @param l - Lambda (Box-Cox power)
 * @param m - Mu (median)
 * @param s - Sigma (coefficient of variation)
 * @returns Z-score
 */
export function GetZScoreFromLMS(
  value: number,
  l: number,
  m: number,
  s: number,
): number {
  if (l === 0) {
    return Math.log(value / m) / s;
  } else {
    return (Math.pow(value / m, l) - 1) / (l * s);
  }
}

/**
 * Get percentile from Z-score using error function.
 *
 * @param sd - Standard deviation (Z-score)
 * @returns Percentile value (0-100)
 */
export function GetPercentileFromZScore(sd: number): number {
  const area = erf(sd / 1.41421356) / 2;
  return 50 + area * 100;
}

/**
 * Get value from Z-score using LMS parameters (inverse Box-Cox transformation).
 *
 * @param zscore - The Z-score
 * @param l - Lambda (Box-Cox power)
 * @param m - Mu (median)
 * @param s - Sigma (coefficient of variation)
 * @returns The calculated value
 */
export function GetValueFromZScore(
  zscore: number,
  l: number,
  m: number,
  s: number,
): number {
  if (l === 0) {
    return Math.exp(zscore * s) * m;
  } else {
    return Math.pow(zscore * l * s + 1, 1.0 / l) * m;
  }
}

/**
 * Parse ISO date string (YYYY-MM-DD) to timestamp (milliseconds since epoch).
 *
 * @param dateString - ISO date string
 * @returns Timestamp in milliseconds
 */
export function dateparse(dateString: string): number {
  return Date.parse(dateString);
}

/**
 * Concatenate values into a string.
 * Supports any number of arguments and converts them to strings.
 *
 * @param args - Values to concatenate
 * @returns Concatenated string
 *
 * @example
 * concat(40, ' weeks ', 5, ' days') // Returns "40 weeks 5 days"
 */
export function concat(...args: unknown[]): string {
  return args.join("");
}

/**
 * Expression parser with custom functions for formula evaluation.
 */
const parser = new Parser({
  operators: {
    // Enable 'and', 'or' keywords and || operator
    logical: true,
    comparison: true,
  },
});

/**
 * Custom functions available in formula expressions.
 * Organized by category for better maintainability and documentation.
 */
const customFunctions = {
  // Conditional functions
  iif,
  if: iif, // Alias for compatibility

  // Mathematical functions
  min: Math.min,
  max: Math.max,
  sqrt: Math.sqrt,
  log: Math.log,
  pow: Math.pow,
  exp: Math.exp,
  floor: Math.floor,

  // Medical calculations
  BSA_DuBois,
  GetZScore,
  GetZScoreStr,
  GetZScoreFromLMS,
  GetPercentileFromZScore,
  GetValueFromZScore,

  // Statistical functions
  erf,

  // Utility functions
  dateparse,
  concat,
} as const;

// Register all custom functions with the parser
Object.entries(customFunctions).forEach(([name, func]) => {
  parser.functions[name] = func;
});

/**
 * Input values for formula evaluation.
 */
export type FormulaInputValues = Record<string, number | string>;

/**
 * Output values from formula evaluation.
 */
export type FormulaOutputValues = Record<string, number | string>;

/**
 * Evaluate a formula expression given input values.
 *
 * @param formula - The formula expression string (e.g., "weight/(height/100)/(height/100)")
 * @param inputValues - The input values to use in the formula
 * @returns The evaluated result (number or string)
 * @throws {Error} If the formula expression is invalid
 *
 * @example
 * ```ts
 * evaluateFormula("weight/(height/100)/(height/100)", { height: 170, weight: 70 })
 * // Returns 24.224...
 * ```
 *
 * @security
 * CRITICAL: The formula expression MUST come from trusted `formula.json` files only.
 * NEVER pass unsanitized user-provided strings to this function, as expr-eval
 * could evaluate potentially dangerous expressions. All formulas are defined
 * by developers in the formulas/ directory and validated at build time.
 */
export function evaluateFormula(
  formula: string,
  inputValues: FormulaInputValues,
): number | string {
  const expr = parser.parse(formula);
  return expr.evaluate(inputValues);
}

/**
 * Format output value based on precision (if numeric).
 *
 * @param value - The value to format
 * @param precision - The number of decimal places to keep
 * @returns The formatted value
 */
export function formatOutput(
  value: number | string,
  precision?: number,
): number | string {
  if (typeof value === "number" && precision !== undefined) {
    return Number(value.toFixed(precision));
  }
  return value;
}

/**
 * Evaluate all formula outputs given input values.
 * Handles dependencies between outputs by iteratively evaluating
 * until all outputs are calculated.
 *
 * @param formula - The formula definition
 * @param inputValues - The input values to use in the formulas
 * @returns A map of output key to evaluated value
 *
 * @example
 * ```ts
 * const bmiFormula = formulaData['Body Structure Index']['bmi_adult'];
 * const results = evaluateFormulaOutputs(bmiFormula, { height: 170, weight: 70 });
 * // Returns { BMI: 24.2, who_diag: "normal", jasso_diag: "標準" }
 * ```
 */
/**
 * Validate assertions against input values.
 *
 * @param assertions - Array of assertions to validate
 * @param inputValues - The input values to validate against
 * @returns Array of error messages for failed assertions
 *
 * @example
 * ```ts
 * const assertions = [
 *   { condition: "systolic > diastolic", message: "収縮期血圧は拡張期血圧より高くなければなりません" },
 *   { condition: "age >= 18", message: "18歳以上のみ対象です" }
 * ];
 * const errors = validateAssertions(assertions, { systolic: 120, diastolic: 80, age: 25 });
 * // Returns [] (no errors)
 * ```
 */
export function validateAssertions(
  assertions: { condition: string; message: string }[],
  inputValues: FormulaInputValues,
): string[] {
  const errors: string[] = [];

  for (const assertion of assertions) {
    try {
      const expr = parser.parse(assertion.condition);
      const result = expr.evaluate(inputValues);
      // Assertion fails if condition is falsy
      if (!result) {
        errors.push(assertion.message);
      }
    } catch {
      // If evaluation fails (e.g., missing variables), skip this assertion
      // This prevents errors during partial input
      continue;
    }
  }

  return errors;
}

export function evaluateFormulaOutputs(
  formula: Formula,
  inputValues: FormulaInputValues,
): FormulaOutputValues {
  const results: FormulaOutputValues = {};
  // Maximum iterations to prevent infinite loops in case of circular dependencies
  // or other evaluation issues. 10 iterations should be more than enough for
  // typical multi-step calculations where outputs depend on other outputs.
  const maxIterations = 10;

  // Only calculation formulas have output
  if (!isCalculationFormula(formula)) {
    return results;
  }

  // Iterative evaluation: Some outputs may depend on other outputs,
  // so we iterate multiple times until all outputs are calculated or no progress is made.
  // For example: output1 = input1 + input2, output2 = output1 * 2
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let progress = false;

    for (const [outputKey, outputDef] of Object.entries(formula.output)) {
      // Skip if already calculated
      if (outputKey in results) continue;

      if (hasFormulaProperty(outputDef)) {
        try {
          // Combine input values with previously calculated outputs
          const context = { ...inputValues, ...results };
          const value = evaluateFormula(outputDef.formula, context);
          results[outputKey] = formatOutput(value, outputDef.precision);
          progress = true;
        } catch {
          // Variable not yet available, will retry in next iteration
        }
      }
    }

    // If no progress was made, we're done (or stuck)
    if (!progress) break;
  }

  return results;
}

/**
 * Get all output definitions for a formula.
 *
 * @param formula - The formula definition
 * @returns A map of output key to output definition
 */
export function getFormulaOutputs(
  formula: Formula,
): Record<string, FormulaOutput> {
  const outputs: Record<string, FormulaOutput> = {};

  // Only calculation formulas have output
  if (!isCalculationFormula(formula)) {
    return outputs;
  }

  for (const [key, value] of Object.entries(formula.output)) {
    outputs[key] = value;
  }

  return outputs;
}

/**
 * Menu item structure for navigation.
 */
export interface MenuItem {
  /** Menu item label */
  label: string;
  /** URL path for the menu item */
  path: string;
}

/**
 * Category menu item with nested formula items.
 */
export interface CategoryMenuItem extends MenuItem {
  /** Formula items within this category */
  items: MenuItem[];
}

/**
 * Get all categories and formulas as a menu structure for navigation.
 * Returns English base data. Use translation helpers for localized labels.
 *
 * @returns Array of category menu items with nested formula items
 *
 * @example
 * ```ts
 * import { getMenuItems } from '@/lib/formula';
 *
 * const menuItems = getMenuItems();
 * // Returns:
 * // [
 * //   {
 * //     label: "Body Structure Index",
 * //     path: "/category/Body%20Structure%20Index",
 * //     items: [
 * //       { label: "BMI (Adult)", path: "/formula/bmi_adult" },
 * //       { label: "BMI/Kaup/Rohrer Index (Child)", path: "/formula/bmi_child" }
 * //     ]
 * //   }
 * // ]
 * ```
 */
export function getMenuItems(): CategoryMenuItem[] {
  const categoryMap = new Map<string, MenuItem[]>();

  // Build category menu structure
  iterateFormulas((categoryName, formulaId, formula) => {
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    
    categoryMap.get(categoryName)!.push({
      label: formula.name ?? formulaId,
      path: `/formula/${formulaId}`,
    });
  });

  // Convert map to array of CategoryMenuItem
  const items: CategoryMenuItem[] = [];
  for (const [categoryName, formulas] of categoryMap.entries()) {
    items.push({
      label: categoryName,
      path: `/category/${encodeURIComponent(categoryName)}`,
      items: formulas,
    });
  }

  return items;
}

/**
 * Get a flat array of all formula IDs in order (by category and formula).
 *
 * @returns Array of formula IDs
 */
export function getAllFormulaIds(): string[] {
  const formulaIds: string[] = [];

  iterateFormulas((_, formulaId) => {
    formulaIds.push(formulaId);
  });

  return formulaIds;
}

/**
 * Get the previous and next formula IDs for a given formula.
 *
 * @param id - The current formula ID
 * @returns An object with previous and next formula IDs (undefined if none)
 */
export function getAdjacentFormulas(
  id: string,
): { previous?: string; next?: string } {
  const allIds = getAllFormulaIds();
  const index = allIds.indexOf(id);

  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: index > 0 ? allIds[index - 1] : undefined,
    next: index < allIds.length - 1 ? allIds[index + 1] : undefined,
  };
}
