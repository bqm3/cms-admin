const env = typeof process !== "undefined" ? process.env : {};
const viteEnv =
  typeof import.meta !== "undefined" && (import.meta as any).env
    ? (import.meta as any).env
    : {};

const configuredSiteUrl = (
  env.NEXT_PUBLIC_SITE_URL ||
  viteEnv.VITE_PUBLIC_SITE_URL ||
  ""
).replace(/\/+$/, "");
const isLocalSiteUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredSiteUrl);

export const PUBLIC_SITE_URL =
  ((env.NODE_ENV === "production" || viteEnv.PROD) && isLocalSiteUrl
    ? "https://couponzas.com"
    : configuredSiteUrl || "https://couponzas.com").replace(/\/+$/, "");

export const PUBLIC_SITE_HOST = new URL(PUBLIC_SITE_URL).hostname;

export function buildCanonicalUrl(pathname = "/") {
  const cleanPath = `/${String(pathname || "/")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")}`;

  return cleanPath === "/" ? `${PUBLIC_SITE_URL}/` : `${PUBLIC_SITE_URL}${cleanPath}`;
}
