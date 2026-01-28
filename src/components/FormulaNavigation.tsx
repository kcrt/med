"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Link } from "@/lib/navigation";

/**
 * Previous formula navigation button.
 * Only visible on mobile (hidden from sm breakpoint).
 */
export function PreviousFormulaButton({
  formulaId,
  title,
}: {
  formulaId?: string;
  title?: string;
}) {
  if (!formulaId) return null;

  return (
    <Tooltip label={title}>
      <ActionIcon
        component={Link}
        href={`/formula/${formulaId}`}
        variant="light"
        size="lg"
        radius="xl"
        aria-label={title || "Previous formula"}
        hiddenFrom="sm"
      >
        <IconArrowLeft size={20} />
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * Next formula navigation button.
 * Only visible on mobile (hidden from sm breakpoint).
 */
export function NextFormulaButton({
  formulaId,
  title,
}: {
  formulaId?: string;
  title?: string;
}) {
  if (!formulaId) return null;

  return (
    <Tooltip label={title}>
      <ActionIcon
        component={Link}
        href={`/formula/${formulaId}`}
        variant="light"
        size="lg"
        radius="xl"
        aria-label={title || "Next formula"}
        hiddenFrom="sm"
      >
        <IconArrowRight size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
