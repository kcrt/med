import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Schema for validating the incoming request body.
 * Validates that the request contains a formula string and parameters object
 * with numeric 'a' and 'b' values.
 */
const CalculateRequestSchema = z.object({
  formula: z.string(),
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
});

/**
 * Performs the calculation based on the specified formula.
 *
 * @param formula - The formula name (add, subtract, multiply, divide)
 * @param a - First operand
 * @param b - Second operand
 * @returns The calculation result
 * @throws {Error} If the formula is not supported
 */
function calculate(formula: string, a: number, b: number): number {
  switch (formula) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      if (b === 0) {
        throw new Error("Division by zero");
      }
      return a / b;
    default:
      throw new Error("Formula not supported");
  }
}

/**
 * POST /api/calculate
 *
 * Endpoint for performing formula-based calculations.
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
 * - Unsupported formula: `{ "error": "Formula not supported" }`
 * - Division by zero: `{ "error": "Division by zero" }`
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

    const { formula, parameters } = validation.data;

    // Perform calculation
    try {
      const result = calculate(formula, parameters.a, parameters.b);
      return NextResponse.json({ result });
    } catch (error) {
      // Handle calculation errors (division by zero, unsupported formula)
      const message =
        error instanceof Error ? error.message : "Calculation error";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch {
    // Handle JSON parsing errors
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
