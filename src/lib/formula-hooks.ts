"use client";

import { getFormula, getFormulaData, shouldDisplayForLocale } from "./formula";
import { useTranslatedMenuItems } from "./formula-translation";
import type { Formula, FormulaOutput } from "@/types/formula";
import { useLocale } from "next-intl";

/**
 * Client-side hook to get a formula by ID.
 * Returns English base data. Use translation hooks from formula-translation.ts
 * for localized labels.
 *
 * @param id - The formula ID (e.g., "bmi_adult")
 * @returns The formula definition, or undefined if not found
 *
 * @example
 * ```tsx
 * function FormulaComponent() {
 *   const formula = useFormula("bmi_adult");
 *   const name = useFormulaName("bmi_adult", formula);
 *   return <div>{name}</div>;
 * }
 * ```
 */
export function useFormula(id: string): Formula | undefined {
  return getFormula(id);
}

/**
 * Client-side hook to get menu items with translated labels.
 *
 * @returns Array of category menu items with translated formula names
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   const menuItems = useMenuItems();
 *   return <nav>{menuItems.map(...)}</nav>;
 * }
 * ```
 */
export function useMenuItems() {
  return useTranslatedMenuItems();
}

/**
 * Client-side hook to get formula data.
 * Returns English base data. Use translation hooks for localized labels.
 *
 * @returns Formula data
 *
 * @example
 * ```tsx
 * function FormulaDataComponent() {
 *   const data = useFormulaData();
 *   return <div>{Object.keys(data).length} categories</div>;
 * }
 * ```
 */
export function useFormulaData() {
  return getFormulaData();
}

/**
 * Client-side hook to check if an output should be displayed for the current locale.
 *
 * @param output - The output definition (FormulaOutput)
 * @returns True if the output should be displayed for the current locale, false otherwise
 *
 * @example
 * ```tsx
 * function OutputComponent({ output }) {
 *   const shouldDisplay = useShouldDisplayForLocale(output);
 *   if (!shouldDisplay) return null;
 *   return <div>{output.label}</div>;
 * }
 * ```
 */
export function useShouldDisplayForLocale(output: FormulaOutput): boolean {
  const locale = useLocale();
  return shouldDisplayForLocale(output, locale);
}
