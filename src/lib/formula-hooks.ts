"use client";

import { useLocale } from "next-intl";
import type { Formula, FormulaData, FormulaOutput } from "@/types/formula";
import {
  type CategoryMenuItem,
  getFormula,
  getLocalizedFormulaData,
  getMenuItems,
  shouldDisplayForLocale,
} from "./formula";

/**
 * Client-side hook to get a formula by ID using the current locale from next-intl.
 *
 * @param id - The formula ID (e.g., "bmi_adult")
 * @returns The formula definition for the current locale, or undefined if not found
 *
 * @example
 * ```tsx
 * function FormulaComponent() {
 *   const formula = useFormula("bmi_adult");
 *   return <div>{formula?.name}</div>;
 * }
 * ```
 */
export function useFormula(id: string): Formula | undefined {
  const locale = useLocale();
  return getFormula(id, locale);
}

/**
 * Client-side hook to get menu items using the current locale from next-intl.
 *
 * @returns Array of category menu items with nested formula items for the current locale
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   const menuItems = useMenuItems();
 *   return <nav>{menuItems.map(...)}</nav>;
 * }
 * ```
 */
export function useMenuItems(): CategoryMenuItem[] {
  const locale = useLocale();
  return getMenuItems(locale);
}

/**
 * Client-side hook to get localized formula data using the current locale from next-intl.
 *
 * @returns Merged formula data for the current locale
 *
 * @example
 * ```tsx
 * function FormulaDataComponent() {
 *   const data = useLocalizedFormulaData();
 *   return <div>{Object.keys(data).length} categories</div>;
 * }
 * ```
 */
export function useLocalizedFormulaData(): FormulaData {
  const locale = useLocale();
  return getLocalizedFormulaData(locale);
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
