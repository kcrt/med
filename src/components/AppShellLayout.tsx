"use client";

import { AppShell, Badge, Burger, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Navbar } from "./Navbar";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useDebug } from "@/lib/use-debug";
import { DevModeBar } from "./DevModeBar";
import { Link, usePathname } from "@/lib/navigation";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const t = useTranslations("app");
  const isDebug = useDebug();

  // Close mobile navbar when route changes
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" pos="relative">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Link href="/">
            <Text fw={700} size="xl" style={{ cursor: "pointer" }}>
              {t("title")}
            </Text>
          </Link>
          {isDebug && (
            <div className="dev-mode-toolbar">
              <DevModeBar />
              <Badge className="mr-4" color="red" size="lg" radius="sm">
                DEV MODE
              </Badge>
            </div>
          )}
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
