
/**
 * Custom hook for building shareable URLs with query parameters.
 *
 * Generates a URL based on the current page path with input values
 * encoded as query parameters. Filters out null, undefined, and empty values.
 *
 * Note: The URL is regenerated on each render due to object reference changes in inputValues.
 * This is acceptable since URL building is inexpensive.
 *
 * @param inputValues - Object containing input values to encode as query params
 * @returns The complete shareable URL
 *
 * @example
 * ```tsx
 * const inputValues = { age: 25, weight: 70 };
 * const shareUrl = useShareUrl(inputValues);
 * // Returns: "https://example.com/calculator?age=25&weight=70"
 * ```
 */
export function useShareUrl(
  inputValues: Record<string, number | string | boolean | Date | null> = {},
): string {
  // Check if window is available (client-side only)
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(inputValues)) {
    if (value !== null && value !== "" && value !== undefined) {
      params.append(key, String(value));
    }
  }

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
