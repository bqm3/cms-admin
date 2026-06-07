/* eslint-disable prettier/prettier */
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Editor, Frame } from "@craftjs/core";
import { Helmet } from "react-helmet-async";
import api, { SERVER_URL } from "../services/api";
import { CRAFT_RESOLVER } from "../components/Editor/Craft/craftResolver";
import { usePublicData } from "../hooks/usePublicData";
import { PublicFooter } from "../components/Public/PublicFooter";
import { PublicHeader } from "../components/Public/PublicHeader";

// ✅ Import tất cả component mà editor có thể sinh ra trong content
import { DefaultNewPostFrame } from "../components/Editor/DefaultNewPostFrame";
import { MimicPCLandingFrame } from "../components/Editor/MimicPCLandingFrame";
import { PortfolioTemplate } from "../components/Editor/PortfolioTemplate";
import { BlogTemplate } from "../components/Editor/BlogTemplate";
import { ServiceTemplate } from "../components/Editor/ServiceTemplate";
import { ContactTemplate } from "../components/Editor/ContactTemplate";
import { ProductTemplate } from "../components/Editor/ProductTemplate";
import { StoreCouponTemplate } from "../components/Editor/StoreCouponTemplate";

// Craft components
import { TextComponent } from "../components/Editor/Craft/Components/TextComponent";
import { Container } from "../components/Editor/Craft/Components/Container";
import { ButtonComponent } from "../components/Editor/Craft/Components/ButtonComponent";
import { ImageComponent } from "../components/Editor/Craft/Components/ImageComponent";
import { HeadingComponent } from "../components/Editor/Craft/Components/HeadingComponent";
import { CardComponent } from "../components/Editor/Craft/Components/CardComponent";
import { VideoComponent } from "../components/Editor/Craft/Components/VideoComponent";
import { TableComponent } from "../components/Editor/Craft/Components/TableComponent";
import { ShapeComponent } from "../components/Editor/Craft/Components/ShapeComponent";
import { RowComponent } from "../components/Editor/Craft/Components/RowComponent";
import { ColumnComponent } from "../components/Editor/Craft/Components/ColumnComponent";
import { ScriptComponent } from "../components/Editor/Craft/Components/ScriptComponent";

// ✅ Các component bạn từng dùng trong EditorPage
import { NavbarComponent } from "../components/Editor/Craft/Components/NavbarComponent";
import { SectionComponent } from "../components/Editor/Craft/Components/SectionComponent";
import { GridComponent } from "../components/Editor/Craft/Components/GridComponent";
import { BadgeComponent } from "../components/Editor/Craft/Components/BadgeComponent";
import { AccordionComponent } from "../components/Editor/Craft/Components/AccordionComponent";
import { SpacerComponent } from "../components/Editor/Craft/Components/SpacerComponent";
import { SliderComponent } from "@/components/Editor/Craft/Components/SliderComponent";
import { TiptapComponent } from "../components/Editor/Craft/Components/TiptapComponent";
import { PresetFAQ } from "@/components/Editor/Craft/presets/PresetFAQ";
import { PresetFooter } from "@/components/Editor/Craft/presets/PresetFooter";
import { PresetHeader } from "@/components/Editor/Craft/presets/PresetHeader";
import { PresetHero } from "@/components/Editor/Craft/presets/PresetHero";
import { PresetOffersGrid } from "@/components/Editor/Craft/presets/PresetOffersGrid";
import { InputComponent } from "@/components/Editor/Craft/Components/InputComponent";
import { PopupModalComponent } from "@/components/Editor/Craft/Components/PopupModalComponent";
import { PopupOfferComponent } from "@/components/Editor/Craft/Components/PopupOfferComponent";
import { StoreCouponModuleView } from "../components/Public/StoreCouponModuleView";
import type { StoreCouponModuleData } from "../components/Public/StoreCouponModuleView";


function stripHtmlToText(html: string) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

function truncate(s: string, max = 160) {
  const x = (s || "").trim();
  if (x.length <= max) return x;
  return x.slice(0, max - 1).trimEnd() + "…";
}

function toBool(v: any) {
  return v === true || v === "true" || v === "1" || v === 1;
}

function parseStoreCouponModule(content: string | null | undefined) {
  if (!content) return null;
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    if (parsed?.pageType !== "store_coupon_module_v1") return null;
    return parsed;
  } catch {
    return null;
  }
}

