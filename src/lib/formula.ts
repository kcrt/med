import {
  FormulaDataSchema,
  FormulaLanguageOverrideSchema,
  type FormulaData,
  type Formula,
  type FormulaOutput,
  type FormulaInput,
  type FormulaLanguageOverride,
} from "@/types/formula";
import { Parser } from "expr-eval";

// Import language override files
import formulaLanguageJa from "@/formula_language_ja.json";

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
  "Gastroenterology": gastroenterology as Record<string, Formula>,
  "Hepatology": hepatology as Record<string, Formula>,
  "Cardiology": cardiology as Record<string, Formula>,
  "Endocrinology and Metabolism": endocrinologyAndMetabolism as Record<string, Formula>,
  "Renal Function": renalFunction as Record<string, Formula>,
  "Electrolytes and Fluid Balance": electrolytes as Record<string, Formula>,
  /* Immunology and Allergy here */
  "Hematology": hematology as Record<string, Formula>,
  "Infectious Diseases": infectiousDiseases as Record<string, Formula>,
  "Pulmonology": pulmonology as Record<string, Formula>,
  "Neurology": neurology as Record<string, Formula>,
  /* Toxin here */
  "Emergency Medicine": emergencyMedicine as Record<string, Formula>,
  /* Anethesiology here */
  "Obstetrics": obstetrics as Record<string, Formula>,
  "Pediatrics": pediatrics as Record<string, Formula>,
  "Neonatology": neonatology as Record<string, Formula>,
  "Pediatric Scoring Systems": pediatricScoring as Record<string, Formula>,
  "Nutrition": nutrition as Record<string, Formula>,
  "Psychiatry": psychiatry as Record<string, Formula>,
  "Others": others as Record<string, Formula>,
};

// Reconstruct the original formulaJson structure from modular files
const formulaJson: FormulaData = {
  _meta: formulasIndex._meta,
  ...categoryModules,
};

// Cache for locale-specific formula data
const localeDataCache = new Map<string, FormulaData>();

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
 * Get locale-specific formula data with merged language overrides.
 *
 * @param locale - The locale code (e.g., "en", "ja")
 * @returns Merged formula data for the specified locale
 */
