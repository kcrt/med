"use client";

import { Card, Stack, Text, Anchor, Group, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

interface ReferenceLinksProps {
  ref?: Record<string, string> | null;
}

type RefType = "doi" | "pmid" | "isbn" | "url";

function parseReference(refValue: string): { url: string; type: RefType } {
  const trimmed = refValue.trim();

  // DOI format: doi:10.1093/ndt/gfm517
  if (trimmed.toLowerCase().startsWith("doi:")) {
    const doi = trimmed.slice(4).trim();
    return { url: `https://doi.org/${doi}`, type: "doi" };
  }

  // PubMed ID format: pmid:11234459
  const pmidMatch = trimmed.match(/^pmid:(\d+)$/i);
  if (pmidMatch) {
    const pmid = pmidMatch[1];
    return { url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, type: "pmid" };
  }

  // ISBN format: isbn:978-0-262-13472-9 or isbn:9780262134727
  const isbnMatch = trimmed.match(/^isbn:(.+)$/i);
  if (isbnMatch) {
    const isbn = isbnMatch[1].trim().replace(/[\s-]/g, "");
    return { url: `https://worldcat.org/isbn/${isbn}`, type: "isbn" };
  }

  // Default: treat as direct URL
  return { url: trimmed, type: "url" };
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
          <Title order={4}>Reference</Title>
        </Group>
        {Object.entries(references).map(([label, url]) => {
          if (url.trim() === "") {
            // Reference without link - display as plain text
            return <Text key={label} size="sm">{label}</Text>;
          }
          const { url: href } = parseReference(url);
          return (
            <Anchor
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              {label}
            </Anchor>
          );
        })}
      </Stack>
    </Card>
  );
}
