/**
 * Favorites management utilities for storing and retrieving favorite formulas.
 * Uses browser localStorage to persist favorites across sessions.
 */

import { isBrowser } from "@/lib/environment";

const STORAGE_KEY = "med_favorites";

/**
 * Get list of favorited formula IDs from localStorage.
 *
 * @returns Array of formula IDs that have been favorited
 *
 * @example
 * const favorites = getFavorites();
 * // Returns: ["bmi_adult", "egfr_ckd_epi"]
 */
export function getFavorites(): string[] {
  // Return empty array if not in browser environment
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Validate that parsed data is an array of strings
    if (!Array.isArray(parsed)) {
      console.error("Invalid favorites data: not an array");
      return [];
    }

    // Filter out non-string values
    const validated = parsed.filter((item) => typeof item === "string");

    // If some items were filtered out, update storage
    if (validated.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    }

    return validated;
  } catch (error) {
    // Handle corrupted data or localStorage errors
    console.error("Error reading favorites from localStorage:", error);
    return [];
  }
}

/**
 * Toggle a formula's favorite status.
 * If the formula is already favorited, it will be removed.
 * If it's not favorited, it will be added.
 *
 * @param formulaId - The ID of the formula to toggle
 *
 * @example
 * toggleFavorite("bmi_adult");
 */
export function toggleFavorite(formulaId: string): void {
  if (!isBrowser()) return;

  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(formulaId);

    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
    } else {
      // Add to favorites
      favorites.push(formulaId);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("favoritesChanged", { detail: { favorites } }),
    );
  } catch (error) {
    console.error("Error saving favorites to localStorage:", error);
  }
}

/**
 * Check if a formula is currently favorited.
 *
 * @param formulaId - The ID of the formula to check
 * @returns true if the formula is favorited, false otherwise
 *
 * @example
 * if (isFavorite("bmi_adult")) {
 *   console.log("BMI formula is favorited!");
 * }
 */
export function isFavorite(formulaId: string): boolean {
  return getFavorites().includes(formulaId);
}
