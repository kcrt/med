"use client";

import { Card, Stack, Text, Anchor, Group, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

interface ReferenceLinksProps {
  ref?: Record<string, string> | null;
}

export function ReferenceLinks({ ref: references }: ReferenceLinksProps) {
  if (!references || Object.keys(references).length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="sm">
        <Group>
          <IconExternalLink size={16} />
          <Title order={4}>参照</Title>
        </Group>
        {Object.entries(references).map(([label, url]) => (
          <Anchor
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
          >
            {label}
          </Anchor>
        ))}
      </Stack>
    </Card>
  );
}
