export function getSiteUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  if (configuredUrl && !configuredUrl.includes(".vercel.app")) return configuredUrl;
  return "https://www.gaia2016.com";
}
