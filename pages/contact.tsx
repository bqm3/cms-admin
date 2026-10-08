import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Contact } from "../src/pages/Public/Contact";
import { buildCanonicalUrl } from "../src/config/site";
import { getPublicTaxonomy } from "../src/lib/serverApi";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact - Couponzas</title>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={buildCanonicalUrl("/contact")} />
        <meta property="og:url" content={buildCanonicalUrl("/contact")} />
      </Head>
      <Contact />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({
  props: { publicData: await getPublicTaxonomy() },
});
