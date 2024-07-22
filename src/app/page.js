"use client";
import { Fragment } from "react";
import Head from "next/head";
import Login from "./login/Login";
import CustomProvider from "./customProvider";

export default function Page() {
  return (
    <Fragment>
      <Head>
        <title>Login </title>
        <meta property="og:title" content="Login" key="title" />
      </Head>
      <CustomProvider>
        <Login />
      </CustomProvider>
    </Fragment>
  );
}
