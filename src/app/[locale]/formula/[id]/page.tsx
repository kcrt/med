"use client";

import {
  ActionIcon,
  Box,
  Container,
  Group,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import DOMPurify from "isomorphic-dompurify";
import { notFound, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FormulaCalculator } from "@/components/FormulaCalculator";
import {
  NextFormulaButton,
  PreviousFormulaButton,
} from "@/components/FormulaNavigation";
import { ReferenceLinks } from "@/components/ReferenceLinks";
import { SparkleEffect } from "@/components/SparkleEffect";
import { getFavorites, isFavorite, toggleFavorite } from "@/lib/favorites";
import { getAdjacentFormulas, getFormula } from "@/lib/formula";
import { useFormulaName } from "@/lib/formula-translation";

export default function FormulaPage() {
  const params = useParams<{ locale: string; id: string }>();
  const t = useTranslations("favorites");
  // Handle params.id safely - it could be a string, array, or undefined
  const formulaId = Array.isArray(params.id)
    ? params.id[0] || ""
    : params.id || "";

  const formula = getFormula(formulaId);
  const { previous: previousFormulaId, next: nextFormulaId } =
    getAdjacentFormulas(formulaId);
  const previousFormula = previousFormulaId
    ? getFormula(previousFormulaId)
    : undefined;
  const nextFormula = nextFormulaId ? getFormula(nextFormulaId) : undefined;
  const [favorited, setFavorited] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [showFirstFavoriteTooltip, setShowFirstFavoriteTooltip] =
    useState(false);

  // Get translated formula names
  const formulaName = formula ? useFormulaName(formulaId, formula) : formulaId;
  const previousFormulaName =
    previousFormula && previousFormulaId
      ? useFormulaName(previousFormulaId, previousFormula)
      : undefined;
  const nextFormulaName =
    nextFormula && nextFormulaId
      ? useFormulaName(nextFormulaId, nextFormula)
      : undefined;

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
    // Check if this will be the first favorite before toggling
    const isFirstFavorite = getFavorites().length === 0 && !favorited;

    toggleFavorite(formulaId);
    // Update local state based on actual storage state after toggle
    const newFavorited = isFavorite(formulaId);
    setFavorited(newFavorited);

    // Show sparkle effect whenever adding to favorites
    if (newFavorited) {
      setShowSparkle(true);

      // Show special message only for the first favorite
      if (isFirstFavorite) {
        setShowFirstFavoriteTooltip(true);

        // Auto-hide the special tooltip after 3 seconds
        setTimeout(() => {
          setShowFirstFavoriteTooltip(false);
        }, 3000);
      }
    }
  };

  if (!formula) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="nowrap">
            <PreviousFormulaButton
              formulaId={previousFormulaId}
              title={previousFormulaName}
            />
            <Title order={2}>{formulaName}</Title>
            <NextFormulaButton formulaId={nextFormulaId} title={nextFormulaName} />
            <Box style={{ position: "relative" }}>
              <Tooltip
                label={
                  showFirstFavoriteTooltip
                    ? t("firstFavoriteMessage")
                    : favorited
                      ? t("removeFromFavorites")
                      : t("addToFavorites")
                }
                opened={showFirstFavoriteTooltip ? true : undefined}
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
              <SparkleEffect
                show={showSparkle}
                onComplete={() => setShowSparkle(false)}
              />
            </Box>
          </Group>

          {"type" in formula && formula.type === "html" ? (
            // SECURITY: HTML content from formula.json is sanitized with DOMPurify
            // to prevent XSS attacks. The HTML comes from trusted formula definitions,
            // but sanitization provides defense-in-depth protection.
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(formula.html),
              }}
            />
          ) : (
            <>
              <FormulaCalculator formula={formula} formulaId={formulaId} />
              <ReferenceLinks ref={formula.ref} />
            </>
          )}
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
