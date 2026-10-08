import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Term } from "../src/pages/Public/Term";
import { buildCanonicalUrl } from "../src/config/site";
import { getPublicTaxonomy } from "../src/lib/serverApi";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms - Couponzas</title>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={buildCanonicalUrl("/terms")} />
        <meta property="og:url" content={buildCanonicalUrl("/terms")} />
      </Head>
      <Term />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({
  props: { publicData: await getPublicTaxonomy() },
});
