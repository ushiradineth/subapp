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
      <main className="flex flex-col items-center">
       
       <p>Email: {session?.user.email}</p>
       <p>Role: {session?.user.role}</p>
      </main>
    </>
  );
};

export default Home;
