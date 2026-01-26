"use client";

import {
  Alert,
  Box,
  Card,
  Group,
  NumberInput,
  Radio,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCalculator } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import {
  evaluateFormulaOutputs,
  type FormulaInputValues,
  shouldDisplayForLocale,
  validateAssertions,
} from "@/lib/formula";
import {
  useInputLabel,
  useOptionLabel,
  useOutputLabel,
  useOutputText,
} from "@/lib/formula-translation";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";
import { QRCodeExport } from "./QRCodeExport";
import { ShareButton } from "./ShareButton";
import { CopyResultButton } from "./CopyResultButton";

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
  output: Record<string, FormulaOutput>;
  assert?: { condition: string; message: string }[];
} {
  return "input" in formula && "output" in formula;
}

// Type guard to check if output has formula
function hasFormula(
  output: FormulaOutput,
): output is FormulaOutput & { formula: string } {
  return "formula" in output && typeof output.formula === "string";
}

// Type guard to check if output has text
function hasText(
  output: FormulaOutput,
): output is FormulaOutput & { text: string } {
  return "text" in output && typeof output.text === "string";
}

// Helper component for translated select options
interface SelectInputFieldProps {
  inputKey: string;
  label: string;
  options: { value: number | string; label: string }[] | undefined;
  inputProps: ReturnType<ReturnType<typeof useForm>["getInputProps"]>;
}

function SelectInputField({ inputKey, label, options, inputProps }: SelectInputFieldProps) {
  const translatedOptions = options?.map((opt, idx) => ({
    value: String(idx),
    label: useOptionLabel(opt.label),
  })) ?? [];

  return (
    <Select
      key={inputKey}
      label={label}
      data={translatedOptions}
      {...inputProps}
    />
  );
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
  const searchParams = useSearchParams();
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
        case "select": {
          // Select uses index as value, map back to original option value
          const selectedIndex = Number(value);
          const selectedOption = inputDef.options?.[selectedIndex];
          inputValues[key] = selectedOption?.value ?? 0;
          break;
        }
        case "date":
          // Convert date string to seconds since epoch
          if (value instanceof Date) {
            inputValues[key] = Math.floor(value.getTime() / 1000);
          } else if (typeof value === "string" && value) {
            inputValues[key] = Math.floor(Date.parse(value) / 1000);
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

  // Handle query parameters on mount
  useEffect(() => {
    const initialValues: FormValues = {};
    let hasQueryParams = false;

    inputKeys.forEach((key) => {
      const paramValue = searchParams.get(key);
      if (paramValue !== null) {
        hasQueryParams = true;
        const inputDef = formula.input[key];

        // Convert to appropriate type based on input definition
        switch (inputDef?.type) {
          case "int":
          case "float": {
            const numValue = parseFloat(paramValue);
            if (!Number.isNaN(numValue)) {
              initialValues[key] = numValue;
            }
            break;
          }
          case "onoff":
          case "sex":
            initialValues[key] = paramValue === "true";
            break;
          case "select": {
            // Find the option index by value or label
            const optionIndex = inputDef.options?.findIndex(
              (opt) =>
                String(opt.value) === paramValue || opt.label === paramValue,
            );
            // Only set if we found a match, otherwise keep the default
            if (optionIndex !== undefined && optionIndex >= 0) {
              initialValues[key] = optionIndex;
            }
            break;
          }
          case "date":
            initialValues[key] = paramValue;
            break;
          default:
            initialValues[key] = paramValue;
        }
      }
    });

    // Only update form values if there are query parameters
    if (hasQueryParams) {
      form.setValues(initialValues);
    }
    // We only depend on searchParams to trigger this effect
    // formula and inputKeys are stable and don't need to trigger re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentInputValues = form.values
    ? getInputValues(form.values as FormValues)
    : {};

  const results =
    Object.keys(currentInputValues).length > 0
      ? evaluateFormulaOutputs(formula, currentInputValues)
      : {};

  const hasValidInputs = inputKeys.every((key) => {
    const value = form.values[key];
    // Consider non-empty strings, non-zero numbers, and booleans as valid
    if (typeof value === "boolean") return true;
    if (typeof value === "number") return value !== 0;
    return value !== "";
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder pos="relative">
      {/* Copy Result Button - Top Right Corner */}
      {hasValidInputs && Object.keys(results).length > 0 && (
        <Box style={{ position: "absolute", top: "16px", right: "16px", zIndex: 1 }}>
          <CopyResultButton
            formula={formula}
            formulaId={formulaId}
            inputValues={currentInputValues}
            outputResults={results}
          />
        </Box>
      )}
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
              const label = useInputLabel(formulaId, key, inputDef);

              switch (inputDef.type) {
                case "onoff":
                  return (
                    <Switch key={key} label={label} {...inputProps} />
                  );

                case "sex":
                  return (
                    <Radio.Group
                      key={key}
                      label={label}
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
                    <SelectInputField
                      key={key}
                      inputKey={key}
                      label={label}
                      options={inputDef.options}
                      inputProps={inputProps}
                    />
                  );

                case "date":
                  return (
                    <TextInput
                      key={key}
                      type="date"
                      label={label}
                      {...inputProps}
                    />
                  );

                case "int":
                case "float":
                default:
                  return (
                    <NumberInput
                      key={key}
                      label={label}
                      placeholder={`Enter ${label}`}
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
                // Skip hidden outputs (intermediate calculation values)
                if ("label" in outputDef && outputDef.label === "hidden")
                  return null;

                // Check locale filtering
                if (!shouldDisplayForLocale(outputDef, locale)) return null;

                // Get translated labels
                const label = useOutputLabel(formulaId, key, outputDef);
                const text = useOutputText(formulaId, key, outputDef);

                // Text item - always show
                if (hasText(outputDef)) {
                  return (
                    <Box key={key}>
                      {label && label !== key && (
                        <Text size="sm" fw={500} mb={2}>
                          {label}
                        </Text>
                      )}
                      <Text size="sm" c="dimmed">
                        {text || outputDef.text}
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
                      <Text fw={500}>{label}</Text>
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

      {/* QR Code Export Component */}
      <QRCodeExport
        formula={formula}
        formulaId={formulaId}
        inputValues={currentInputValues}
        outputResults={results}
      />

      {/* Share Button Component */}
      <ShareButton formula={formula} inputValues={form.values} />
    </Card>
  );
}
