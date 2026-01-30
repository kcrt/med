import { Container, Title, Text, Stack, Paper, ThemeIcon, Badge } from "@mantine/core";
import { IconCalculator, IconHeartRateMonitor } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { getToppageMarkdown } from "@/lib/markdown";
import { HomeShareButton } from "@/components/HomeShareButton";
import packageJson from "@/../package.json";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const featuredContent = getToppageMarkdown(locale);

  return (
    <>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="md" align="center" ta="center">
              <ThemeIcon size={64} radius="xl" color="blue">
                <IconCalculator size={32} />
              </ThemeIcon>
              <Title order={1} textWrap="balance">{t("title")}</Title>
              <Badge variant="light" size="lg">v{packageJson.version}</Badge>
              <Text c="dimmed" size="lg" maw={500}>
                {t("description")}
              </Text>
            </Stack>
          </Paper>

          <Paper p="xl" radius="md" withBorder>
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: featuredContent }}
            />
          </Paper>
        </Stack>
      </Container>

      <HomeShareButton />
    </>
  );
}
