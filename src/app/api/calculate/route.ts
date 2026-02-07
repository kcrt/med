import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  evaluateFormulaOutputs,
  getFormula,
  isCalculationFormula,
  shouldDisplayForLocale,
  validateAssertions,
} from "@/lib/formula";
import { DEFAULT_LOCALE, isValidLocale } from "@/lib/locale";
import { deepMerge, escapeTranslationKey } from "@/lib/translation-utils";
import { sharedMessages } from "@/messages/shared";

/**
 * Load messages for a given locale.
 */
async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  if (!isValidLocale(locale)) {
    locale = DEFAULT_LOCALE;
  }

  try {
    const localeMessages = (await import(`@/messages/${locale}.json`)).default;
    return deepMerge(sharedMessages, localeMessages);
  } catch {
    return sharedMessages;
  }
}

/**
 * Get translated label from messages.
 */
function getTranslatedLabel(
  messages: Record<string, unknown>,
  englishLabel: string,
): string {
  const labels = messages.labels as Record<string, unknown> | undefined;
  if (!labels) {
    return englishLabel;
  }

  const escapedKey = escapeTranslationKey(englishLabel);
  const translated = labels[escapedKey];
  return typeof translated === "string" ? translated : englishLabel;
}

/**
 * Schema for validating the incoming request body.
 * Validates that the request contains a formula string and parameters object.
 * Optionally accepts a locale parameter for locale-specific outputs.
 */
const CalculateRequestSchema = z.object({
  formula: z.string(),
  parameters: z.record(z.string(), z.union([z.number(), z.string()])),
  locale: z.string().optional(),
});

/**
 * POST /api/calculate
 *
 * Endpoint for performing formula-based calculations using the formula system.
 *
 * Request body format:
 * ```json
 * {
 *   "formula": "bmi_adult",
 *   "parameters": {
 *     "height": 170,
 *     "weight": 70
 *   },
 *   "locale": "en"  // Optional: filters locale-specific outputs (e.g., "en", "ja")
 * }
 * ```
 *
 * Success response:
 * ```json
 * {
 *   "BMI": 24.2,
 *   "who_diag": "normal"
 * }
 * ```
 *
 * Error responses:
 * - Invalid input: `{ "error": "Invalid input" }`
 * - Formula not found: `{ "error": "Formula not supported" }`
 * - Assertion errors: `{ "error": "<assertion message>" }`
 *
 * @param request - The incoming request object
 * @returns JSON response with either calculation results or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body against schema
    const validation = CalculateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { formula: formulaId, parameters, locale } = validation.data;

    // Get formula definition from the formula system
    const formula = getFormula(formulaId);

    if (!formula) {
      return NextResponse.json(
        { error: "Formula not supported" },
        { status: 400 },
      );
    }

    // Check if it's a calculation formula
    if (!isCalculationFormula(formula)) {
      return NextResponse.json(
        { error: "Formula not supported" },
        { status: 400 },
      );
    }

    // Get the locale to use for filtering (default to DEFAULT_LOCALE)
    const useLocale = locale || DEFAULT_LOCALE;

    // Filter inputs based on locale
    const visibleInputs = Object.entries(formula.input).filter(
      ([_, inputDef]) => shouldDisplayForLocale(inputDef, useLocale),
    );
    const visibleInputKeys = visibleInputs.map(([key]) => key);

    // Validate that all required visible input parameters are provided
    const missingInputs = visibleInputKeys.filter(
      (input) => !(input in parameters),
    );

    if (missingInputs.length > 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Validate input types for visible inputs only
    for (const [key, inputDef] of visibleInputs) {
      const value = parameters[key];
      const expectedType = inputDef.type;

      // Check if the type matches
      if (expectedType === "float" || expectedType === "int") {
        if (typeof value !== "number") {
          return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }
      } else if (expectedType === "string") {
        if (typeof value !== "string") {
          return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }
      }
    }

    // Validate assertions if they exist
    if (formula.assert) {
      const assertionErrors = validateAssertions(formula.assert, parameters);
      if (assertionErrors.length > 0) {
        return NextResponse.json(
          { error: assertionErrors[0] },
          { status: 400 },
        );
      }
    }

    // Evaluate the formula
    try {
      const outputs = evaluateFormulaOutputs(formula, parameters);

      // Load messages for translation if locale is provided and not English
      const shouldTranslate = useLocale !== DEFAULT_LOCALE;
      const messages = shouldTranslate ? await loadMessages(useLocale) : {};

      // Filter outputs based on locale if provided
      let filteredOutputs = outputs;
      if (locale && isCalculationFormula(formula)) {
        filteredOutputs = {};
        for (const [key, value] of Object.entries(outputs)) {
          const outputDef = formula.output[key];
          if (outputDef && shouldDisplayForLocale(outputDef, useLocale)) {
            filteredOutputs[key] = value;
          }
        }
      }

      // Return all output values
      if (Object.keys(filteredOutputs).length === 0) {
        return NextResponse.json(
          { error: "No output calculated" },
          { status: 400 },
        );
      }

      // Translate output keys to labels if locale is provided
      if (locale && shouldTranslate && isCalculationFormula(formula)) {
        const translatedOutputs: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(filteredOutputs)) {
          const outputDef = formula.output[key];
          if (outputDef) {
            const englishLabel = outputDef.label ?? key;
            const translatedLabel = getTranslatedLabel(messages, englishLabel);
            translatedOutputs[translatedLabel] = value;
          } else {
            translatedOutputs[key] = value;
          }
        }
        return NextResponse.json(translatedOutputs);
      }

      return NextResponse.json(filteredOutputs);
    } catch (_error) {
      // Handle evaluation errors
      return NextResponse.json({ error: "Calculation error" }, { status: 400 });
    }
  } catch {
    // Handle JSON parsing errors
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
