import type { GetServerSideProps } from "next";
import Head from "next/head";
import { PublicPostPage } from "../src/pages/PublicPostPage";
import { buildCanonicalUrl } from "../src/config/site";
import { getPublicTaxonomy, SERVER_API_BASE_URL, serverApiGet } from "../src/lib/serverApi";

function stripHtmlToText(html: string) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max = 160) {
  const text = String(value || "").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}...`;
}

function toBool(value: any) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function parseStoreCouponModule(content: any) {
  if (!content) return null;
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed?.pageType === "store_coupon_module_v1" ? parsed : null;
  } catch {
    return null;
  }
}

function buildAutoMetaFromTitle(titleRaw: string) {
  const title = String(titleRaw || "").trim() || "Store";
  return {
    meta_title: `${title} promotion latest`,
    meta_description:
      `Use couponzas.com to find the latest discount codes and best deals when shopping ` +
      `online at ${title} through couponzas.com. Save more on every order with our verified discount codes, ` +
      `food coupons, and cashback offers.`,
    meta_keyword: `${title}, ${title} promotion, ${title} promotion newest`,
  };
}

function absoluteAssetUrl(value: string | undefined) {
  if (!value) return undefined;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `${SERVER_API_BASE_URL.replace(/\/api$/, "")}${value}`;
}

function buildPostSeo(post: any, slug: string) {
  const moduleContent = parseStoreCouponModule(post.content);
  const titleRaw = post.title || "Store";
  const override = toBool(post.meta_override);
  const autoMeta = buildAutoMetaFromTitle(titleRaw);

  const title = override
    ? String(post.meta_title || "").trim() || autoMeta.meta_title
    : autoMeta.meta_title;
  const descriptionSource = override
    ? String(post.meta_description || "").trim() || autoMeta.meta_description
    : autoMeta.meta_description;
  const keywords = override
    ? String(post.meta_keyword || "").trim() || autoMeta.meta_keyword
    : autoMeta.meta_keyword;

  const contentText = moduleContent
    ? stripHtmlToText(moduleContent.aboutHtml || moduleContent.heroSubtitle || moduleContent.aboutSubtitle || "")
    : stripHtmlToText(typeof post.content === "string" ? post.content : "");

  return {
    title,
    description: truncate(descriptionSource || contentText || title, 160),
    keywords,
    canonical: buildCanonicalUrl(slug ? `/${slug}` : "/"),
    robots: "index,follow",
    ogImage: absoluteAssetUrl(
      moduleContent?.logoUrl || moduleContent?.projectImageUrl || moduleContent?.heroImageUrl || post.logo || "",
    ),
  };
}

export default function StorePage({ postData }: { postData: any }) {
  const seo = postData.seo;
  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content={seo.robots} />
        <link rel="canonical" href={seo.canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonical} />
        <meta property="og:site_name" content="couponzas.com" />
        {seo.ogImage ? <meta property="og:image" content={seo.ogImage} /> : null}
        <meta name="twitter:card" content={seo.ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.ogImage ? <meta name="twitter:image" content={seo.ogImage} /> : null}
      </Head>
      <PublicPostPage initialData={postData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const slug = String(params?.slug || "");
  const publicData = await getPublicTaxonomy();
  const post = await serverApiGet<any>(`/posts/public/${slug}`, {
    preview: typeof query.preview === "string" ? query.preview : undefined,
  }).catch(() => null);

  if (!post) return { notFound: true };

  return {
    props: {
      publicData,
      postData: {
        post,
        seo: buildPostSeo(post, slug),
      },
    },
  };
};
