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
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FormulaCalculator } from "@/components/FormulaCalculator";
import { ReferenceLinks } from "@/components/ReferenceLinks";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { getFormula } from "@/lib/formula";

export default function FormulaPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("favorites");
  const formulaId = params.id as string;
  const formula = getFormula(formulaId, locale);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (formula?.name) {
      document.title = `${formula.name} | med`;
    }
  }, [formula]);

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
    setFavorited(!favorited);
  };

  if (!formula) {
    notFound();
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap">
          <Title order={1}>{formula.name ?? formulaId}</Title>
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
