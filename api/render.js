const fs = require("fs");
const path = require("path");

const PUBLIC_SITE_URL = (process.env.VITE_PUBLIC_SITE_URL || "https://couponzas.com").replace(/\/+$/, "");

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

function titleCase(str = "") {
  return String(str || "")
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function buildAutoMetaFromTitle(titleRaw) {
  const t = String(titleRaw || "").trim();
  if (!t) {
    return {
      meta_title: "Store Coupons & Discount Codes | Couponza",
      meta_description: "Find the latest verified discount codes, coupons, and promo codes at couponzas.com.",
      meta_keyword: "coupons, discount codes, promo codes, deals",
    };
  }
  const meta_title = `${t} Promotion & Verified Coupon Codes | Couponza`;
  const meta_description = `Use couponzas.com to find the latest discount codes and best deals when shopping online at ${t}. Save more on every order with verified promo codes and cashback offers.`;
  const meta_keyword = `${t}, ${t} promotion, ${t} coupon codes, ${t} discount code`;
  return { meta_title, meta_description, meta_keyword };
}

function buildCanonicalUrl(pathname = "/") {
  const cleanPath = `/${String(pathname || "/")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")}`;

  return cleanPath === "/" ? `${PUBLIC_SITE_URL}/` : `${PUBLIC_SITE_URL}${cleanPath}`;
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
    const rawUrlPath = (req.url || "/").split("?")[0].replace(/^\/+|\/+$/g, "");
    let slug = (req.query.slug || "").toString().trim();
    if (!slug && rawUrlPath) {
      slug = rawUrlPath;
    }

    const routeType = (req.query.route || "").toString().trim().toLowerCase();
    const htmlTemplate = getIndexHtmlTemplate();
    const backendApiUrl = process.env.VITE_SERVER_URL || "https://api.couponzas.com";

    // 1. System Admin / Auth Routes
    if (STATIC_ADMIN_ROUTES.has(slug.toLowerCase())) {
      const headTags = `
        <title>${slug === "login" ? "Login | Couponza" : "Admin Dashboard | Couponza"}</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <link rel="canonical" href="${escHtml(buildCanonicalUrl(slug))}" />
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, ""));
    }

    // 2. Static Public Pages
    if (STATIC_PUBLIC_PAGES[slug.toLowerCase()] && !routeType) {
      const pageInfo = STATIC_PUBLIC_PAGES[slug.toLowerCase()];
      const headTags = `
        <title>${escHtml(pageInfo.title)}</title>
        <meta name="description" content="${escHtml(pageInfo.description)}" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="${escHtml(buildCanonicalUrl(slug))}" />
        <meta property="og:title" content="${escHtml(pageInfo.title)}" />
        <meta property="og:description" content="${escHtml(pageInfo.description)}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${escHtml(buildCanonicalUrl(slug))}" />
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, ""));
    }

    // 3. Category Routes (/category/*)
    if (routeType === "category" || rawUrlPath.startsWith("category/")) {
      const catPath = (req.query.path || rawUrlPath.replace(/^category\/?/, "") || "").toString();
      const parts = catPath.split("/").filter(Boolean);
      const targetSlug = parts[parts.length - 1] || "All Categories";
      const catTitle = titleCase(targetSlug);

      const metaTitle = `${catTitle} Coupons, Promo Codes & Discount Deals | Couponza`;
      const metaDescription = `Browse verified ${catTitle} coupon codes, promo codes, and daily deals to save more on couponzas.com.`;
      const canonicalUrl = buildCanonicalUrl(rawUrlPath || `category/${catPath}`);

      const headTags = `
        <title>${escHtml(metaTitle)}</title>
        <meta name="description" content="${escHtml(metaDescription)}" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="${escHtml(canonicalUrl)}" />
        <meta property="og:title" content="${escHtml(metaTitle)}" />
        <meta property="og:description" content="${escHtml(metaDescription)}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${escHtml(canonicalUrl)}" />
      `;

      const bodyContent = `
        <div style="max-width: 1180px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
          <header style="margin-bottom: 24px;">
            <a href="${escHtml(buildCanonicalUrl("/"))}" style="font-weight: bold; color: #ee4d2d; text-decoration: none;">Home</a> &gt; 
            <a href="${escHtml(buildCanonicalUrl("/category"))}" style="color: #64748b; text-decoration: none;">Categories</a> &gt; 
            <span>${escHtml(catTitle)}</span>
          </header>
          <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 16px; color: #0f172a;">${escHtml(catTitle)} Coupon Codes & Deals</h1>
          <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">${escHtml(metaDescription)}</p>
        </div>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, bodyContent));
    }

    // 4. Review Routes (/review/:slug)
    if (routeType === "review" || rawUrlPath.startsWith("review/")) {
      const revSlug = slug.replace(/^review\/?/, "");
      const apiEndpoint = `${backendApiUrl.replace(/\/+$/, "")}/api/reviews/public/${encodeURIComponent(revSlug)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let apiRes = null;
      try {
        apiRes = await fetch(apiEndpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
      } catch (e) {
        console.error(`Review API Fetch Error for slug "${revSlug}":`, e?.message);
      } finally {
        clearTimeout(timeoutId);
      }

      if (apiRes && apiRes.ok) {
        const review = await apiRes.json();
        const titleRaw = review.title || titleCase(revSlug);
        const metaTitle = review.meta_title || `${titleRaw} Review & Guide | Couponza`;
        const metaDescription = truncate(review.meta_description || stripTags(review.content) || metaTitle, 160);
        const canonicalUrl = buildCanonicalUrl(`review/${revSlug}`);

        const headTags = `
          <title>${escHtml(metaTitle)}</title>
          <meta name="description" content="${escHtml(metaDescription)}" />
          <meta name="robots" content="index,follow" />
          <link rel="canonical" href="${escHtml(canonicalUrl)}" />
          <meta property="og:title" content="${escHtml(metaTitle)}" />
          <meta property="og:description" content="${escHtml(metaDescription)}" />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="${escHtml(canonicalUrl)}" />
        `;

        const bodyContent = `
          <div style="max-width: 1180px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
            <header style="margin-bottom: 24px;">
              <a href="${escHtml(buildCanonicalUrl("/"))}" style="font-weight: bold; color: #ee4d2d; text-decoration: none;">Home</a> &gt; 
              <a href="${escHtml(buildCanonicalUrl("/review"))}" style="color: #64748b; text-decoration: none;">Reviews</a> &gt; 
              <span>${escHtml(titleRaw)}</span>
            </header>
            <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 16px; color: #0f172a;">${escHtml(titleRaw)}</h1>
            <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">${escHtml(metaDescription)}</p>
          </div>
        `;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(injectHeadAndBody(htmlTemplate, headTags, bodyContent));
      }

      if (apiRes && apiRes.status === 404) {
        // Genuine 404
        const notFoundTitle = "404 - Review Not Found | Couponza";
        const headTags404 = `<title>${escHtml(notFoundTitle)}</title><meta name="robots" content="noindex,nofollow" />`;
        return res.status(404).send(injectHeadAndBody(htmlTemplate, headTags404, ""));
      }

      // Fallback 200 for timeout / network issues
      const fallbackTitle = `${titleCase(revSlug)} Review | Couponza`;
      const fallbackDesc = `Read in-depth reviews and user feedback for ${titleCase(revSlug)} on couponzas.com.`;
      const canonicalUrl = buildCanonicalUrl(`review/${revSlug}`);
      const headTagsFallback = `
        <title>${escHtml(fallbackTitle)}</title>
        <meta name="description" content="${escHtml(fallbackDesc)}" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="${escHtml(canonicalUrl)}" />
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(injectHeadAndBody(htmlTemplate, headTagsFallback, ""));
    }

    // 5. Post / Project Pages (Dynamic fetch from Backend API)
    const apiEndpoint = `${backendApiUrl.replace(/\/+$/, "")}/api/posts/public/${encodeURIComponent(slug)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let apiRes = null;
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
      const titleRaw = post.title || titleCase(slug);
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

      const canonicalUrl = buildCanonicalUrl(encodeURIComponent(slug));

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
        <div style="max-width: 1180px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
          <header style="margin-bottom: 24px;">
            <a href="${escHtml(buildCanonicalUrl("/"))}" style="font-weight: bold; color: #ee4d2d; text-decoration: none;">Home</a> &gt; 
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

    // Only return explicit 404 if API confirmed HTTP 404
    if (apiRes && apiRes.status === 404) {
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
          <a href="${escHtml(buildCanonicalUrl("/"))}" style="display: inline-block; background-color: #ee4d2d; color: #ffffff; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none;">Return to Homepage</a>
        </div>
      `;

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(404).send(injectHeadAndBody(htmlTemplate, headTags404, bodyContent404));
    }

    // Fallback 200 OK for API timeout / server network delay so Googlebot doesn't deindex the page
    const titleRaw = titleCase(slug);
    const autoMeta = buildAutoMetaFromTitle(titleRaw);
    const canonicalUrl = buildCanonicalUrl(encodeURIComponent(slug));

    const headTagsFallback = `
      <title>${escHtml(autoMeta.meta_title)}</title>
      <meta name="description" content="${escHtml(autoMeta.meta_description)}" />
      <meta name="keywords" content="${escHtml(autoMeta.meta_keyword)}" />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href="${escHtml(canonicalUrl)}" />
    `;

    const bodyContentFallback = `
      <div style="max-width: 1180px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b;">
        <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 16px; color: #0f172a;">${escHtml(titleRaw)}</h1>
        <p style="font-size: 1.1rem; color: #475569; margin-bottom: 24px;">${escHtml(autoMeta.meta_description)}</p>
      </div>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(injectHeadAndBody(htmlTemplate, headTagsFallback, bodyContentFallback));

  } catch (err) {
    console.error("Render Handler Error:", err);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(500).send("Server Error");
  }
};
