import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Index() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>Welcome - SubM</title>
        </Head>
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-200 sm:text-6xl">The Platform to enrich your subscription business</h1>
              <p className="mt-6 text-lg leading-8 text-gray-400">Promote your products on SubM and gain data and analytics into the subscription market, develop your business with us!</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/auth?register=true" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Get started
                </Link>
                <Link href="/learn" className="text-sm font-semibold leading-6 text-gray-500">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (session?.user.role === "Admin") {
    return (
      <>
        <Head>
          <title>Admin Dashboard - SubM</title>
        </Head>
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-auto max-w-2xl">Admin Dashboard TODO</div>
        </div>
      </>
    );
  }

  if (session?.user.role === "Vendor") {
    return (
      <>
        <Head>
          <title>Vendor Dashboard - SubM</title>
        </Head>
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-auto max-w-2xl">Vendor Dashboard TODO</div>
        </div>
      </>
    );
  }
}
