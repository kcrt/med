"use client";

import { Card, Container, Select, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Locale } from "@/lib/locale";

type LocaleValue = Locale | "auto";

export default function ConfigPage() {
  const t = useTranslations("config");
  const router = useRouter();
  const locale = useLocale();

  // Check if currently using auto (cookie not set or different from current locale)
  const [currentValue, setCurrentValue] = useState<LocaleValue>(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="));
    return cookie ? (locale as LocaleValue) : "auto";
  });

  const handleLanguageChange = (value: string | null) => {
    if (!value) return;

    const selectedLocale = value as LocaleValue;

    if (selectedLocale === "auto") {
      // Remove cookie to let next-intl handle browser detection
      document.cookie = "NEXT_LOCALE=;path=/;max-age=0";
    } else {
      // Set cookie for locale persistence
      document.cookie = `NEXT_LOCALE=${selectedLocale};path=/;max-age=31536000`;
    }

    // Reload to apply new locale
    router.refresh();
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
