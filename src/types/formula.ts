import { z } from "zod";

/**
 * Schema for select option
 */
export const FormulaSelectOptionSchema = z.object({
  value: z.union([z.number(), z.string()]),
  label: z.string(),
});

/**
 * Schema for formula input field definitions
 */
export const FormulaInputSchema = z.object({
  label: z.string(),
  type: z.enum(["float", "int", "string", "onoff", "sex", "date", "select"]),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  default: z.union([z.number(), z.string()]).optional(),
  options: z.array(FormulaSelectOptionSchema).optional(),
  locales_in: z.array(z.string()).optional(), // Only show in these locales
  locales_not_in: z.array(z.string()).optional(), // Hide in these locales
});

export type FormulaInput = z.infer<typeof FormulaInputSchema>;
export type FormulaInputType = FormulaInput["type"];
export type FormulaSelectOption = z.infer<typeof FormulaSelectOptionSchema>;

/**
 * Schema for formula assertion (cross-field validation)
 */
export const FormulaAssertionSchema = z.object({
  condition: z.string(),
  message: z.string(),
});

export type FormulaAssertion = z.infer<typeof FormulaAssertionSchema>;

/**
 * Schema for formula output field definitions
 * All outputs must have a label. Text outputs use the `text` field.
 */
export const FormulaOutputSchema = z.object({
  label: z.string(),
  formula: z.string().optional(),
  unit: z.string().optional(),
  precision: z.number().optional(),
  text: z.string().optional(),
  locales_in: z.array(z.string()).optional(), // Only show in these locales
  locales_not_in: z.array(z.string()).optional(), // Hide in these locales
});

export type FormulaOutput = z.infer<typeof FormulaOutputSchema>;

/**
 * Schema for test cases
 */
export const FormulaTestCaseSchema = z.object({
  input: z.record(z.string(), z.union([z.number(), z.string()])),
  output: z.record(z.string(), z.union([z.number(), z.string()])),
});

export type FormulaTestCase = z.infer<typeof FormulaTestCaseSchema>;

/**
 * Schema for HTML-only formula (reference chart, no calculation)
 */
const HtmlFormulaSchema = z.object({
  name: z.string().optional(),
  type: z.literal("html"),
  html: z.string(),
  info: z.string().optional(),
  ref: z.record(z.string(), z.string()).optional(),
  locales_in: z.array(z.string()).optional(), // Only show formula in these locales
  locales_not_in: z.array(z.string()).optional(), // Hide formula in these locales
});

/**
 * Schema for calculation formula
 */
const CalculationFormulaSchema = z.object({
  name: z.string().optional(),
  info: z.string().optional(),
  input: z.record(z.string(), FormulaInputSchema),
  output: z.record(z.string(), FormulaOutputSchema),
  assert: z.array(FormulaAssertionSchema).optional(),
  test: z.array(FormulaTestCaseSchema).optional(),
  ref: z.record(z.string(), z.string()).optional(),
  locales_in: z.array(z.string()).optional(), // Only show formula in these locales
  locales_not_in: z.array(z.string()).optional(), // Hide formula in these locales
});

/**
 * Schema for individual formula definitions
 * Either a calculation formula (with input/output) or HTML formula
 */
export const FormulaSchema = z.union([
  CalculationFormulaSchema,
  HtmlFormulaSchema,
]);

export type Formula = z.infer<typeof FormulaSchema>;

/**
 * Schema for metadata section
 */
export const FormulaMetaSchema = z.object({
  version: z.string(),
  lastModified: z.string(),
  description: z.string(),
});

export type FormulaMeta = z.infer<typeof FormulaMetaSchema>;

/**
 * Schema for a category (contains formulas)
 */
export const FormulaCategorySchema = z.record(z.string(), FormulaSchema);

export type FormulaCategory = z.infer<typeof FormulaCategorySchema>;

/**
 * Schema for the entire formula data structure
 */
export const FormulaDataSchema = z
  .object({
    _meta: FormulaMetaSchema,
  })
  .loose()
  .superRefine((data, ctx) => {
    // Validate all other keys as categories
    for (const [key, value] of Object.entries(data)) {
      if (key === "_meta") continue;
      const categoryResult = FormulaCategorySchema.safeParse(value);
      if (!categoryResult.success) {
        categoryResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: [key, ...(issue.path ?? [])],
          });
        });
      }
    }
  });

export type FormulaData = z.infer<typeof FormulaDataSchema>;

/**
 * Schema for language override file metadata
 */
export const FormulaLanguageMetaSchema = z.object({
  language: z.string(),
  version: z.string(),
  lastModified: z.string().optional(),
});

export type FormulaLanguageMeta = z.infer<typeof FormulaLanguageMetaSchema>;

/**
 * Schema for partial formula input (for language overrides)
 * All fields are optional
 */
const PartialFormulaInputSchema = z.object({
  label: z.string().optional(),
  type: z
    .enum(["float", "int", "string", "onoff", "sex", "date", "select"])
    .optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  default: z.union([z.number(), z.string()]).optional(),
  options: z.array(FormulaSelectOptionSchema).optional(),
  locales_in: z.array(z.string()).optional(),
  locales_not_in: z.array(z.string()).optional(),
});

/**
 * Schema for partial formula output (for language overrides)
 * All fields are optional
 */
const PartialFormulaOutputSchema = z.object({
  label: z.string().optional(),
  formula: z.string().optional(),
  unit: z.string().optional(),
  precision: z.number().optional(),
  text: z.string().optional(),
  locales_in: z.array(z.string()).optional(),
  locales_not_in: z.array(z.string()).optional(),
});

/**
 * Schema for partial HTML formula (for language overrides)
 */
const PartialHtmlFormulaSchema = z.object({
  name: z.string().optional(),
  type: z.literal("html").optional(),
  html: z.string().optional(),
  info: z.string().optional(),
  ref: z.record(z.string(), z.string()).optional(),
  locales_in: z.array(z.string()).optional(),
  locales_not_in: z.array(z.string()).optional(),
});

/**
 * Schema for partial calculation formula (for language overrides)
 * All fields are optional
 */
const PartialCalculationFormulaSchema = z.object({
  name: z.string().optional(),
  info: z.string().optional(),
  input: z.record(z.string(), PartialFormulaInputSchema).optional(),
  output: z.record(z.string(), PartialFormulaOutputSchema).optional(),
  assert: z.array(FormulaAssertionSchema).optional(),
  test: z.array(FormulaTestCaseSchema).optional(),
  ref: z.record(z.string(), z.string()).optional(),
  locales_in: z.array(z.string()).optional(),
  locales_not_in: z.array(z.string()).optional(),
});

/**
 * Schema for partial formula (for language overrides)
 * All fields are optional, supports both calculation and HTML formulas
 */
const PartialFormulaSchema = z.union([
  PartialCalculationFormulaSchema,
  PartialHtmlFormulaSchema,
]);

/**
 * Schema for language override file
 * Flat structure with formula IDs as top-level keys
 */
export const FormulaLanguageOverrideSchema = z
  .object({
    _meta: FormulaLanguageMetaSchema,
  })
  .loose()
  .superRefine((data, ctx) => {
    for (const [key, value] of Object.entries(data)) {
      if (key === "_meta") continue;
      const formulaResult = PartialFormulaSchema.safeParse(value);

      if (!formulaResult.success) {
        formulaResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: [key, ...(issue.path ?? [])],
          });
        });
      }
    }
  });

export type FormulaLanguageOverride = z.infer<
  typeof FormulaLanguageOverrideSchema
>;
