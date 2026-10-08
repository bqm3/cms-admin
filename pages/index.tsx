import type { GetServerSideProps } from "next";
import Head from "next/head";
import { ClientHomePage } from "../src/pages/ClientHomePage";
import { buildCanonicalUrl } from "../src/config/site";
import { getPublicTaxonomy, serverApiGet } from "../src/lib/serverApi";

export default function HomePage({ homeData }: { homeData: any }) {
  const title = "Couponzas - Verified Discount Codes, Coupons & Best Deals | couponzas.com";
  const description =
    "Find verified discount codes, coupons, and promo codes on couponzas.com. Save more on every online purchase across top stores with daily tested deals.";
  const canonical = buildCanonicalUrl("/");

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="couponzas, couponzas.com, Couponzas, promo codes, discount codes, coupons, online deals, vouchers" />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Couponzas - Verified Discount Codes & Promo Deals | couponzas.com" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="Couponzas" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ClientHomePage initialData={homeData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const publicData = await getPublicTaxonomy();
  const activeParents = publicData.parentCategories.filter((p: any) => !p?.is_deleted);

  const [latestPostsRes, featuredDealsRes, latestReviewsRes, bannersRes, groupedResults] =
    await Promise.all([
      serverApiGet<any>("/posts/public", { limit: 8, sort: "created_at:DESC" }).catch(() => ({})),
      serverApiGet<any>("/featured-deals/public").catch(() => ({})),
      serverApiGet<any>("/reviews/public", { limit: 3 }).catch(() => ({})),
      serverApiGet<any>("/banners/public").catch(() => ({})),
      Promise.all(
        activeParents.map((pc: any) =>
          serverApiGet<any>(`/posts/public/catalog/${pc.slug || pc.id}`, {
            limit: 8,
            sort: "created_at:DESC",
          }).catch(() => ({ posts: [] })),
        ),
      ),
    ]);

  const groupedPosts: Record<string, any[]> = {};
  activeParents.forEach((pc: any, index: number) => {
    groupedPosts[pc.slug || pc.id] = groupedResults[index]?.posts || [];
  });

  return {
    props: {
      publicData,
      homeData: {
        groupedPosts,
        latestPosts: latestPostsRes.posts || [],
        featuredDeals: featuredDealsRes.deals || [],
        latestReviews: latestReviewsRes.reviews || [],
        banners: bannersRes.banners || [],
      },
    },
  };
};
