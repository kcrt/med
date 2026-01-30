"use client";

import { Button, Group, Menu } from "@mantine/core";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";

const LOCALES = ["en", "ja", "zh-Hans", "zh-Hant"] as const;
const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ja: "日本語",
  "zh-Hans": "简体",
  "zh-Hant": "繁體",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (newLocale: (typeof LOCALES)[number]) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Group gap="xs">
      <Menu>
        <Menu.Target>
          <Button size="xs" variant="filled">
            {LOCALE_LABELS[locale] || locale}
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {LOCALES.map((loc) => (
            <Menu.Item
              key={loc}
              leftSection={loc === locale ? "✓" : undefined}
              onClick={() => switchLocale(loc)}
            >
              {LOCALE_LABELS[loc]}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
