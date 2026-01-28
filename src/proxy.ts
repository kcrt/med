import createMiddleware from "next-intl/middleware";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./lib/locale";

export default createMiddleware({
  // A list of all locales that are supported
  locales: SUPPORTED_LOCALES,

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Always show locale prefix in URL for SEO
  localePrefix: "always",

  // Detect locale from browser
  localeDetection: true,
});

export const config = {
  // Match all pathnames except API routes and static files
  // Skip locale prefixes (e.g., /en, /ja) in the matcher
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
