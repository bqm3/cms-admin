const fs = require("fs");
const path = require("path");

function escHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripTags(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(str = "", max = 160) {
  const s = String(str).trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function buildAutoMetaFromTitle(titleRaw) {
  const t = String(titleRaw || "").trim();
  if (!t) {
    return {
      meta_title: "Store",
      meta_description: "Store",
      meta_keyword: "Store",
    };
  }
  const meta_title = `${t} promotion latest`;
  const meta_description = `Use couponzas.com to find the latest discount codes and best deals when shopping online at ${t} through couponzas.com. Save more on every order with our verified discount codes, food coupons, and cashback offers.`;
  const meta_keyword = `${t}, ${t} promotion, ${t} promotion newest`;
  return { meta_title, meta_description, meta_keyword };
}

function getIndexHtmlTemplate() {
  const possiblePaths = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf8");
    }
  }
  // Fallback html shell if file reading fails
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/couponzas_logo.png" />
  <!-- SEO_TAGS_PLACEHOLDER -->
</head>
<body>
  <div id="root"><!-- BODY_PLACEHOLDER --></div>
</body>
</html>`;
}

function injectHeadAndBody(htmlTemplate, headTags, bodyContent) {
  let html = htmlTemplate;

  // Replace default title and meta tags if present
  html = html.replace(/<title>.*?<\/title>/gi, "");
  html = html.replace(/<meta\s+name=["']description["'].*?>/gi, "");
  html = html.replace(/<meta\s+name=["']keywords["'].*?>/gi, "");
  html = html.replace(/<meta\s+name=["']robots["'].*?>/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'].*?>/gi, "");
  html = html.replace(/<meta\s+property=["']og:.*?["'].*?>/gi, "");
  html = html.replace(/<meta\s+name=["']twitter:.*?["'].*?>/gi, "");

  // Insert custom head tags
  if (html.includes("<!-- SEO_TAGS_PLACEHOLDER -->")) {
    html = html.replace("<!-- SEO_TAGS_PLACEHOLDER -->", headTags);
  } else {
    html = html.replace("</head>", `${headTags}\n</head>`);
  }

  // Insert body content into #root
  if (bodyContent) {
    if (html.includes("<!-- BODY_PLACEHOLDER -->")) {
      html = html.replace("<!-- BODY_PLACEHOLDER -->", bodyContent);
    } else {
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root">${bodyContent}</div>`,
      );
    }
  }

  return html;
}

const STATIC_ADMIN_ROUTES = new Set([
  "login",
  "dashboard",
  "editor",
  "module",
  "categories",
  "parent-categories",
  "users",
  "sheets",
  "media",
  "footer-links",
  "reviews",
  "featured-deals",
  "banners",
  "template-dashboard",
  "template-editor",
  "preview",
  "new-page-test",
]);

const STATIC_PUBLIC_PAGES = {
  "privacy-policy": {
    title: "Privacy Policy | Couponza",
    description: "Read the Privacy Policy for couponzas.com to learn how we handle your data.",
  },
  terms: {
    title: "Terms of Service | Couponza",
    description: "Read the Terms of Service for couponzas.com.",
  },
  "about-us": {
    title: "About Us | Couponza",
    description: "Learn more about couponzas.com, your trusted source for verified coupons and deals.",
  },
  contact: {
    title: "Contact Us | Couponza",
    description: "Get in touch with couponzas.com team for inquiries or feedback.",
  },
  review: {
    title: "Reviews & Recommendations | Couponza",
    description: "Explore in-depth product reviews, store recommendations, and savings guides.",
  },
  category: {
    title: "Explore Categories & Store Deals | Couponza",
    description: "Browse deals and discount coupons by store category on couponzas.com.",
  },
};

