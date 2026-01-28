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
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/favorites";
import { getFormula, getCategoryMap } from "@/lib/formula";
import { useFormulaName, useCategoryName } from "@/lib/formula-translation";
import type { Formula } from "@/types/formula";
import { Link } from "@/lib/navigation";

// Component to render a favorite item with translated name
// Must be defined outside FavoritesPage to prevent React remounting on state changes
interface FavoriteItemProps {
  formulaId: string;
  formula: Formula;
  categoryName: string | undefined;
  isRemoving: boolean;
  onRemove: (formulaId: string) => void;
  t: (key: string) => string;
}

function FavoriteItem({
  formulaId,
  formula,
  categoryName,
  isRemoving,
  onRemove,
  t,
}: FavoriteItemProps) {
  const formulaName = useFormulaName(formulaId, formula);
  const translatedCategory = useCategoryName(categoryName || "");

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        transition: "all 300ms ease-out",
        transform: isRemoving ? "translateX(-100%)" : "translateX(0)",
        opacity: isRemoving ? 0 : 1,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Anchor
            component={Link}
            href={`/formula/${formulaId}`}
            size="lg"
            fw={600}
          >
            {formulaName}
          </Anchor>
          {categoryName && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {t("category")}:
              </Text>
              <Badge variant="light" size="sm">
                {translatedCategory}
              </Badge>
            </Group>
          )}
        </Stack>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onRemove(formulaId)}
          aria-label={t("remove")}
        >
          <IconTrash size={20} />
        </ActionIcon>
      </Group>
    </Card>
  );
}

export default function FavoritesPage() {
  const t = useTranslations("favorites");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemoveFavorite = (formulaId: string) => {
    // Add to removing set to trigger slide-out animation
    setRemovingIds((prev) => new Set(prev).add(formulaId));

    // Wait for animation to complete before actually removing
    setTimeout(() => {
      toggleFavorite(formulaId);
      // Update state directly after removal
      setFavorites(getFavorites());
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(formulaId);
        return next;
      });
    }, 300); // Match animation duration
  };

  // Memoize category mapping to avoid repeated lookups
  const categoryMap = useMemo(() => getCategoryMap(), []);


  // Combine current favorites with items being removed (for animation)
  const displayItems = useMemo(() => {
    const itemSet = new Set([...favorites, ...Array.from(removingIds)]);
    return Array.from(itemSet);
  }, [favorites, removingIds]);

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{t("title")}</Title>

        {favorites.length === 0 && removingIds.size === 0 ? (
          <Alert
            icon={<IconStar size={20} />}
            title={t("noFavorites")}
            color="blue"
          >
            {t("noFavoritesDescription")}
          </Alert>
        ) : (
          <Stack gap="md">
            {displayItems.map((formulaId) => {
              const formula = getFormula(formulaId);
              if (!formula) return null;

              return (
                <FavoriteItem
                  key={formulaId}
                  formulaId={formulaId}
                  formula={formula}
                  categoryName={categoryMap.get(formulaId)}
                  isRemoving={removingIds.has(formulaId)}
                  onRemove={handleRemoveFavorite}
                  t={t}
                />
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
