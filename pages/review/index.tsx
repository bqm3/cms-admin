import type { GetServerSideProps } from "next";
import Head from "next/head";
import { PublicReviewListPage } from "../../src/pages/PublicReviewListPage";
import { buildCanonicalUrl } from "../../src/config/site";
import { getPublicTaxonomy, serverApiGet } from "../../src/lib/serverApi";

export default function ReviewList({ reviewData }: { reviewData: any }) {
  const canonical = buildCanonicalUrl("/review");
  return (
    <>
      <Head>
        <title>Reviews</title>
        <meta name="description" content="Review list" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
      </Head>
      <PublicReviewListPage initialData={reviewData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const publicData = await getPublicTaxonomy();
  const page = typeof query.page === "string" ? Number(query.page) || 1 : 1;
  const search = typeof query.search === "string" ? query.search : "";
  const response = await serverApiGet<any>("/reviews/public", {
    page,
    limit: 9,
    search,
  }).catch(() => ({ reviews: [], pagination: { page, totalPages: 1, total: 0, limit: 9 } }));

  return {
    props: {
      publicData,
      reviewData: {
        reviews: response.reviews || [],
        pagination: response.pagination || { page, totalPages: 1, total: 0, limit: 9 },
      },
    },
  };
};
