import type { GetServerSideProps } from "next";
import Head from "next/head";
import { AboutUs } from "../src/pages/Public/AboutUs";
import { buildCanonicalUrl } from "../src/config/site";
import { getPublicTaxonomy } from "../src/lib/serverApi";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - Couponzas</title>
        <meta name="description" content="Welcome to Couponzas, your trusted partner in navigating the vast world of digital commerce." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={buildCanonicalUrl("/about-us")} />
        <meta property="og:url" content={buildCanonicalUrl("/about-us")} />
      </Head>
      <AboutUs />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({
  props: { publicData: await getPublicTaxonomy() },
});
