import type { GetServerSideProps } from "next";
import Head from "next/head";
import { PrivacyPolicy } from "../src/pages/Public/PrivacyPolicy";
import { buildCanonicalUrl } from "../src/config/site";
import { getPublicTaxonomy } from "../src/lib/serverApi";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Couponzas</title>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={buildCanonicalUrl("/privacy-policy")} />
        <meta property="og:url" content={buildCanonicalUrl("/privacy-policy")} />
      </Head>
      <PrivacyPolicy />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({
  props: { publicData: await getPublicTaxonomy() },
});