// ✅ Auto meta giống backend
function buildAutoMetaFromTitle(titleRaw: string) {
  const t = String(titleRaw || "").trim();
  if (!t) {
    return {
      meta_title: "Store",
      meta_description: "Store",
      meta_keyword: "Store",
    };
  }

  const meta_title = `${t} promotion latest`;
  const meta_description =
    `Use Globalpromotionllc.com to find the latest discount codes and best deals when shopping ` +
    `online at ${t} through Globalpromotionllc.com. Save more on every order with our verified discount codes, ` +
    `food coupons, and cashback offers.`;

  const meta_keyword = `${t}, ${t} promotion, ${t} promotion newest`;

  return { meta_title, meta_description, meta_keyword };
}

function getSiteBrandFromHostname(hostname: string) {
  const cleanHost = hostname.replace(/^www\./i, "").trim();
  if (!cleanHost) return "site";
  return cleanHost.split(".")[0] || cleanHost;
}

function PublicCouponGuideBlocks({
  brandName,
  siteBrand,
}: {
  brandName: string;
  siteBrand: string;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 mt-6 pb-6 md:px-6 md:pb-8">
      <div className="grid gap-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Intro</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            {brandName} Coupon Codes & Promo Codes - Complete Savings Guide
          </h2>
          <div className="prose prose-slate mt-4 max-w-none text-sm leading-7 text-slate-700">
            <p>
              {brandName} is a trusted online retailer offering a wide selection of quality products at competitive prices.
              Whether you are a first-time visitor or a returning customer, using verified {brandName} coupon codes and promo
              codes is the smartest way to get more value from every order. At {siteBrand}, we track and verify the latest{" "}
              {brandName} discount codes daily so you always find working deals before you checkout.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">How to use a coupon code</h2>
          <ol className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-700">
            <li>Select a coupon from the list above.</li>
            <li>Click Shop Now to visit the store page.</li>
            <li>Add products to your cart as usual.</li>
            <li>Paste the coupon code at checkout and apply.</li>
          </ol>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Questions & Answers</h2>
          <div className="mt-4 space-y-3">
            {[
              {
                q: "How do I use this coupon code?",
                a: 'Simply click "Shop Now", copy the coupon code, then apply it at checkout on the store page.',
              },
              {
                q: "Why doesn't my coupon work?",
                a: "Some coupons require a minimum order value, specific products, or may have expired. Please double-check the terms before checkout.",
              },
              {
                q: "Can I use more than one coupon?",
                a: "Most stores allow only one coupon per order. Combining multiple offers is usually not supported.",
              },
              {
                q: "Do you earn a commission from these deals?",
                a: "Yes, we may earn a small commission when you make a purchase through our links, at no extra cost to you.",
              },
            ].map((item) => (
              <details key={item.q} className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-bold text-slate-900">
                  <span>{item.q}</span>
                  <span className="text-lg font-black text-slate-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pr-6 text-sm leading-7 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <h2 className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Policies & notes</h2>
          <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-slate-700">
            <li>Some coupons may require a minimum order value.</li>
            <li>Validity and conditions may change without notice.</li>
            <li>Please double-check your discount before checkout.</li>
            <li>We may earn a commission when you shop through our links.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export function PublicPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories, parentCategories } = usePublicData();

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState(5);
  const hasFetched = useRef(false);
  const [articleTitle, setArticleTitle] = useState("Store");

  const [seo, setSeo] = useState<{
    title: string;
    description: string;
    keywords: string;
    canonical: string;
    ogImage?: string;
    robots: string;
  }>({
    title: "Store",
    description: "Store",
    keywords: "Store",
    canonical: typeof window !== "undefined" ? window.location.href : "",
    robots: "index,follow",
  });

  const moduleData = useMemo(() => parseStoreCouponModule(content), [content]);

  useEffect(() => {
    const fetchPost = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const preview = searchParams.get("preview");
        const response = await api.get(`/posts/public/${slug}`, {
          params: { preview },
        });

        const post = response.data;
        const moduleContent = parseStoreCouponModule(post.content);

        const titleRaw = post.title ?? "Store";
        setArticleTitle(titleRaw);
        const override = toBool(post.meta_override);

        // ✅ SEO meta: override => dùng DB, không override => auto theo title
        const autoMeta = buildAutoMetaFromTitle(titleRaw);

        const metaTitle = override
          ? String(post.meta_title || "").trim() || autoMeta.meta_title
          : autoMeta.meta_title;

        const metaDesc = override
          ? String(post.meta_description || "").trim() || autoMeta.meta_description
          : autoMeta.meta_description;

        const metaKeywords = override
          ? String(post.meta_keyword || "").trim() || autoMeta.meta_keyword
          : autoMeta.meta_keyword;

        // ✅ fallback nếu metaDesc trống quá: dùng text content
        const rawContent = post.content ?? "";
        const contentText = moduleContent
          ? stripHtmlToText(
              moduleContent.aboutHtml || moduleContent.heroSubtitle || moduleContent.aboutSubtitle || "",
            )
          : typeof rawContent === "string"
            ? stripHtmlToText(rawContent)
            : "";
        const finalDesc = truncate(metaDesc || contentText || metaTitle, 160);

        // OG Image
        const ogImageRaw = moduleContent?.logoUrl || moduleContent?.projectImageUrl || moduleContent?.heroImageUrl || post.logo || "";
        const ogImage = ogImageRaw
          ? ogImageRaw.startsWith("http")
            ? ogImageRaw
            : `${SERVER_URL}${ogImageRaw}`
          : undefined;

        // canonical (bỏ query)
        const canonical = window.location.origin + window.location.pathname;

        // robots: preview => noindex
        const robots = preview ? "noindex,nofollow" : "index,follow";

        setContent(post.content);
        document.title = metaTitle;

        setSeo({
          title: metaTitle,
          description: finalDesc,
          keywords: metaKeywords,
          canonical,
          ogImage,
          robots,
        });
      } catch (err) {
        console.error(err);
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, searchParams]);


  const frameData = useMemo(() => {
    if (!content || moduleData) return null;

    let parsed: any = content;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch {
        return null;
      }
    }

    if (parsed?.nodes && typeof parsed.nodes === "object") return parsed.nodes;
    return parsed;
  }, [content, moduleData]);

  useEffect(() => {
    if (!loading && !frameData && !moduleData) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, frameData, moduleData, navigate]);

  const navigateToCategory = (parentId: string, categoryId: string) => {
    let url = `/category/${parentId}`;
    if (categoryId) url += `/${categoryId}`;
    navigate(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (moduleData) {
    return (
      <div className="min-h-screen bg-[#f4f4f6]">
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta name="keywords" content={seo.keywords} />
          <meta name="robots" content={seo.robots} />
          <link rel="canonical" href={seo.canonical} />
          {seo.ogImage ? <meta property="og:image" content={seo.ogImage} /> : null}
        </Helmet>

        <PublicHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          parentCategories={parentCategories}
          categories={categories}
        />

        <StoreCouponModuleView data={moduleData as StoreCouponModuleData} />
        <PublicCouponGuideBlocks
          brandName={articleTitle}
          siteBrand={getSiteBrandFromHostname(window.location.hostname)}
        />

        <PublicFooter
          parentCategories={parentCategories}
          categories={categories}
          onCategoryClick={navigateToCategory}
        />
      </div>
    );
  }

  if (loading)
    return (
      <div className="text-slate-400 h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#21294a]/10 border-t-[#21294a] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest">
          Loading...
        </p>
      </div>
    );

  if (!frameData)
    return (
      <div className="text-slate-400 h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center overflow-hidden">
        <p className="text-3xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter leading-tight md:leading-none">
          The project does not exist
        </p>
        <p className="text-base sm:text-2xl md:text-3xl text-slate-500 font-semibold leading-relaxed">
          Automatically returning to the homepage in{" "}
          <span className="text-[#21294a] font-black text-3xl md:text-5xl inline-block min-w-[1.5em]">
            {countdown}
          </span>{" "}
          seconds...
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#21294a] text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-2xl shadow-[#21294a]/30 hover:scale-105 transition-all active:scale-95 uppercase tracking-wide mt-4"
        >
          Return to homepage now
        </button>
      </div>
    );

  return (
    <div className="min-h-screen p-0 m-0 bg-white">
      <Helmet prioritizeSeoTags>
        {/* Basic */}
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <link rel="canonical" href={seo.canonical} />
        <meta name="robots" content={seo.robots} />

        {/* OpenGraph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonical} />
        {seo.ogImage ? <meta property="og:image" content={seo.ogImage} /> : null}
        {/* optional */}
        <meta property="og:site_name" content="Globalpromotionllc.com" />

        {/* Twitter */}
        <meta name="twitter:card" content={seo.ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.ogImage ? <meta name="twitter:image" content={seo.ogImage} /> : null}
      </Helmet>

      <PublicHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        parentCategories={parentCategories}
        categories={categories}
      />

      <Editor
        enabled={false}
        resolver={CRAFT_RESOLVER}
      >
        <Frame data={frameData} />
      </Editor>

      <PublicCouponGuideBlocks
        brandName={articleTitle}
        siteBrand={getSiteBrandFromHostname(window.location.hostname)}
      />

      <PublicFooter
        parentCategories={parentCategories}
        categories={categories}
        onCategoryClick={navigateToCategory}
      />
    </div>
  );
}
