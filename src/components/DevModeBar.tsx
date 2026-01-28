"use client";

import { Button, Group } from "@mantine/core";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";

const LOCALES = ["en", "ja"] as const;
const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ja: "日本語",
};

export function DevModeBar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (newLocale: (typeof LOCALES)[number]) => {
    router.replace(pathname, { locale: newLocale });
  };

  const nextLocale = locale === "en" ? "ja" : "en";

  return (
    <Group gap="xs">
      <Button
        size="xs"
        variant="filled"
        onClick={() => switchLocale(nextLocale)}
      >
        {LOCALE_LABELS[locale]}
      </Button>
    </Group>
  );
}
