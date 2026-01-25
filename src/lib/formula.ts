import { FormulaDataSchema, FormulaLanguageOverrideSchema, type FormulaData, type Formula, type FormulaOutput, type FormulaLanguageOverride } from '@/types/formula';
import formulaJson from '@/formula.json';
import { Parser } from 'expr-eval';

// Import language override files
import formulaLanguageJa from '@/formula_language_ja.json';

// Cache for locale-specific formula data
const localeDataCache = new Map<string, FormulaData>();

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

  if (locale === 'ja') {
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
 * @param output - The output definition (FormulaOutput or text-only output)
 * @param locale - The locale code (e.g., "en", "ja")
 * @returns True if the output should be displayed, false otherwise
 */
export function shouldDisplayForLocale(
  output: FormulaOutput | { text: string; label?: string },
  locale: string
): boolean {
  // locales_in: only show if locale is in the list
  if ('locales_in' in output && output.locales_in && output.locales_in.length > 0) {
    return output.locales_in.includes(locale);
  }

  // locales_not_in: hide if locale is in the list
  if ('locales_not_in' in output && output.locales_not_in && output.locales_not_in.length > 0) {
    return !output.locales_not_in.includes(locale);
  }

  // No locale restrictions: show for all
  return true;
}

/**
 * Deep merge formula base with language overrides.
 *
 * @param base - The base formula data
 * @param overrides - The language override data
 * @returns Merged formula data
 */
function mergeFormulaData(
  base: FormulaData,
  overrides: FormulaLanguageOverride
): FormulaData {
  const result: FormulaData = { ...base };

  for (const [categoryKey, categoryOverride] of Object.entries(overrides)) {
    if (categoryKey === '_meta') continue;

    const baseCategory = base[categoryKey];
    if (!baseCategory) continue;

    result[categoryKey] = mergeCategory(
      baseCategory as Record<string, Formula>,
      categoryOverride as Record<string, Partial<Formula>>
    );
  }

  return result;
}

function mergeCategory(
  baseCategory: Record<string, Formula>,
  categoryOverride: Record<string, Partial<Formula>>
): Record<string, Formula> {
  const result: Record<string, Formula> = { ...baseCategory };

  for (const [formulaKey, formulaOverride] of Object.entries(categoryOverride)) {
    const baseFormula = baseCategory[formulaKey];
    if (!baseFormula) continue;

    result[formulaKey] = mergeFormula(baseFormula, formulaOverride);
  }

  return result;
}

function mergeFormula(
  base: Formula,
  override: Partial<Formula>
): Formula {
  const result: Formula = { ...base };

  // Merge name
  if (override.name) {
    result.name = override.name;
  }

  // Merge input definitions
  if (override.input) {
    result.input = { ...base.input };
    for (const [inputKey, inputOverride] of Object.entries(override.input)) {
      if (base.input[inputKey]) {
        result.input[inputKey] = {
          ...base.input[inputKey],
          ...inputOverride
        };
      }
    }
  }

  // Merge output definitions
  if (override.output) {
    result.output = { ...base.output };
    for (const [outputKey, outputOverride] of Object.entries(override.output)) {
      if (base.output[outputKey]) {
        result.output[outputKey] = {
          ...base.output[outputKey],
          ...outputOverride
        };
      }
    }
  }

  // Merge refs and tests
  if (override.ref) {
    result.ref = { ...base.ref, ...override.ref };
  }
  if (override.test) {
    result.test = override.test;
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
 * const bmiFormula = formulaData['体格指数']['bmi_adult'];
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
    if (category === '_meta') continue;
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

// Register custom functions
parser.functions.iif = iif;
parser.functions.if = iif; // Alias for compatibility
parser.functions.BSA_DuBois = BSA_DuBois;
parser.functions.min = Math.min;
parser.functions.max = Math.max;

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
export function formatOutput(value: number | string, precision?: number): number | string {
  if (typeof value === 'number' && precision !== undefined) {
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
 * const bmiFormula = formulaData['体格指数']['bmi_adult'];
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

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let progress = false;

    for (const [outputKey, outputDef] of Object.entries(formula.output)) {
      // Skip if already calculated
      if (outputKey in results) continue;

      if ('formula' in outputDef && outputDef.formula) {
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
): Record<string, Extract<typeof formula.output[string], { label: string }>> {
  const outputs: Record<
    string,
    Extract<typeof formula.output[string], { label: string }>
  > = {};

  for (const [key, value] of Object.entries(formula.output)) {
    if ('label' in value) {
      outputs[key] = value as Extract<typeof value, { label: string }>;
    }
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
 * //     label: "体格指数",
 * //     path: "/category/体格指数",
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
    if (category === '_meta') continue;

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
