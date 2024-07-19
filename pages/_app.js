import Layout from "../components/layout/index";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import AuthLayout from "@/components/auth/auth-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "react-toastify/dist/ReactToastify.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { Provider, useSelector } from "react-redux";
import { store } from "@/app/store";
import MainLoading from "@/components/loading";
import Head from "next/head";
import "react-datepicker/dist/react-datepicker.css";

config.autoAddCss = false;
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isLogin, setisLogin] = useState("");
  const [loading, setLoading] = useState(false);

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

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);
  useEffect(() => {
    setisLogin(localStorage.getItem("token"));
  }, [router]);
  if (isLogin != "" && isLogin != null) {
    return (
      <>
      <Head>
        <title>Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" 
     integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" 
     crossorigin="anonymous"></script>
      </Head>
        {loading && <MainLoading />}
        <Provider store={store}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>Login</title>
        </Head>
        {loading && <MainLoading />}
        <Provider store={store}>
          <AuthLayout></AuthLayout>;
        </Provider>
      </>
    );
  }
}
