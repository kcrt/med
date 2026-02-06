"use client";

import { Alert, Paper, Stack, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconThumbUp,
} from "@tabler/icons-react";
import type { Formula } from "@/types/formula";
import {
  useFormulaInfo,
  useFormulaMetadata,
} from "@/lib/formula-translation";

interface FormulaInfoPanesProps {
  formula: Formula;
  formulaId: string;
}

/**
 * Component that displays all informational panes for a formula:
 * - Info (description)
 * - Metadata (obsolete, caution, recommended)
 */
export function FormulaInfoPanes({
  formula,
  formulaId,
}: FormulaInfoPanesProps) {
  const formulaInfo = useFormulaInfo(formulaId, formula);
  const metadata = formula?.metadata;

  // Get translated metadata
  const obsoleteText = metadata?.obsolete
    ? useFormulaMetadata(formulaId, "obsolete", metadata.obsolete)
    : undefined;
  const cautionText = metadata?.caution
    ? useFormulaMetadata(formulaId, "caution", metadata.caution)
    : undefined;
  const recommendedText = metadata?.recommended
    ? useFormulaMetadata(formulaId, "recommended", metadata.recommended)
    : undefined;

  // Nothing to display
  if (!formulaInfo && !obsoleteText && !cautionText && !recommendedText) {
    return null;
  }

  return (
    <Stack gap="xs">
      {/* Info pane */}
      {"info" in formula && formulaInfo && (
        <Paper
          p="md"
          radius="md"
          withBorder
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(96, 165, 250, 0.04) 100%)",
            borderColor: "rgba(59, 130, 246, 0.2)",
          }}
        >
          <Text c="blue" size="sm" style={{ lineHeight: 1.6 }}>
            {formulaInfo}
          </Text>
        </Paper>
      )}

      {/* Obsolete pane */}
      {obsoleteText && (
        <Alert
          variant="light"
          color="orange"
          radius="md"
          icon={<IconAlertTriangle size={20} />}
        >
          <Text size="sm" fw={500}>
            {obsoleteText}
          </Text>
        </Alert>
      )}

      {/* Caution pane */}
      {cautionText && (
        <Alert
          variant="light"
          color="yellow"
          radius="md"
          icon={<IconAlertTriangle size={20} />}
        >
          <Text size="sm" fw={500}>
            {cautionText}
          </Text>
        </Alert>
      )}

      {/* Recommended pane */}
      {recommendedText && (
        <Alert
          variant="light"
          color="teal"
          radius="md"
          icon={<IconThumbUp size={20} />}
        >
          <Text size="sm" fw={500}>
            {recommendedText}
          </Text>
        </Alert>
      )}
    </Stack>
  );
}
