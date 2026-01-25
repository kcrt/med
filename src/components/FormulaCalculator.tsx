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
} from "@mantine/core";
import { IconCalculator } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import { type Formula, type FormulaOutput } from "@/types/formula";
import {
  evaluateFormulaOutputs,
  shouldDisplayForLocale,
  type FormulaInputValues,
} from "@/lib/formula";

interface FormulaCalculatorProps {
  formula: Formula;
  formulaId: string;
}

interface FormValues {
  [key: string]: number | string;
}

// Type guard to check if output has formula
function hasFormula(
  output: FormulaOutput | { text: string }
): output is FormulaOutput & { formula: string } {
  return "formula" in output && typeof output.formula === "string";
}

// Type guard to check if output has text
function hasText(
  output: FormulaOutput | { text: string }
): output is { text: string; label?: string } {
  return "text" in output && typeof output.text === "string";
}

export function FormulaCalculator({ formula }: FormulaCalculatorProps) {
  const locale = useLocale();
  const inputKeys = Object.keys(formula.input);
  const allOutputs = Object.entries(formula.output);

  const form = useForm<FormValues>({
    initialValues: Object.fromEntries(
      inputKeys.map((key) => [key, ""])
    ) as FormValues,
  });

  const calculateResults = (values: FormValues) => {
    const inputValues: FormulaInputValues = {};
    for (const [key, value] of Object.entries(values)) {
      if (value !== "") {
        inputValues[key] = Number(value);
      }
    }

    return evaluateFormulaOutputs(formula, inputValues);
  };

  const results = form.values
    ? calculateResults(form.values as FormValues)
    : {};

  const hasValidInputs = inputKeys.some(
    (key) => form.values[key] !== ""
  );

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
              return (
                <NumberInput
                  key={key}
                  label={inputDef.label}
                  placeholder={`Enter ${inputDef.label}`}
                  min={inputDef.min}
                  max={inputDef.max}
                  decimalScale={
                    inputDef.type === "int" ? 0 : undefined
                  }
                  {...form.getInputProps(key)}
                />
              );
            })}
          </Stack>
        </form>

        {/* Display all outputs in order, but calculated ones only when inputs are valid */}
        {(hasValidInputs || allOutputs.some(([, def]) => hasText(def))) && (
          <>
            <Box mt="md">
              <Title order={4}>結果</Title>
            </Box>
            <Stack gap="xs">
              {allOutputs.map(([key, outputDef]) => {
                // Check locale filtering
                if (!shouldDisplayForLocale(outputDef, locale)) {
                  return null;
                }

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
                  const value =
                    result !== undefined ? String(result) : "-";
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
