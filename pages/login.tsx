import Head from "next/head";
import { LoginPage } from "../src/pages/LoginPage";
import { buildCanonicalUrl } from "../src/config/site";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login | Couponzas</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <link rel="canonical" href={buildCanonicalUrl("/login")} />
      </Head>
      <LoginPage />
    </>
  );
}
