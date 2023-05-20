import type { NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>SubApp</title>
      </Head>
      <main className="bg-bgc flex flex-col items-center text-white">
       
        Email: {session?.user.email}
      </main>
    </>
  );
};

export default Home;
