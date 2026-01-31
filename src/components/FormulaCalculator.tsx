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
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  evaluateFormulaOutputs,
  type FormulaInputValues,
  isCalculationFormula,
  shouldDisplayForLocale,
  shouldDisplayInputForLocale,
  validateAssertions,
} from "@/lib/formula";
import {
  useInputLabel,
  useOutputLabel,
  useOutputText,
} from "@/lib/formula-translation";
import {
  escapeTranslationKey,
  getTranslationDirect,
} from "@/lib/translation-utils";
import { DEFAULT_LOCALE } from "@/lib/locale";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";
import { QRCodeExport } from "./QRCodeExport";
import { ShareButton } from "./ShareButton";
import { CopyResultButton } from "./CopyResultButton";

// Constants
const HIDDEN_OUTPUT_LABEL = "hidden";

/**
 * Props for the FormulaCalculator component.
 */
interface FormulaCalculatorProps {
  /** The formula definition to render */
  formula: Formula;
  /** Unique identifier for the formula */
  formulaId: string;
}

interface FormValues {
  [key: string]: number | string | boolean | Date | null;
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

// Helper function to translate option label (non-hook version)
function translateOptionLabel(
  optionLabel: string,
  locale: string,
  labels: Record<string, unknown> | undefined,
): string {
  // For English, no translation needed
  if (locale === DEFAULT_LOCALE) {
    return optionLabel;
  }

  // Try with escaped dots for backward compatibility
  const escapedKey = escapeTranslationKey(optionLabel);
  const translated = getTranslationDirect(labels, escapedKey);
  if (translated) {
    return translated;
  }

  return optionLabel;
}

// Helper component for translated select options
interface SelectInputFieldProps {
  inputKey: string;
  label: string;
  options: { value: number | string; label: string }[] | undefined;
  inputProps: ReturnType<ReturnType<typeof useForm>["getInputProps"]>;
}

function SelectInputField({
  inputKey,
  label,
  options,
  inputProps,
}: SelectInputFieldProps) {
  const locale = useLocale();
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;

  const translatedOptions =
    options?.map((opt, idx) => ({
      value: String(idx),
      label: translateOptionLabel(opt.label, locale, labels),
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

// Component for rendering a single input field
interface InputFieldProps {
  formulaId: string;
  inputKey: string;
  inputDef: FormulaInput;
  inputProps: ReturnType<ReturnType<typeof useForm>["getInputProps"]>;
}

function InputField({
  formulaId,
  inputKey,
  inputDef,
  inputProps,
}: InputFieldProps) {
  const t = useTranslations("calculator");
  const label = useInputLabel(formulaId, inputKey, inputDef);

  switch (inputDef.type) {
    case "onoff":
      return <Switch key={inputKey} label={label} {...inputProps} />;

    case "sex":
      return (
        <Radio.Group key={inputKey} label={label} {...inputProps}>
          <Group>
            <Radio value="true" label={t("male")} />
            <Radio value="false" label={t("female")} />
          </Group>
        </Radio.Group>
      );

    case "select":
      return (
        <SelectInputField
          key={inputKey}
          inputKey={inputKey}
          label={label}
          options={inputDef.options}
          inputProps={inputProps}
        />
      );

    case "date":
      return (
        <TextInput key={inputKey} type="date" label={label} {...inputProps} />
      );

    case "int":
    case "float":
    default:
      return (
        <NumberInput
          key={inputKey}
          label={label}
          placeholder={t("placeholder", { label })}
          min={inputDef.min}
          max={inputDef.max}
          rightSection={
            inputDef.unit ? (
              <Text fw={700} size="sm" px={4} c="dimmed">
                {inputDef.unit}
              </Text>
            ) : null
          }
          rightSectionWidth={inputDef.unit ? 80 : 40}
          step={inputDef.type === "int" ? 1 : 0.1}
          allowDecimal={inputDef.type !== "int"}
          {...inputProps}
        />
      );
  }
}

// Component for rendering a single output item
interface OutputItemProps {
  formulaId: string;
  outputKey: string;
  outputDef: FormulaOutput;
  hasValidInputs: boolean;
  result: number | string | undefined;
  locale: string;
}

function OutputItem({
  formulaId,
  outputKey,
  outputDef,
  hasValidInputs,
  result,
  locale,
}: OutputItemProps) {
  // Call hooks unconditionally at the top of the component
  const label = useOutputLabel(formulaId, outputKey, outputDef);
  const text = useOutputText(formulaId, outputKey, outputDef);

  // Skip hidden outputs (intermediate calculation values)
  if ("label" in outputDef && outputDef.label === HIDDEN_OUTPUT_LABEL) {
    return null;
  }

  // Check locale filtering
  if (!shouldDisplayForLocale(outputDef, locale)) {
    return null;
  }

  // Text item - always show
  if (hasText(outputDef)) {
    return (
      <Box key={outputKey}>
        {label && label !== outputKey && (
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
    const value = result !== undefined ? String(result) : "-";
    const unit = outputDef.unit ?? "";

    return (
      <Group key={outputKey} justify="space-between">
        <Text fw={500}>{label}</Text>
        <Group gap={4}>
          <Text>{value}</Text>
          {unit && <Text c="dimmed">{unit}</Text>}
        </Group>
      </Group>
    );
  }

  return null;
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
  const t = useTranslations("calculator");
  const searchParams = useSearchParams();
  const inputKeys = Object.keys(formula.input).filter((key) =>
    shouldDisplayInputForLocale(formula.input[key]!, locale),
  );
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
            const parsed = Date.parse(value);
            // Validate date parsing - Date.parse() returns NaN for invalid dates
            if (!Number.isNaN(parsed)) {
              inputValues[key] = Math.floor(parsed / 1000);
            }
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
      <Box
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 1,
        }}
      >
        <CopyResultButton
          formula={formula}
          formulaId={formulaId}
          inputValues={currentInputValues}
          outputResults={results}
        />
      </Box>
      <Stack gap="md">
        <Group>
          <IconCalculator size={20} />
          <Title order={3}>{t("calculate")}</Title>
        </Group>

        <form>
          <Stack gap="sm">
            {inputKeys.map((key) => {
              const inputDef = formula.input[key]!;
              const inputProps = form.getInputProps(key);

              return (
                <InputField
                  key={key}
                  formulaId={formulaId}
                  inputKey={key}
                  inputDef={inputDef}
                  inputProps={inputProps}
                />
              );
            })}
          </Stack>
        </form>

        {/* Display assertion errors if any */}
        {assertionErrors.length > 0 && (
          <Alert variant="light" color="red" title={t("inputError")}>
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
              <Title order={4}>{t("result")}</Title>
            </Box>
            <Stack gap="xs">
              {allOutputs.map(([key, outputDef]) => (
                <OutputItem
                  key={key}
                  formulaId={formulaId}
                  outputKey={key}
                  outputDef={outputDef}
                  hasValidInputs={hasValidInputs}
                  result={results[key]}
                  locale={locale}
                />
              ))}
            </Stack>
          </>
        )}

        {hasValidInputs && Object.keys(results).length === 0 && (
          <Alert
            variant="light"
            color="yellow"
            title={t("calculationError")}
            icon={<IconCalculator size={16} />}
          >
            {t("inputError")}
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
