"use client";

import { Button, Group, Menu } from "@mantine/core";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";
import { SUPPORTED_LOCALES, languages, type Locale } from "@/lib/locale";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as Locale;

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Group gap="xs">
      <Menu>
        <Menu.Target>
          <Button size="xs" variant="filled">
            {languages[locale]?.short_name || locale}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {SUPPORTED_LOCALES.map((loc) => (
            <Menu.Item
              key={loc}
              leftSection={loc === locale ? "✓" : undefined}
              onClick={() => switchLocale(loc)}
            >
              {languages[loc]?.short_name || loc}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
