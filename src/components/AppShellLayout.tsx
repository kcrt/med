"use client";

import { AppShell, Burger, Group, Text, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBurger, IconCup } from "@tabler/icons-react";
import { Navbar } from "./Navbar";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RightToolBar } from "./RightToolBar";
import { Link, usePathname } from "@/lib/navigation";
import { useDebugMode } from "@/contexts/DebugModeContext";

export function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const t = useTranslations("app");
  const { isDebug } = useDebugMode();

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
        <Group h="100%" px="md" pos="relative" justify="space-between">
          <Group>
            {isDebug ? (
              <ActionIcon
                onClick={toggle}
                hiddenFrom="sm"
                variant="subtle"
                size="lg"
              >
                {opened ? <IconCup size={20} /> : <IconBurger size={20} />}
              </ActionIcon>
            ) : (
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
            )}
            <Link href="/">
              <Text fw={700} size="xl" style={{ cursor: "pointer" }}>
                {t("title")}
              </Text>
            </Link>
          </Group>
          <RightToolBar />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
