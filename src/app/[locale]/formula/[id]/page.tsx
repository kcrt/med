"use client";

import {
  ActionIcon,
  Container,
  Group,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { notFound, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormulaCalculator } from "@/components/FormulaCalculator";
import { ReferenceLinks } from "@/components/ReferenceLinks";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { useFormula } from "@/lib/formula-hooks";
import { useFormulaName } from "@/lib/formula-translation";

export default function FormulaPage() {
  const params = useParams();
  const t = useTranslations("favorites");
  const formulaId = params.id as string;
  const formula = useFormula(formulaId);
  const [favorited, setFavorited] = useState(false);
  
  // Get translated formula name
  const formulaName = formula ? useFormulaName(formulaId, formula) : formulaId;

  useEffect(() => {
    if (formulaName) {
      document.title = `${formulaName} | med`;
    }
  }, [formulaName]);

  // Check initial favorite status
  useEffect(() => {
    setFavorited(isFavorite(formulaId));
  }, [formulaId]);

  // Listen for favorites changes from other components
  useEffect(() => {
    const handleFavoritesChanged = () => {
      setFavorited(isFavorite(formulaId));
    };

    window.addEventListener("favoritesChanged", handleFavoritesChanged);
    return () => {
      window.removeEventListener("favoritesChanged", handleFavoritesChanged);
    };
  }, [formulaId]);

  const handleToggleFavorite = () => {
    toggleFavorite(formulaId);
    // Update local state based on actual storage state after toggle
    setFavorited(isFavorite(formulaId));
  };

  if (!formula) {
    notFound();
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap">
          <Title order={1}>{formulaName}</Title>
          <Tooltip
            label={favorited ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={handleToggleFavorite}
              aria-label={
                favorited ? t("removeFromFavorites") : t("addToFavorites")
              }
            >
              {favorited ? (
                <IconStarFilled size={24} style={{ color: "gold" }} />
              ) : (
                <IconStar size={24} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>

        {"type" in formula && formula.type === "html" ? (
          <div dangerouslySetInnerHTML={{ __html: formula.html }} />
        ) : (
          <>
            <FormulaCalculator formula={formula} formulaId={formulaId} />
            <ReferenceLinks ref={formula.ref} />
          </>
        )}
      </Stack>
    </Container>
  );
}
