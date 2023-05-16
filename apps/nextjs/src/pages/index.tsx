import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>SubApp</title>
      </Head>
      <main className="bg-bgc flex h-screen flex-col items-center"></main>
    </>
  );
};

export default Home;
