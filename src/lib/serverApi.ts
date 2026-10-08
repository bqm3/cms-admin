const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "https://api.couponzas.com";
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(rawBaseUrl);
const effectiveBaseUrl =
  process.env.NODE_ENV === "production" && isLocalApiUrl
    ? "https://api.couponzas.com"
    : rawBaseUrl;

export const SERVER_API_BASE_URL = effectiveBaseUrl.endsWith("/api")
  ? effectiveBaseUrl
  : `${effectiveBaseUrl}/api`;

export async function serverApiGet<T = any>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${SERVER_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`GET ${url.pathname} failed with ${response.status}`);
  }

  return response.json();
}

export async function getPublicTaxonomy() {
  const [catRes, parentRes] = await Promise.all([
    serverApiGet<any>("/categories").catch(() => ({})),
    serverApiGet<any>("/parent-categories").catch(() => ({})),
  ]);

  return {
    categories: catRes.categories || catRes || [],
    parentCategories: parentRes.parentCategories || parentRes || [],
  };
}
