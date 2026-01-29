"use client";

import { Accordion, NavLink, Stack, TextInput, Text } from "@mantine/core";
import { IconSettings, IconStar, IconSearch } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useSearchableMenuItems } from "@/lib/formula-translation";
import { Link, usePathname } from "@/lib/navigation";
import { useState, useMemo, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("config");
  const tFavorites = useTranslations("favorites");
  const tSearch = useTranslations("search");
  const menuItems = useSearchableMenuItems();
  const [searchQuery, setSearchQuery] = useState("");
  const [accordionValue, setAccordionValue] = useState<string | null>(
    menuItems[0]?.label ?? null,
  );

  // Filter menu items based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return menuItems;
    }

    const query = searchQuery.toLowerCase().trim();

    return menuItems
      .map((category) => {
        const filteredItems = category.items.filter((item) => {
          // Search in translated label
          const matchesTranslated = item.label.toLowerCase().includes(query);

          // Search in English label
          const matchesEnglish = item.englishLabel
            .toLowerCase()
            .includes(query);

          return matchesTranslated || matchesEnglish;
        });

        return {
          ...category,
          items: filteredItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [searchQuery, menuItems]);

  // Auto-expand first matching category when searching
  useEffect(() => {
    if (searchQuery.trim() && filteredMenuItems.length > 0) {
      setAccordionValue(filteredMenuItems[0].label);
    } else if (!searchQuery.trim() && menuItems.length > 0) {
      // Reset to first category when clearing search
      setAccordionValue(menuItems[0].label);
    }
  }, [searchQuery, filteredMenuItems, menuItems]);

  const hasSearchResults = filteredMenuItems.length > 0;

  return (
    <Stack h="100%" style={{ overflowY: "auto" }}>
      <TextInput
        placeholder={tSearch("placeholder")}
        leftSection={<IconSearch size={18} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        aria-label={tSearch("placeholder")}
      />

      <NavLink
        component={Link}
        href="/favorites"
        label={tFavorites("title")}
        leftSection={<IconStar size={18} />}
        active={pathname === "/favorites"}
      />

      {searchQuery.trim() && !hasSearchResults && (
        <Text c="dimmed" size="sm" ta="center" py="md">
          {tSearch("noResults")}
          <br />
          {tSearch("noResultsDescription")}
        </Text>
      )}

      <Accordion
        variant="filled"
        value={accordionValue}
        onChange={setAccordionValue}
      >
        {filteredMenuItems.map((category) => (
          <Accordion.Item key={category.path} value={category.label}>
            <Accordion.Control>{category.label}</Accordion.Control>
            <Accordion.Panel>
              {category.items.map((item) => (
                <NavLink
                  key={item.path}
                  component={Link}
                  href={item.path}
                  label={item.label}
                  active={pathname === item.path}
                />
              ))}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <NavLink
        component={Link}
        href="/config"
        label={t("title")}
        leftSection={<IconSettings size={18} />}
        active={pathname === "/config"}
      />
    </Stack>
  );
}
