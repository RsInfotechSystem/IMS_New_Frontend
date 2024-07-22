import Head from "next/head";
import Login from "./Login";
import CustomProvider from "../customProvider";

export default function Page() {
  return (
    <>
      <Head>
        <title>Login </title>
        <meta property="og:title" content="Login" key="title" />
      </Head>
      <CustomProvider>
        <Login />
      </CustomProvider>
    </>
  );
}
