import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAutoSelectInput } from "../useAutoSelectInput";

describe("useAutoSelectInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return a ref object", () => {
    const { result } = renderHook(() => useAutoSelectInput(false));
    expect(result.current).toHaveProperty("current");
  });

  it("should not call select when isActive is false", () => {
    const { result } = renderHook(() => useAutoSelectInput(false));
    const mockSelect = vi.fn();
    
    // Attach mock input
    (result.current as any).current = { select: mockSelect };
    
    vi.advanceTimersByTime(100);
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("should call select when isActive becomes true", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useAutoSelectInput(active),
      { initialProps: { active: false } }
    );
    
    const mockSelect = vi.fn();
    (result.current as any).current = { select: mockSelect };

    // Change to active
    rerender({ active: true });
    
    // Advance time by default delay
    vi.advanceTimersByTime(50);
    
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it("should use custom delay", () => {
    const customDelay = 200;
    const { result, rerender } = renderHook(
      ({ active }) => useAutoSelectInput(active, customDelay),
      { initialProps: { active: false } }
    );
    
    const mockSelect = vi.fn();
    (result.current as any).current = { select: mockSelect };

    rerender({ active: true });
    
    // Should not call before custom delay
    vi.advanceTimersByTime(100);
    expect(mockSelect).not.toHaveBeenCalled();
    
    // Should call after custom delay
    vi.advanceTimersByTime(100);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it("should handle null ref gracefully", () => {
    const { rerender } = renderHook(
      ({ active }) => useAutoSelectInput(active),
      { initialProps: { active: false } }
    );
    
    // Change to active with null ref
    rerender({ active: true });
    vi.advanceTimersByTime(50);
    
    // Should not throw error
    expect(true).toBe(true);
  });

  it("should cleanup timer on unmount", () => {
    const { result, unmount, rerender } = renderHook(
      ({ active }) => useAutoSelectInput(active),
      { initialProps: { active: false } }
    );
    
    const mockSelect = vi.fn();
    (result.current as any).current = { select: mockSelect };

    rerender({ active: true });
    unmount();
    
    vi.advanceTimersByTime(50);
    
    // Should not call select after unmount
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("should cleanup and restart timer when isActive changes multiple times", () => {
    const { result, rerender } = renderHook(
      ({ active }) => useAutoSelectInput(active),
      { initialProps: { active: false } }
    );
    
    const mockSelect = vi.fn();
    (result.current as any).current = { select: mockSelect };

    // Activate
    rerender({ active: true });
    vi.advanceTimersByTime(25);
    
    // Deactivate before timer completes
    rerender({ active: false });
    vi.advanceTimersByTime(50);
    
    // Should not have called select
    expect(mockSelect).not.toHaveBeenCalled();
    
    // Activate again
    rerender({ active: true });
    vi.advanceTimersByTime(50);
    
    // Should call select once
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });
});
