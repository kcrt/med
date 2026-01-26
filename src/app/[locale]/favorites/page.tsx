"use client";

import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconStar, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { useFormulaData } from "@/lib/formula-hooks";
import { useFormulaName } from "@/lib/formula-translation";
import type { Formula } from "@/types/formula";

export default function FavoritesPage() {
  const locale = useLocale();
  const t = useTranslations("favorites");
  const [favorites, setFavorites] = useState<string[]>([]);
  const formulaData = useFormulaData();

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  // Listen for favorites changes
  useEffect(() => {
    const handleFavoritesChanged = () => {
      setFavorites(getFavorites());
    };

    window.addEventListener("favoritesChanged", handleFavoritesChanged);
    return () => {
      window.removeEventListener("favoritesChanged", handleFavoritesChanged);
    };
  }, []);

  const handleRemoveFavorite = (formulaId: string) => {
    toggleFavorite(formulaId);
  };

  // Memoize category mapping to avoid repeated lookups
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const [categoryName, categoryData] of Object.entries(formulaData)) {
      if (categoryName === "_meta") continue;
      const categoryRecord = categoryData as Record<string, unknown>;
      for (const formulaId of Object.keys(categoryRecord)) {
        map.set(formulaId, categoryName);
      }
    }

    return map;
  }, [formulaData]);

  // Helper function to get formula from formulaData by ID
  // Note: We use this instead of useFormula() hook because hooks can't be called 
  // inside loops/maps, and we already have formulaData from useFormulaData()
  const getFormulaById = (id: string): Formula | undefined => {
    for (const [categoryName, categoryData] of Object.entries(formulaData)) {
      if (categoryName === "_meta") continue;
      const categoryRecord = categoryData as Record<string, Formula>;
      if (categoryRecord[id]) {
        return categoryRecord[id];
      }
    }
    return undefined;
  };

  // Component to render a favorite item with translated name
  const FavoriteItem = ({ formulaId }: { formulaId: string }) => {
    const formula = getFormulaById(formulaId);
    const category = categoryMap.get(formulaId);
    const formulaName = formula ? useFormulaName(formulaId, formula) : formulaId;

    // Skip if formula no longer exists
    if (!formula) return null;

    return (
      <Card
        key={formulaId}
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <Group justify="space-between" wrap="nowrap">
          <Stack gap="xs" style={{ flex: 1 }}>
            <Anchor
              component={Link}
              href={`/${locale}/formula/${formulaId}`}
              size="lg"
              fw={600}
            >
              {formulaName}
            </Anchor>
            {category && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {t("category")}:
                </Text>
                <Badge variant="light" size="sm">
                  {category}
                </Badge>
              </Group>
            )}
          </Stack>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleRemoveFavorite(formulaId)}
            aria-label={t("remove")}
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Group>
      </Card>
    );
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{t("title")}</Title>

        {favorites.length === 0 ? (
          <Alert
            icon={<IconStar size={20} />}
            title={t("noFavorites")}
            color="blue"
          >
            {t("noFavoritesDescription")}
          </Alert>
        ) : (
          <Stack gap="md">
            {favorites.map((formulaId) => (
              <FavoriteItem key={formulaId} formulaId={formulaId} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
