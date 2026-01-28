"use client";

import { Card, Container, Select, Stack, Text, Title } from "@mantine/core";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/locale";
import { usePathname, useRouter } from "@/lib/navigation";

type LocaleValue = Locale | "auto";

export default function ConfigPage() {
  const t = useTranslations("config");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  // Check if currently using auto (cookie not set or different from current locale)
  const [currentValue, setCurrentValue] = useState<LocaleValue>(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="));
    return cookie ? (locale as LocaleValue) : "auto";
  });

  const handleLanguageChange = async (value: string | null) => {
    if (!value) return;

    const selectedLocale = value as LocaleValue;

    if (selectedLocale === "auto") {
      // Remove cookie to let next-intl handle browser detection
      document.cookie = "NEXT_LOCALE=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Detect browser's preferred language
      const browserLang = navigator.language.split("-")[0];
      const detectedLocale = SUPPORTED_LOCALES.includes(browserLang as Locale)
        ? (browserLang as Locale)
        : DEFAULT_LOCALE;

      // Use router.replace for smooth transition
      router.replace(pathname, { locale: detectedLocale });
    } else {
      // Set cookie for locale persistence
      document.cookie = `NEXT_LOCALE=${selectedLocale};path=/;max-age=31536000`;
      // Use router.replace for smooth transition
      router.replace(pathname, { locale: selectedLocale });
    }

    setCurrentValue(selectedLocale);
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={1}>{t("title")}</Title>
        <Text c="dimmed">{t("description")}</Text>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Title order={3}>{t("language.label")}</Title>
            <Select
              value={currentValue}
              onChange={handleLanguageChange}
              data={[
                { label: t("language.auto"), value: "auto" },
                { label: t("language.en"), value: "en" },
                { label: t("language.ja"), value: "ja" },
              ]}
              allowDeselect={false}
            />
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
