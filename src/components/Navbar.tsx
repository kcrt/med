"use client";

import { Accordion, NavLink, Stack } from "@mantine/core";
import { IconSettings, IconStar } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useTranslatedMenuItems } from "@/lib/formula-translation";
import { Link, usePathname } from "@/lib/navigation";

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("config");
  const tFavorites = useTranslations("favorites");
  const menuItems = useTranslatedMenuItems();

  return (
    <Stack h="100%" style={{ overflowY: "auto" }}>
      <NavLink
        component={Link}
        href="/favorites"
        label={tFavorites("title")}
        leftSection={<IconStar size={18} />}
        active={pathname === "/favorites"}
      />

      <Accordion variant="filled" defaultValue={menuItems[0]?.label}>
        {menuItems.map((category) => (
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
