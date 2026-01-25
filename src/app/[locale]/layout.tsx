import type { Metadata } from "next";
import "@mantine/core/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { NextIntlClientProvider } from "next-intl";
import { AppShellLayout } from "@/components/AppShellLayout";
import { getMessages, getTranslations } from "next-intl/server";
import "./globals.css";

const theme = createTheme({
  primaryColor: "blue",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: [
        { url: "/favicon32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon256.png", sizes: "256x256", type: "image/png" },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <AppShellLayout>{children}</AppShellLayout>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
