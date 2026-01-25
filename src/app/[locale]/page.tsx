import {
  Button,
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
} from "@mantine/core";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={1}>{t("title")}</Title>
        <Text c="dimmed">{t("description")}</Text>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="sm">
            <Title order={3}>{t("card.title")}</Title>
            <Text>{t("card.description")}</Text>
            <Group>
              <Button variant="filled">Filled</Button>
              <Button variant="light">Light</Button>
              <Button variant="outline">Outline</Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
