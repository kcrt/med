"use client";

import { useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Container,
  Title,
  Stack,
  Alert,
  Text,
  Group,
  Anchor,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useLocale } from "next-intl";
import { FormulaCalculator } from "@/components/FormulaCalculator";
import { ReferenceLinks } from "@/components/ReferenceLinks";
import { getFormula } from "@/lib/formula";

export default function FormulaPage() {
  const params = useParams();
  const locale = useLocale();
  const formulaId = params.id as string;
  const formula = getFormula(formulaId, locale);

  useEffect(() => {
    if (formula && formula.name) {
      document.title = `${formula.name} | med`;
    }
  }, [formula]);

  if (!formula) {
    notFound();
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={1}>{formula.name ?? formulaId}</Title>

        {formula.output && (
          <>
            <FormulaCalculator formula={formula} formulaId={formulaId} />
            <ReferenceLinks ref={formula.ref} />
          </>
        )}
      </Stack>
    </Container>
  );
}
