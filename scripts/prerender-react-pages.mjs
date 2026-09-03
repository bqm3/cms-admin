import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const envFile = path.join(rootDir, ".env");
const previewPort = Number(process.env.PRERENDER_PORT || 5173);
const previewOrigin = `http://localhost:${previewPort}`;

async function loadEnvFile(filePath) {
  let raw;

  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return;
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

function normalizeBaseUrl(value, fallback) {
  return String(value || fallback || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

function normalizeApiBaseUrl(value, fallback) {
  const base = normalizeBaseUrl(value, fallback);
  return base.endsWith("/api") ? base : `${base}/api`;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAllPosts(apiBaseUrl) {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL(`${apiBaseUrl}/posts/public`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "50");

    const response = await fetchJson(url.toString());
    posts.push(...(response.posts || []));
    totalPages = Math.max(Number(response.pagination?.totalPages) || 1, 1);
    page += 1;
  }

  return posts;
}

async function fetchRoutes() {
  const apiBaseCandidates = Array.from(
    new Set([
      normalizeApiBaseUrl(process.env.VITE_API_BASE_URL || process.env.API_BASE_URL, "https://api.couponzas.com"),
      "https://api.couponzas.com/api",
    ]),
  );

  let lastError = null;
  for (const apiBaseUrl of apiBaseCandidates) {
    try {
      const posts = await fetchAllPosts(apiBaseUrl);
      return posts
        .map((post) => String(post.slug || "").trim())
        .filter(Boolean)
        .map((slug) => `/${encodeURIComponent(slug)}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to fetch public post routes");
}

async function waitForPreviewServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewOrigin);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  throw new Error(`Vite preview did not start at ${previewOrigin}`);
}

function startPreviewServer() {
  const viteBin = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
  const child = spawn(
    process.execPath,
    [viteBin, "preview", "--host", "localhost", "--port", String(previewPort), "--strictPort"],
    {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    },
  );

  child.stdout.on("data", (data) => process.stdout.write(`[vite-preview] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[vite-preview] ${data}`));

  return child;
}

function stopPreviewServer(child) {
  if (!child || child.killed) return;
  child.kill("SIGTERM");
}

async function writeRouteHtml(route, html) {
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  const outputFile = cleanRoute
    ? path.join(distDir, cleanRoute, "index.html")
    : path.join(distDir, "index.html");

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, html, "utf8");
}

async function main() {
  await loadEnvFile(envFile);

  const routes = await fetchRoutes();
  if (routes.length === 0) {
    console.warn("[prerender] no public post routes found");
    return;
  }

  const previewServer = startPreviewServer();
  let browser;

  try {
    await waitForPreviewServer();
    try {
      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
      });
    } catch (launchError) {
      console.warn(
        "\n[prerender] Warning: Could not launch Puppeteer Chrome for postbuild prerendering:\n",
        launchError.message || launchError,
        "\n[prerender] Skipping static file prerender pass. Dynamic serverless prerendering via /api/render remains active.\n",
      );
      return;
    }

    const page = await browser.newPage();
    page.setDefaultTimeout(25000);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      const resourceType = request.resourceType();
      const canSkip =
        /googletagmanager|google-analytics|doubleclick|clarity|facebook|hotjar/i.test(url) ||
        ["font", "media"].includes(resourceType);

      if (canSkip) {
        request.abort();
      } else {
        request.continue();
      }
    });

    let renderedCount = 0;
    for (const [index, route] of routes.entries()) {
      const url = `${previewOrigin}${route}?prerender=1`;
      if (index === 0 || index % 25 === 0) {
        console.log(`[prerender] rendering ${index + 1}/${routes.length} ${route}`);
      }
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForFunction(() => {
        const root = document.querySelector("#root");
        if (!root || !root.textContent) return false;
        const text = root.textContent.replace(/\s+/g, " ").trim();
        return text.length > 200 && !/^Loading\.\.\.$/.test(text);
      }, { timeout: 25000 });

      const html = await page.content();
      await writeRouteHtml(route, html);
      renderedCount += 1;

      if (renderedCount === 1 || renderedCount % 25 === 0 || renderedCount === routes.length) {
        console.log(`[prerender] ${renderedCount}/${routes.length} ${route}`);
      }
    }

    console.log(`[prerender] rendered ${renderedCount} React pages into dist`);
  } finally {
    if (browser) await browser.close();
    stopPreviewServer(previewServer);
  }
}

main().catch((error) => {
  console.warn("[prerender] warning:", error?.message || error);
  // Do not block build on prerender script error
  process.exit(0);
});
