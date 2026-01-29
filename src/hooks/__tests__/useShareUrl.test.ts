import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useShareUrl } from "../useShareUrl";

describe("useShareUrl", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Mock window.location
    delete (global as any).window;
    (global as any).window = {
      location: {
        origin: "https://example.com",
        pathname: "/calculator/bmi",
      },
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("should return base URL when no input values provided", () => {
    const { result } = renderHook(() => useShareUrl());
    expect(result.current).toBe("https://example.com/calculator/bmi");
  });

  it("should return base URL when empty object provided", () => {
    const { result } = renderHook(() => useShareUrl({}));
    expect(result.current).toBe("https://example.com/calculator/bmi");
  });

  it("should build URL with query parameters", () => {
    const inputValues = { age: 25, weight: 70 };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toBe(
      "https://example.com/calculator/bmi?age=25&weight=70",
    );
  });

  it("should filter out null values", () => {
    const inputValues = { age: 25, weight: null, height: 180 };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toBe(
      "https://example.com/calculator/bmi?age=25&height=180",
    );
  });

  it("should filter out undefined values", () => {
    const inputValues = { age: 25, weight: undefined, height: 180 };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toBe(
      "https://example.com/calculator/bmi?age=25&height=180",
    );
  });

  it("should filter out empty string values", () => {
    const inputValues = { age: 25, name: "", height: 180 };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toBe(
      "https://example.com/calculator/bmi?age=25&height=180",
    );
  });

  it("should include boolean values", () => {
    const inputValues = { age: 25, isMale: true, hasCondition: false };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toContain("age=25");
    expect(result.current).toContain("isMale=true");
    expect(result.current).toContain("hasCondition=false");
  });

  it("should include zero values", () => {
    const inputValues = { age: 0, weight: 70 };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toBe(
      "https://example.com/calculator/bmi?age=0&weight=70",
    );
  });

  it("should handle Date objects by converting to string", () => {
    const date = new Date("2024-01-01");
    const inputValues = { date };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toContain("date=");
    expect(result.current).toContain("2024");
  });

  it("should properly encode special characters", () => {
    const inputValues = { name: "John Doe", condition: "A&B" };
    const { result } = renderHook(() => useShareUrl(inputValues));
    expect(result.current).toContain("name=John+Doe");
    expect(result.current).toContain("condition=A%26B");
  });
});
