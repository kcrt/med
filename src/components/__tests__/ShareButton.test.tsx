import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { ShareButton } from "../ShareButton";
import type { Formula } from "@/types/formula";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    if (namespace === "share" && key === "buttonLabel") return "Share";
    return key;
  },
}));

describe("ShareButton", () => {
  const mockFormula: Formula = {
    name: "Test Formula",
    description: "Test description",
    input: {
      age: {
        type: "int",
        label: "Age",
      },
    },
    output: {
      result: {
        label: "Result",
        formula: "age * 2",
      },
    },
  };

  function renderWithProviders(ui: React.ReactElement) {
    return render(<MantineProvider>{ui}</MantineProvider>);
  }

  it("renders share button when there are valid inputs", () => {
    const inputValues = { age: 25 };
    renderWithProviders(
      <ShareButton formula={mockFormula} inputValues={inputValues} />,
    );

    expect(screen.getByLabelText("Share")).toBeInTheDocument();
  });

  it("does not render share button when there are no inputs", () => {
    const inputValues = {};
    renderWithProviders(
      <ShareButton formula={mockFormula} inputValues={inputValues} />,
    );

    expect(screen.queryByLabelText("Share")).not.toBeInTheDocument();
  });

  it("does not render share button for non-calculation formulas", () => {
    const infoFormula: Formula = {
      name: "Info Formula",
      description: "Just info",
    };
    const inputValues = { age: 25 };
    renderWithProviders(
      <ShareButton formula={infoFormula} inputValues={inputValues} />,
    );

    expect(screen.queryByLabelText("Share")).not.toBeInTheDocument();
  });

  it("handles null and undefined input values correctly", () => {
    const inputValues = { age: null, weight: undefined };
    renderWithProviders(
      <ShareButton formula={mockFormula} inputValues={inputValues} />,
    );

    // Should not render because all values are null or undefined
    expect(screen.queryByLabelText("Share")).not.toBeInTheDocument();
  });

  it("renders with zero as a valid input value", () => {
    const inputValues = { age: 0 };
    renderWithProviders(
      <ShareButton formula={mockFormula} inputValues={inputValues} />,
    );

    expect(screen.getByLabelText("Share")).toBeInTheDocument();
  });
});
