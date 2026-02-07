import Layout from "../components/layout/index";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import MainLoading from "@/components/loading";
import Head from "next/head";
import "react-datepicker/dist/react-datepicker.css";

config.autoAddCss = false;

// Pages that should render without the dashboard layout
const noLayoutPages = ["/login"];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRouterReady, setIsRouterReady] = useState(false);

  const isNoLayoutPage = noLayoutPages.includes(router.pathname);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    if (router.isReady) {
      setIsRouterReady(true);
    }

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // Login page - no layout
  if (isNoLayoutPage) {
    return (
      <>
        <Head>
          <title>Login | Workwise</title>
        </Head>
        {loading && <MainLoading />}
        <Provider store={store}>
          {isRouterReady && <Component {...pageProps} />}
        </Provider>
      </>
    );
  }

  // Protected pages - with dashboard layout
  return (
    <>
      <Head>
        <title>Dashboard | Workwise</title>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
          crossOrigin="anonymous"
        ></script>
      </Head>
      {loading && <MainLoading />}
      <Provider store={store}>
        <Layout>{isRouterReady && <Component {...pageProps} />}</Layout>
      </Provider>
    </>
  );
}
