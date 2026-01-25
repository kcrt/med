import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["en", "ja"],

  // Used when no locale matches
  defaultLocale: "en",

  // Never show locale prefix in URL
  localePrefix: "never",

  // Detect locale from browser
  localeDetection: true,
});

export const config = {
  // Match all pathnames
  matcher: ["/", "/(ja|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
