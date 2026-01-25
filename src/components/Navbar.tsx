"use client";

import { Accordion, NavLink, Stack } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMenuItems } from "@/lib/formula";
import { useTranslations, useLocale } from "next-intl";
import { IconSettings } from "@tabler/icons-react";

export function Navbar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("config");
  const menuItems = getMenuItems(locale);

  return (
    <Stack>
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
