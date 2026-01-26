"use client";

import { Accordion, NavLink, Stack } from "@mantine/core";
import { IconSettings, IconStar } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getMenuItems } from "@/lib/formula";

export function Navbar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("config");
  const tFavorites = useTranslations("favorites");
  const menuItems = getMenuItems(locale);

  return (
    <Stack h="100%" style={{ overflowY: "auto" }}>
      <NavLink
        component={Link}
        href={`/${locale}/favorites`}
        label={tFavorites("title")}
        leftSection={<IconStar size={18} />}
        active={pathname === `/${locale}/favorites`}
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
        href={`/${locale}/config`}
        label={t("title")}
        leftSection={<IconSettings size={18} />}
        active={pathname === `/${locale}/config`}
      />
    </Stack>
  );
}
