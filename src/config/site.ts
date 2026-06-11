export const PUBLIC_SITE_URL =
  (import.meta.env.VITE_PUBLIC_SITE_URL || "https://couponzas.com").replace(/\/+$/, "");

export const PUBLIC_SITE_HOST = new URL(PUBLIC_SITE_URL).hostname;
