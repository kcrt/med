import createMiddleware from "next-intl/middleware";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./lib/locale";

export default createMiddleware({
  // A list of all locales that are supported
  locales: SUPPORTED_LOCALES,

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Never show locale prefix in URL
  localePrefix: "never",

  // Detect locale from browser
  localeDetection: true,
});

export const config = {
  // Match all pathnames except API routes and static files
  matcher: ["/", "/(ja|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
