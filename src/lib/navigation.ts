/**
 * Locale-aware navigation utilities.
 * Provides Link, redirect, useRouter, and usePathname that automatically handle locale prefixes.
 */

import { createNavigation } from "next-intl/navigation";
import { SUPPORTED_LOCALES } from "./locale";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: SUPPORTED_LOCALES,
});
