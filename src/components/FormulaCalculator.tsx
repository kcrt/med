"use client";

import { useForm } from "@mantine/form";
import {
  Stack,
  NumberInput,
  Card,
  Text,
  Group,
  Title,
  Alert,
  Box,
  Switch,
  Radio,
  Select,
  TextInput,
} from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import {
  type Formula,
  type FormulaOutput,
  type FormulaInput,
} from "@/types/formula";
import {
  evaluateFormulaOutputs,
  shouldDisplayForLocale,
  validateAssertions,
  type FormulaInputValues,
} from "@/lib/formula";
import { useState } from "react";

interface FormulaCalculatorProps {
  formula: Formula;
  formulaId: string;
}

interface FormValues {
  [key: string]: number | string | boolean | Date | null;
}

// Type guard to check if formula is a calculation formula (has input/output)
function isCalculationFormula(formula: Formula): formula is Formula & {
  input: Record<string, FormulaInput>;
  output: Record<string, FormulaOutput | { text: string }>;
  assert?: { condition: string; message: string }[];
} {
  return "input" in formula && "output" in formula;
}

// Type guard to check if output has formula
function hasFormula(
  output: FormulaOutput | { text: string },
): output is FormulaOutput & { formula: string } {
  return "formula" in output && typeof output.formula === "string";
}

// Type guard to check if output has text
function hasText(
  output: FormulaOutput | { text: string },
): output is { text: string; label?: string } {
  return "text" in output && typeof output.text === "string";
}

