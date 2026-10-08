import type { GetServerSideProps } from "next";
import Head from "next/head";
import { PublicReviewDetailPage } from "../../src/pages/PublicReviewDetailPage";
import { buildCanonicalUrl } from "../../src/config/site";
import { getPublicTaxonomy, serverApiGet } from "../../src/lib/serverApi";

export default function ReviewDetail({ reviewData }: { reviewData: any }) {
  const review = reviewData.review;
  const canonical = buildCanonicalUrl(`/review/${review.slug}`);
  const description = review.meta_description || String(review.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || review.title;
  const ogImage = review.img_bg?.startsWith("http") ? review.img_bg : review.img_bg ? `https://api.couponzas.com${review.img_bg}` : undefined;

  return (
    <>
      <Head>
        <title>{review.meta_title || review.title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={review.meta_keyword || review.title} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonical} />
        <meta property="og:url" content={canonical} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      </Head>
      <PublicReviewDetailPage initialData={reviewData} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const publicData = await getPublicTaxonomy();
  const slug = String(params?.slug || "");
  const review = await serverApiGet<any>(`/reviews/public/${slug}`).catch(() => null);

  if (!review) return { notFound: true };

  return {
    props: {
      publicData,
      reviewData: { review },
    },
  };
};
