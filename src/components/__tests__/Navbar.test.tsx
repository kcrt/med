import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { Navbar } from "../Navbar";

// Mock @/lib/navigation
vi.mock("@/lib/navigation", () => ({
  usePathname: vi.fn(),
  Link: "a",
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === "config" && key === "title") return "Config";
    if (namespace === "favorites" && key === "title") return "Favorites";
    if (namespace === "search") {
      if (key === "placeholder") return "Search formulas...";
      if (key === "noResults") return "No formulas found";
      if (key === "noResultsDescription") return "Try different keywords";
    }
    if (namespace === "formulas") {
      // Mock formula translations
      if (key === "bmi_adult.name") return "BMI (Adult)";
      if (key === "bmi_child.name") return "BMI (Child)";
      if (key === "target_height.name") return "Target Height";
      if (key === "bsa.name") return "Body Surface Area";
    }
    return key;
  },
  useLocale: () => "en",
  useMessages: () => ({
    labels: {},
    category: {},
  }),
}));

const { usePathname } = await import("@/lib/navigation");

describe("Navbar", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/");
  });

  function renderWithProviders(ui: React.ReactElement) {
    return render(<MantineProvider>{ui}</MantineProvider>);
  }

  it("renders search input", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByPlaceholderText("Search formulas...")).toBeInTheDocument();
  });

  it("renders favorites link", () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText("Favorites")).toBeInTheDocument();
  });

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
