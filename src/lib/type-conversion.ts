import type { FormulaInput, FormulaInputType, FormulaSelectOption } from "@/types/formula";

/**
 * Convert a form value to a formula input value based on the input type.
 * Used when submitting form data for formula evaluation.
 *
 * @param type - The input type (onoff, sex, select, date, float, int, string)
 * @param value - The form value to convert
 * @returns The converted value for formula evaluation
 *
 * @example
 * ```ts
 * convertFormValueToInputValue("onoff", true) // Returns 1
 * convertFormValueToInputValue("sex", "female") // Returns 0
 * convertFormValueToInputValue("select", 2, options) // Returns option value
 * convertFormValueToInputValue("date", "2024-01-01") // Returns timestamp
 * ```
 */
export function convertFormValueToInputValue(
  type: FormulaInputType,
  value: unknown,
  options?: FormulaSelectOption[],
): unknown {
  switch (type) {
    case "onoff":
    case "sex":
      // Convert boolean/string to number (1/0)
      return value === true || value === "true" ? 1 : 0;

    case "select": {
      // Select uses index as value, map back to original option value
      const selectedIndex = Number(value);
      const selectedOption = options?.[selectedIndex];
      return selectedOption?.value ?? 0;
    }

    case "date":
      // Convert date string to seconds since epoch
      if (value instanceof Date) {
        return Math.floor(value.getTime() / 1000);
      } else if (typeof value === "string" && value) {
        const parsed = Date.parse(value);
        // Validate date parsing - Date.parse() returns NaN for invalid dates
        if (!Number.isNaN(parsed)) {
          return Math.floor(parsed / 1000);
        }
      }
      return null;

    default:
      // float, int, string - convert to number if possible
      return Number(value);
  }
}

/**
 * Convert a formula input value to a human-readable display string.
 * Used for displaying results in QR codes, copy-to-clipboard, etc.
 *
 * @param type - The input type (onoff, sex, select, date, float, int, string)
 * @param value - The formula value to convert
 * @param options - The select options (required for type "select")
 * @param getOptionLabel - Optional function to translate option labels
 * @returns The human-readable display string
 *
 * @example
 * ```ts
 * convertInputValueToDisplay("onoff", 1) // Returns "Yes"
 * convertInputValueToDisplay("sex", 0) // Returns "Female"
 * convertInputValueToDisplay("select", 1, options, getLabel) // Returns option label
 * convertInputValueToDisplay("float", 24.2) // Returns 24.2
 * ```
 */
export function convertInputValueToDisplay(
  type: FormulaInputType,
  value: unknown,
  options?: FormulaSelectOption[],
  getOptionLabel?: (label: string) => string,
): string | number {
  switch (type) {
    case "onoff":
      // Display as Yes/No instead of 1/0
      // Treat 1 as Yes, all other values (0, null, undefined) as No
      return value === 1 ? "Yes" : "No";

    case "sex":
      // Display as Male/Female instead of 1/0
      // Treat 1 as Male, all other values (0, null, undefined) as Female
      return value === 1 ? "Male" : "Female";

    case "select": {
      // Display the option label instead of the value
      const selectedOption = options?.find((opt) => opt.value === value);
      if (selectedOption) {
        return getOptionLabel
          ? getOptionLabel(selectedOption.label)
          : selectedOption.label;
      }
      // If no matching option found, return the value as string
      return String(value ?? "");
    }

    default:
      // For other types (float, int, string, date), keep the original value
      return value as string | number;
  }
}

/**
 * Convert a query parameter string value to the appropriate form value type.
 * Used when parsing URL query parameters to pre-fill the form.
 *
 * @param type - The input type (onoff, sex, select, date, float, int, string)
 * @param paramValue - The query parameter string value
 * @param options - The select options (required for type "select")
 * @returns The converted form value
 *
 * @example
 * ```ts
 * convertQueryParamToFormValue("onoff", "true") // Returns true
 * convertQueryParamToFormValue("sex", "1") // Returns true (Male)
 * convertQueryParamToFormValue("select", "0", options) // Returns 0 (first option)
 * convertQueryParamToFormValue("float", "24.2") // Returns 24.2
 * ```
 */
export function convertQueryParamToFormValue(
  type: FormulaInputType,
  paramValue: string,
  options?: FormulaSelectOption[],
): boolean | number | string {
  switch (type) {
    case "onoff":
    case "sex":
      return paramValue === "true";

    case "select": {
      // Find the option index by value or label
      const optionIndex = options?.findIndex(
        (opt) => opt.value === Number(paramValue) || opt.label === paramValue,
      );
      return optionIndex && optionIndex >= 0 ? optionIndex : 0;
    }

    case "date":
      return paramValue;

    default:
      // float, int, string - return as is (will be converted by form)
      return paramValue;
  }
}

/**
 * Get the default value for a given input type.
 * Used when initializing form fields.
 *
 * @param type - The input type
 * @returns The default value for the input type
 *
 * @example
 * ```ts
 * getDefaultValueForInputType("onoff") // Returns false
 * getDefaultValueForInputType("sex") // Returns false
 * getDefaultValueForInputType("select") // Returns 0
 * getDefaultValueForInputType("date") // Returns ""
 * getDefaultValueForInputType("float") // Returns null
 * ```
 */
export function getDefaultValueForInputType(
  type: FormulaInputType,
): boolean | number | string | null {
  switch (type) {
    case "heading":
    case "info":
      return ""; // Headings and info fields don't have form values
    case "onoff":
    case "sex":
      return false; // default to off/female
    case "select":
      return 0; // Default to first option index (0)
    case "date":
      return "";
    case "int":
    case "float":
      return null; // No default for numeric inputs
    case "string":
      return "";
  }
}
