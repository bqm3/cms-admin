import type { GetServerSideProps } from "next";
import Head from "next/head";
import { ClientCategoryPage } from "../../../src/pages/ClientCategoryPage";
import { PUBLIC_SITE_HOST, buildCanonicalUrl } from "../../../src/config/site";
import { getPublicTaxonomy, serverApiGet } from "../../../src/lib/serverApi";

export default function CategoryPage({ categoryData }: { categoryData: any }) {
  const brandName = categoryData?.brandName || "Couponzas";
  const title = `${brandName} promotion latest`;
  const description = `Use ${PUBLIC_SITE_HOST} to find the latest discount codes and best deals when shopping online at ${brandName}. Save more on every order with our verified discount codes, food coupons, and cashback offers.`;
  const canonical = buildCanonicalUrl(categoryData?.canonicalPath || "/category");

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`${brandName}, ${brandName.toLowerCase()} promotion, ${brandName.toLowerCase()} promotion newest`} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
      </Head>
      <ClientCategoryPage initialData={categoryData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const publicData = await getPublicTaxonomy();
  const parentSlug = params?.parentSlug ? String(params.parentSlug) : "";
  const search = typeof query.search === "string" ? query.search : "";
  const page = typeof query.page === "string" ? Number(query.page) || 1 : 1;

  const path = parentSlug ? `/posts/public/catalog/${parentSlug}` : "/posts/public";
  const response = await serverApiGet<any>(path, {
    sort: "created_at:DESC",
    search,
    page,
    limit: 12,
  }).catch(() => ({ posts: [], pagination: { totalPages: 1, total: 0 } }));

  const parentName =
    publicData.parentCategories.find((p: any) => String(p.slug) === parentSlug)?.name || "Couponzas";

  return {
    props: {
      publicData,
      categoryData: {
        posts: response.posts || response || [],
        pagination: response.pagination || { totalPages: 1, total: response.length || 0 },
        brandName: parentName,
        canonicalPath: parentSlug ? `/category/${parentSlug}` : "/category",
      },
    },
  };
};
