import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useClipboard } from "../useClipboard";

describe("useClipboard", () => {
  // Mock clipboard API
  const mockWriteText = vi.fn();
  
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    mockWriteText.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should initially have copied as false", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
  });

  it("should copy text to clipboard and set copied to true", async () => {
    mockWriteText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard());

    let success = false;
    await act(async () => {
      success = await result.current.copy("test text");
    });

    expect(mockWriteText).toHaveBeenCalledWith("test text");
    expect(result.current.copied).toBe(true);
    expect(success).toBe(true);
  });

  it("should reset copied state after delay", async () => {
    vi.useFakeTimers();
    mockWriteText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard(1000));

    await act(async () => {
      await result.current.copy("test");
    });

    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });

  it("should handle clipboard errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockWriteText.mockRejectedValue(new Error("Clipboard error"));
    const { result } = renderHook(() => useClipboard());

    let success = false;
    await act(async () => {
      success = await result.current.copy("test");
    });

    expect(result.current.copied).toBe(false);
    expect(success).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should use custom reset delay", async () => {
    vi.useFakeTimers();
    mockWriteText.mockResolvedValue(undefined);
    const customDelay = 5000;
    const { result } = renderHook(() => useClipboard(customDelay));

    await act(async () => {
      await result.current.copy("test");
    });

    expect(result.current.copied).toBe(true);

    // Should still be true after shorter delay
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(true);

    // Should reset after custom delay
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });
});
