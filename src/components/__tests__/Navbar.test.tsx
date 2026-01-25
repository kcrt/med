import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Navbar } from "../Navbar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === "config" && key === "title") return "Config";
    return key;
  },
  useLocale: () => "en",
}));

const { usePathname } = await import("next/navigation");

describe("Navbar", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  function renderWithProviders(ui: React.ReactElement) {
    return render(<MantineProvider>{ui}</MantineProvider>);
  }

  it("renders formula categories", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Body Structure Index")).toBeInTheDocument();
  });

  it("renders formula items within categories", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("BMI (Adult)")).toBeInTheDocument();
    expect(screen.getByText("BMI (Child)")).toBeInTheDocument();
  });

  it("renders config link", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Config")).toBeInTheDocument();
  });
});