module.exports = async function handler(req, res) {
  try {
    // Determine slug from request
    let slug = (req.query.slug || "").toString().trim();
    if (!slug) {
      const urlPath = (req.url || "/").split("?")[0].replace(/^\/+|\/+$/g, "");
      slug = urlPath;
    }

    const htmlTemplate = getIndexHtmlTemplate();

    // 1. System Admin / Auth Routes
    if (STATIC_ADMIN_ROUTES.has(slug.toLowerCase())) {
      const headTags = `
        <title>${slug === "login" ? "Login | Couponza" : "Admin Dashboard | Couponza"}</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <link rel="canonical" href="https://couponzas.com/${escHtml(slug)}" />
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, ""));
    }

    // 2. Static Public Pages
    if (STATIC_PUBLIC_PAGES[slug.toLowerCase()]) {
      const pageInfo = STATIC_PUBLIC_PAGES[slug.toLowerCase()];
      const headTags = `
        <title>${escHtml(pageInfo.title)}</title>
        <meta name="description" content="${escHtml(pageInfo.description)}" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://couponzas.com/${escHtml(slug)}" />
        <meta property="og:title" content="${escHtml(pageInfo.title)}" />
        <meta property="og:description" content="${escHtml(pageInfo.description)}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://couponzas.com/${escHtml(slug)}" />
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, ""));
    }

    // 3. Post / Project Pages (Dynamic fetch from Backend API)
    const backendApiUrl = process.env.VITE_SERVER_URL || "https://api.couponzas.com";
    const apiEndpoint = `${backendApiUrl.replace(/\/+$/, "")}/api/posts/public/${encodeURIComponent(slug)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let apiRes;
    try {
      apiRes = await fetch(apiEndpoint, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
    } catch (e) {
      console.error(`API Fetch Error for slug "${slug}":`, e?.message);
    } finally {
      clearTimeout(timeoutId);
    }

    // If Post Found (HTTP 200)
    if (apiRes && apiRes.ok) {
      const post = await apiRes.json();
      const titleRaw = post.title || "Store";
      const autoMeta = buildAutoMetaFromTitle(titleRaw);
      const override = post.meta_override === true || post.meta_override === "true" || post.meta_override === 1;

      const metaTitle = override
        ? (String(post.meta_title || "").trim() || autoMeta.meta_title)
        : autoMeta.meta_title;

      const metaDescRaw = override
        ? (String(post.meta_description || "").trim() || autoMeta.meta_description)
        : autoMeta.meta_description;

      const contentSnippet = stripTags(typeof post.content === "string" ? post.content : "");
      const metaDescription = truncate(metaDescRaw || contentSnippet || metaTitle, 160);
      const metaKeywords = override
        ? (String(post.meta_keyword || "").trim() || autoMeta.meta_keyword)
        : autoMeta.meta_keyword;

      const canonicalUrl = `https://couponzas.com/${encodeURIComponent(slug)}`;

      let ogImage = post.logo ? post.logo : "";
      if (ogImage && !ogImage.startsWith("http")) {
        ogImage = `${backendApiUrl.replace(/\/+$/, "")}${ogImage}`;
      }

      const headTags = `
        <title>${escHtml(metaTitle)}</title>
        <meta name="description" content="${escHtml(metaDescription)}" />
        <meta name="keywords" content="${escHtml(metaKeywords)}" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="${escHtml(canonicalUrl)}" />

        <meta property="og:type" content="article" />
        <meta property="og:title" content="${escHtml(metaTitle)}" />
        <meta property="og:description" content="${escHtml(metaDescription)}" />
        <meta property="og:url" content="${escHtml(canonicalUrl)}" />
        ${ogImage ? `<meta property="og:image" content="${escHtml(ogImage)}" />` : ""}
        <meta property="og:site_name" content="couponzas.com" />

        <meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}" />
        <meta name="twitter:title" content="${escHtml(metaTitle)}" />
        <meta name="twitter:description" content="${escHtml(metaDescription)}" />
        ${ogImage ? `<meta name="twitter:image" content="${escHtml(ogImage)}" />` : ""}
      `;

      const bodyContent = `
        <div style="max-w-[1180px]; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
          <header style="margin-bottom: 24px;">
            <a href="https://couponzas.com/" style="font-weight: bold; color: #ee4d2d; text-decoration: none;">Home</a> &gt; 
            <span>${escHtml(titleRaw)}</span>
          </header>
          <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 16px; color: #0f172a;">${escHtml(titleRaw)}</h1>
          <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">${escHtml(metaDescription)}</p>
          
          <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;">${escHtml(titleRaw)} Coupon Codes & Promo Codes - Complete Savings Guide</h2>
            <p>${escHtml(titleRaw)} offers great savings for online shoppers. At couponzas.com, we track and verify the latest promo codes and coupons daily so you always find working deals.</p>
          </section>
        </div>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, bodyContent));
    }

    // If Post Not Found or deleted (HTTP 404)
    const notFoundTitle = "404 - Page Not Found | Couponza";
    const notFoundDesc = `The requested project or page "${slug}" does not exist on couponzas.com.`;
    const headTags404 = `
      <title>${escHtml(notFoundTitle)}</title>
      <meta name="description" content="${escHtml(notFoundDesc)}" />
      <meta name="robots" content="noindex,nofollow" />
    `;

    const bodyContent404 = `
      <div style="max-width: 600px; margin: 80px auto; padding: 32px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="font-size: 2.5rem; font-weight: 900; color: #1e293b; margin-bottom: 16px;">404 - Page Not Found</h1>
        <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 24px;">The project or page "<strong>${escHtml(slug)}</strong>" does not exist or has been removed.</p>
        <a href="https://couponzas.com/" style="display: inline-block; background-color: #ee4d2d; color: #ffffff; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none;">Return to Homepage</a>
      </div>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(404).send(injectHeadAndBody(htmlTemplate, headTags404, bodyContent404));

  } catch (err) {
    console.error("Render Handler Error:", err);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(500).send("Server Error");
  }
};
