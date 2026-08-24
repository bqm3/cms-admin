import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputFile = path.join(rootDir, "public", "sitemap.xml");
const envFile = path.join(rootDir, ".env");

async function loadEnvFile(filePath) {
  let raw;

  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function normalizeBaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildFallbackSitemap(siteUrl) {
  const origin = normalizeBaseUrl(siteUrl) || "https://couponzas.com";
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    `<url><loc>${escapeXml(`${origin}/`)}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>` +
    `</urlset>`
  );
}

async function fetchSitemap(sourceUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(sourceUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const body = await response.text();
    if (!body.includes("<urlset")) {
      throw new Error("response did not look like a sitemap XML document");
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  await loadEnvFile(envFile);
  await mkdir(path.dirname(outputFile), { recursive: true });

  const sourceBase = normalizeBaseUrl(
    process.env.SITEMAP_SOURCE_URL ||
      process.env.VITE_API_BASE_URL ||
      process.env.API_BASE_URL ||
      "https://api.couponzas.com",
  );
  const sitemapUrl = `${sourceBase}/sitemap.xml`;

  let sitemapXml;
  try {
    sitemapXml = await fetchSitemap(sitemapUrl);
    console.log(`[generate-sitemap] fetched ${sitemapUrl}`);
  } catch (error) {
    sitemapXml = buildFallbackSitemap(process.env.VITE_PUBLIC_SITE_URL || "https://couponzas.com");
    console.warn(
      `[generate-sitemap] using fallback sitemap because ${sitemapUrl} could not be fetched: ${error?.message || error}`,
    );
  }

  await writeFile(outputFile, sitemapXml, "utf8");
  console.log(`[generate-sitemap] wrote ${path.relative(rootDir, outputFile)}`);
}

main().catch((error) => {
  console.error("[generate-sitemap] failed:", error);
  process.exit(1);
});
