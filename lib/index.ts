/**
 * Medicalculator Library
 * 
 * A comprehensive library for medical calculations.
 * This package exports core calculation functions, formula data, and types
 * that can be used in any JavaScript/TypeScript application.
 * 
 * @packageDocumentation
 */

// Core formula functions
export {
  getFormulaData,
  getFormula,
  evaluateFormula,
  evaluateFormulaOutputs,
  validateAssertions,
  formatOutput,
  isCalculationFormula,
  isHtmlFormula,
  hasFormulaProperty,
  shouldDisplayOutputForLocale,
  shouldDisplayInputForLocale,
  shouldDisplayFormula,
  getMenuItems,
  getAllFormulaIds,
  getAdjacentFormulas,
  getCategoryMap,
  iterateFormulas,
  formulaData,
} from "../src/lib/formula";

// Medical calculation utilities
export {
  iif,
  BSA_DuBois,
  GetZScore,
  GetZScoreStr,
  GetZScoreFromLMS,
  GetPercentileFromZScore,
  GetValueFromZScore,
  erf,
  dateparse,
  concat,
} from "../src/lib/formula";

// Export/formatting utilities
export {
  buildHumanReadableData,
} from "../src/lib/calculation-export";

// Types
export type {
  Formula,
  FormulaData,
  FormulaInput,
  FormulaOutput,
  FormulaInputType,
  FormulaSelectOption,
  FormulaAssertion,
  FormulaTestCase,
  FormulaMetadata,
  FormulaMeta,
  FormulaCategory,
  FormulaLanguageOverride,
  FormulaLanguageMeta,
} from "../src/types/formula";

export type {
  CalculationFormula,
  HtmlFormula,
  FormulaInputValues,
  FormulaOutputValues,
  MenuItem,
  CategoryMenuItem,
} from "../src/lib/formula";
