import { z } from 'zod';

/**
 * Schema for formula input field definitions
 */
export const FormulaInputSchema = z.object({
  label: z.string(),
  type: z.enum(['float', 'int', 'string']),
  min: z.number().optional(),
  max: z.number().optional(),
});

export type FormulaInput = z.infer<typeof FormulaInputSchema>;

/**
 * Schema for formula output field definitions
 */
export const FormulaOutputSchema = z.object({
  label: z.string(),
  formula: z.string().optional(),
  unit: z.string().optional(),
  precision: z.number().optional(),
  text: z.string().optional(),
  locales_in: z.array(z.string()).optional(),      // Only show in these locales
  locales_not_in: z.array(z.string()).optional(),  // Hide in these locales
});

export type FormulaOutput = z.infer<typeof FormulaOutputSchema>;

/**
 * Schema for output values (either a full output or just text)
 */
const FormulaOutputValueSchema = z.union([
  FormulaOutputSchema,
  z.object({ text: z.string() }),
]);

/**
 * Schema for test cases
 */
export const FormulaTestCaseSchema = z.object({
  input: z.record(z.string(), z.union([z.number(), z.string()])),
  output: z.record(z.string(), z.union([z.number(), z.string()])),
});

export type FormulaTestCase = z.infer<typeof FormulaTestCaseSchema>;

/**
 * Schema for individual formula definitions
 */
export const FormulaSchema = z.object({
  name: z.string().optional(),
  input: z.record(z.string(), FormulaInputSchema),
  output: z.record(z.string(), FormulaOutputValueSchema),
  test: z.array(FormulaTestCaseSchema).optional(),
  ref: z.record(z.string(), z.string()).optional(),
});

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
      if (key === '_meta') continue;
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
  type: z.enum(['float', 'int', 'string']).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
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
 * Schema for partial formula (for language overrides)
 * All fields are optional
 */
const PartialFormulaSchema = z.object({
  name: z.string().optional(),
  input: z.record(z.string(), PartialFormulaInputSchema).optional(),
  output: z.record(z.string(), PartialFormulaOutputSchema).optional(),
  test: z.array(FormulaTestCaseSchema).optional(),
  ref: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for language override file
 * Matches base structure but all fields are optional partial overrides
 */
export const FormulaLanguageOverrideSchema = z
  .object({
    _meta: FormulaLanguageMetaSchema,
  })
  .loose()
  .superRefine((data, ctx) => {
    for (const [key, value] of Object.entries(data)) {
      if (key === '_meta') continue;
      const categoryResult = z.record(z.string(), PartialFormulaSchema).safeParse(value);

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

export type FormulaLanguageOverride = z.infer<typeof FormulaLanguageOverrideSchema>;
