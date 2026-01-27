"use client";

import { Button, Group } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const LOCALES = ["en", "ja"] as const;
const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ja: "日本語",
};

export function DevModeBar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const nextLocale = locale === "en" ? "ja" : "en";

  return (
    <Group gap="xs">
      <Button
        size="xs"
        variant="light"
        onClick={() => switchLocale(nextLocale)}
      >
        {LOCALE_LABELS[nextLocale]}
      </Button>
    </Group>
  );
}