export function getLocalizedFormulaData(locale: string): FormulaData {
  // Check cache first
  if (localeDataCache.has(locale)) {
    return localeDataCache.get(locale)!;
  }

  // Start with base data
  const baseData = FormulaDataSchema.parse(formulaJson);

  // Apply language overrides if available
  let mergedData = baseData;

  if (locale === "ja") {
    const jaOverrides = FormulaLanguageOverrideSchema.parse(formulaLanguageJa);
    mergedData = mergeFormulaData(baseData, jaOverrides);
  }

  // Cache the result
  localeDataCache.set(locale, mergedData);

  return mergedData;
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
 * Deep merge formula base with language overrides.
 *
 * @param base - The base formula data
 * @param overrides - The language override data (flat structure with formula IDs as keys)
 * @returns Merged formula data
 */
function mergeFormulaData(
  base: FormulaData,
  overrides: FormulaLanguageOverride,
): FormulaData {
  const result: FormulaData = { ...base };

  // Group overrides by category for efficient merging
  const overridesByCategory = new Map<
    string,
    Record<string, Partial<Formula>>
  >();

  for (const [formulaId, formulaOverride] of Object.entries(overrides)) {
    if (formulaId === "_meta") continue;

    // Find which category this formula ID belongs to
    for (const [categoryKey, categoryData] of Object.entries(base)) {
      if (categoryKey === "_meta") continue;

      const categoryRecord = categoryData as Record<string, Formula>;
      if (categoryRecord[formulaId]) {
        if (!overridesByCategory.has(categoryKey)) {
          overridesByCategory.set(categoryKey, {});
        }
        overridesByCategory.get(categoryKey)![formulaId] =
          formulaOverride as Partial<Formula>;
        break;
      }
    }
  }

  // Merge overrides into their respective categories
  for (const [categoryKey, categoryOverrides] of overridesByCategory) {
    const baseCategory = base[categoryKey] as Record<string, Formula>;
    result[categoryKey] = mergeCategory(baseCategory, categoryOverrides);
  }

  return result;
}

function mergeCategory(
  baseCategory: Record<string, Formula>,
  categoryOverride: Record<string, Partial<Formula>>,
): Record<string, Formula> {
  const result: Record<string, Formula> = { ...baseCategory };

  for (const [formulaKey, formulaOverride] of Object.entries(
    categoryOverride,
  )) {
    const baseFormula = baseCategory[formulaKey];
    if (!baseFormula) continue;

    result[formulaKey] = mergeFormula(baseFormula, formulaOverride);
  }

  return result;
}

function mergeFormula(base: Formula, override: Partial<Formula>): Formula {
  const result: Formula = { ...base };

  // Merge name
  if (override.name) {
    result.name = override.name;
  }

  // Handle HTML formulas
  if (isHtmlFormula(base) && "type" in override && override.type === "html") {
    return {
      ...base,
      ...override,
      ref: override.ref ? { ...base.ref, ...override.ref } : base.ref,
    } as HtmlFormula;
  }

  // Handle calculation formulas
  if (isCalculationFormula(base) && "input" in override) {
    const baseCalc = base;
    const overrideCalc = override as Partial<CalculationFormula>;
    const resultCalc: CalculationFormula = { ...baseCalc };

    // Merge name (important: resultCalc is a new object, so we need to explicitly set the name)
    if (override.name) {
      resultCalc.name = override.name;
    }

    // Merge input definitions
    if (overrideCalc.input) {
      resultCalc.input = { ...baseCalc.input };
      for (const [inputKey, inputOverride] of Object.entries(
        overrideCalc.input,
      )) {
        if (baseCalc.input[inputKey]) {
          resultCalc.input[inputKey] = {
            ...baseCalc.input[inputKey],
            ...inputOverride,
          };
        }
      }
    }

    // Merge output definitions
    if (overrideCalc.output) {
      resultCalc.output = { ...baseCalc.output };
      for (const [outputKey, outputOverride] of Object.entries(
        overrideCalc.output,
      )) {
        if (baseCalc.output[outputKey]) {
          resultCalc.output[outputKey] = {
            ...baseCalc.output[outputKey],
            ...outputOverride,
          };
        }
      }
    }

    // Merge tests
    if (overrideCalc.test) {
      resultCalc.test = overrideCalc.test;
    }

    // Merge refs
    if (overrideCalc.ref && baseCalc.ref) {
      resultCalc.ref = { ...baseCalc.ref, ...overrideCalc.ref };
    } else if (overrideCalc.ref) {
      resultCalc.ref = overrideCalc.ref;
    }

    return resultCalc;
  }

  return result;
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
 * Type-safe, validated formula data (defaults to English).
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
 * Get a formula by ID (searches across all categories) with locale support.
 *
 * @param id - The formula ID (e.g., "bmi_adult")
 * @param locale - The locale code (e.g., "en", "ja"), defaults to "en"
 * @returns The formula definition, or undefined if not found
 */
export function getFormula(id: string, locale?: string): Formula | undefined {
  const effectiveLocale = locale || "en";
  const data = getLocalizedFormulaData(effectiveLocale);

  for (const category of Object.keys(data)) {
    if (category === "_meta") continue;
    const categoryData = data[category] as Record<string, Formula> | undefined;
    if (categoryData?.[id]) {
      return categoryData[id];
    }
  }
  return undefined;
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
 * Calculate Z-score.
 */
export function GetZScore(value: number, average: number, sd: number): number {
  return (value - average) / sd;
}

/**
 * Calculate Z-score with formatted string.
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
 * Error function (erf) approximation using Taylor expansion.
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

function factorialHelper(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Get Z-score from LMS parameters.
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
 */
export function GetPercentileFromZScore(sd: number): number {
  const area = erf(sd / 1.41421356) / 2;
  return 50 + area * 100;
}

/**
 * Get value from Z-score using LMS parameters.
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
  return args.join('');
}

// Register custom functions
parser.functions.iif = iif;
parser.functions.if = iif; // Alias for compatibility
parser.functions.BSA_DuBois = BSA_DuBois;
parser.functions.min = Math.min;
parser.functions.max = Math.max;
parser.functions.sqrt = Math.sqrt;
parser.functions.log = Math.log;
parser.functions.pow = Math.pow;
parser.functions.exp = Math.exp;
parser.functions.floor = Math.floor;
parser.functions.GetZScore = GetZScore;
parser.functions.GetZScoreStr = GetZScoreStr;
parser.functions.erf = erf;
parser.functions.GetZScoreFromLMS = GetZScoreFromLMS;
parser.functions.GetPercentileFromZScore = GetPercentileFromZScore;
parser.functions.GetValueFromZScore = GetValueFromZScore;
parser.functions.dateparse = dateparse;
parser.functions.concat = concat;

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
  const maxIterations = 10; // Prevent infinite loops

  // Only calculation formulas have output
  if (!isCalculationFormula(formula)) {
    return results;
  }

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
 *
 * @param locale - The locale code (e.g., "en", "ja"), defaults to "en"
 * @returns Array of category menu items with nested formula items
 *
 * @example
 * ```ts
 * import { getMenuItems } from '@/lib/formula';
 *
 * const menuItems = getMenuItems('en');
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
export function getMenuItems(locale?: string): CategoryMenuItem[] {
  const effectiveLocale = locale || "en";
  const data = getLocalizedFormulaData(effectiveLocale);
  const items: CategoryMenuItem[] = [];

  for (const [category, categoryData] of Object.entries(data)) {
    if (category === "_meta") continue;

    const formulas: MenuItem[] = [];
    const categoryDataRecord = categoryData as Record<string, Formula>;
    for (const [formulaId, formula] of Object.entries(categoryDataRecord)) {
      formulas.push({
        label: formula.name ?? formulaId,
        path: `/formula/${formulaId}`,
      });
    }

    items.push({
      label: category,
      path: `/category/${encodeURIComponent(category)}`,
      items: formulas,
    });
  }

  return items;
}