export function FormulaCalculator({
  formula,
  formulaId,
}: FormulaCalculatorProps) {
  // This component only handles calculation formulas (with input/output)
  if (!isCalculationFormula(formula)) {
    return null;
  }

  const locale = useLocale();
  const inputKeys = Object.keys(formula.input);
  const allOutputs = Object.entries(formula.output);

  // State for assertion errors - updates when form values change
  const [assertionErrors, setAssertionErrors] = useState<string[]>([]);

  const getInitialValue = (
    key: string,
  ): number | string | boolean | Date | null => {
    const inputDef = formula.input[key];
    if (inputDef?.default !== undefined) {
      // Handle "today" default for date inputs
      if (inputDef.type === "date" && inputDef.default === "today") {
        return new Date();
      }
      return inputDef.default;
    }
    // Type-based defaults
    switch (inputDef?.type) {
      case "onoff":
      case "sex":
        return false; // default to off/female
      case "select":
        // Default to first option index (0)
        return 0;
      case "date":
        return "";
      case "int":
      case "float":
        return ""; // Use empty string for number inputs
      default:
        return "";
    }
  };

  const getInputValues = (values: FormValues): FormulaInputValues => {
    const inputValues: FormulaInputValues = {};
    for (const [key, value] of Object.entries(values)) {
      const inputDef = formula.input[key];

      // Skip empty/unset values
      if (value === "" || value === null || value === undefined) {
        continue;
      }

      // Convert value based on input type
      switch (inputDef?.type) {
        case "onoff":
        case "sex":
          // Convert boolean/string to number (1/0)
          inputValues[key] = value === true || value === "true" ? 1 : 0;
          break;
        case "select":
          // Select uses index as value, map back to original option value
          const selectedIndex = Number(value);
          const selectedOption = inputDef.options?.[selectedIndex];
          inputValues[key] = selectedOption?.value ?? 0;
          break;
        case "date":
          // Convert date string to timestamp or keep as string
          if (value instanceof Date) {
            inputValues[key] = value.toISOString().split("T")[0];
          } else {
            inputValues[key] = String(value);
          }
          break;
        default:
          // float, int, string - convert to number if possible
          inputValues[key] = Number(value);
      }
    }
    return inputValues;
  };

  const form = useForm<FormValues>({
    initialValues: Object.fromEntries(
      inputKeys.map((key) => [key, getInitialValue(key)]),
    ) as FormValues,
    onValuesChange: (values) => {
      // Re-validate assertions when form values change
      const inputValues = getInputValues(values as FormValues);
      const errors = formula.assert
        ? validateAssertions(formula.assert, inputValues)
        : [];
      setAssertionErrors(errors);
    },
  });

  const currentInputValues = form.values
    ? getInputValues(form.values as FormValues)
    : {};

  const results =
    Object.keys(currentInputValues).length > 0
      ? evaluateFormulaOutputs(formula, currentInputValues)
      : {};

  const hasValidInputs = inputKeys.some((key) => {
    const value = form.values[key];
    // Consider non-empty strings, non-zero numbers, and booleans as valid
    if (typeof value === "boolean") return true;
    if (typeof value === "number") return value !== 0;
    return value !== "";
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group>
          <IconCalculator size={20} />
          <Title order={3}>計算</Title>
        </Group>

        <form>
          <Stack gap="sm">
            {inputKeys.map((key) => {
              const inputDef = formula.input[key]!;
              const inputProps = form.getInputProps(key);

              switch (inputDef.type) {
                case "onoff":
                  return (
                    <Switch key={key} label={inputDef.label} {...inputProps} />
                  );

                case "sex":
                  return (
                    <Radio.Group
                      key={key}
                      label={inputDef.label}
                      {...inputProps}
                    >
                      <Group>
                        <Radio value="true" label="Male" />
                        <Radio value="false" label="Female" />
                      </Group>
                    </Radio.Group>
                  );

                case "select":
                  return (
                    <Select
                      key={key}
                      label={inputDef.label}
                      data={
                        inputDef.options?.map((opt, idx) => ({
                          value: String(idx),
                          label: opt.label,
                        })) ?? []
                      }
                      {...inputProps}
                    />
                  );

                case "date":
                  return (
                    <TextInput
                      key={key}
                      type="date"
                      label={inputDef.label}
                      {...inputProps}
                    />
                  );

                case "int":
                case "float":
                default:
                  return (
                    <NumberInput
                      key={key}
                      label={inputDef.label}
                      placeholder={`Enter ${inputDef.label}`}
                      min={inputDef.min}
                      max={inputDef.max}
                      step={inputDef.type === "int" ? 1 : 0.1}
                      allowDecimal={inputDef.type !== "int"}
                      {...form.getInputProps(key)}
                    />
                  );
              }
            })}
          </Stack>
        </form>

        {/* Display assertion errors if any */}
        {assertionErrors.length > 0 && (
          <Alert variant="light" color="red" title="入力エラー">
            {assertionErrors.map((error: string, i: number) => (
              <Text key={i} size="sm">
                {error}
              </Text>
            ))}
          </Alert>
        )}

        {/* Display all outputs in order, but calculated ones only when inputs are valid */}
        {(hasValidInputs || allOutputs.some(([, def]) => hasText(def))) && (
          <>
            <Box mt="md">
              <Title order={4}>結果</Title>
            </Box>
            <Stack gap="xs">
              {allOutputs.map(([key, outputDef]) => {
                // Check locale filtering
                if (!shouldDisplayForLocale(outputDef, locale)) return null;

                // Text item - always show
                if (hasText(outputDef)) {
                  return (
                    <Box key={key}>
                      {outputDef.label && (
                        <Text size="sm" fw={500} mb={2}>
                          {outputDef.label}
                        </Text>
                      )}
                      <Text size="sm" c="dimmed">
                        {outputDef.text}
                      </Text>
                    </Box>
                  );
                }

                // Formula item - only show when valid inputs
                if (hasValidInputs && hasFormula(outputDef)) {
                  const result = results[key];
                  const value = result !== undefined ? String(result) : "-";
                  const unit = outputDef.unit ?? "";

                  return (
                    <Group key={key} justify="space-between">
                      <Text fw={500}>{outputDef.label}</Text>
                      <Group gap={4}>
                        <Text>{value}</Text>
                        {unit && <Text c="dimmed">{unit}</Text>}
                      </Group>
                    </Group>
                  );
                }

                return null;
              })}
            </Stack>
          </>
        )}

        {hasValidInputs && Object.keys(results).length === 0 && (
          <Alert
            variant="light"
            color="yellow"
            title="計算できません"
            icon={<IconCalculator size={16} />}
          >
            入力値を確認してください
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
