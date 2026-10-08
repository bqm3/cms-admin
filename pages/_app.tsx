import type { AppProps } from "next/app";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "../src/provider";
import { PublicDataInitialProvider } from "../src/context/PublicDataInitialContext";
import "../src/index.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HelmetProvider>
      <Provider>
        <PublicDataInitialProvider value={pageProps.publicData}>
          <Component {...pageProps} />
        </PublicDataInitialProvider>
      </Provider>
    </HelmetProvider>
  );
}
