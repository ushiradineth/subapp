import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Index() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>SubApp</title>
      </Head>
      <main className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold">Welcome to SubM</p>
          <p>Promote your business on our App</p>
          <p>Create an account and get started</p>
        </div>
      </main>
    </>
  );
}
