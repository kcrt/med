import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  evaluateFormulaOutputs,
  getFormula,
  isCalculationFormula,
  validateAssertions,
} from "@/lib/formula";

/**
 * Schema for validating the incoming request body.
 * Validates that the request contains a formula string and parameters object.
 */
const CalculateRequestSchema = z.object({
  formula: z.string(),
  parameters: z.record(z.string(), z.union([z.number(), z.string()])),
});

/**
 * POST /api/calculate
 *
 * Endpoint for performing formula-based calculations using the formula system.
 *
 * Request body format:
 * ```json
 * {
 *   "formula": "add",
 *   "parameters": {
 *     "a": 5,
 *     "b": 3
 *   }
 * }
 * ```
 *
 * Success response:
 * ```json
 * {
 *   "result": 8
 * }
 * ```
 *
 * Error responses:
 * - Invalid input: `{ "error": "Invalid input" }`
 * - Formula not found: `{ "error": "Formula not supported" }`
 * - Assertion errors: `{ "error": "Division by zero" }` (or other assertion message)
 *
 * @param request - The incoming request object
 * @returns JSON response with either result or error
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

    const { formula: formulaId, parameters } = validation.data;

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

    // Validate that all required input parameters are provided and have correct types
    const requiredInputs = Object.keys(formula.input);
    const _providedInputs = Object.keys(parameters);
    const missingInputs = requiredInputs.filter(
      (input) => !(input in parameters),
    );

    if (missingInputs.length > 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Validate input types
    for (const [key, inputDef] of Object.entries(formula.input)) {
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

      // Return the first output value (typically "result")
      const outputKeys = Object.keys(outputs);
      if (outputKeys.length === 0) {
        return NextResponse.json(
          { error: "No output calculated" },
          { status: 400 },
        );
      }

      const resultKey = outputKeys[0];
      const result = outputs[resultKey];

      return NextResponse.json({ result });
    } catch (_error) {
      // Handle evaluation errors
      return NextResponse.json({ error: "Calculation error" }, { status: 400 });
    }
  } catch {
    // Handle JSON parsing errors
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
