import Head from "next/head";
import Login from "@/components/login";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getAuthCookie } from "@/utils/cookies";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = getAuthCookie();
    if (token) {
      router.replace("/");
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Login | Workwise</title>
        <meta name="description" content="Login to Workwise Admin Panel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Login />
    </>
  );
}
