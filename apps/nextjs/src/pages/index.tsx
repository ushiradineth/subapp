import React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Activity, Construction, FolderLock, LineChart } from "lucide-react";
import { useSession } from "next-auth/react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Index() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>Welcome - SubM</title>
        </Head>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mx-auto flex h-[calc(90vh)] max-w-2xl place-items-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-200 sm:text-6xl">
                The Platform to enrich your subscription business
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                Promote your products on SubM and gain data and analytics into the subscription market, develop your business with us!
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/auth?register=true"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Get started
                </Link>
                <Link href="/#learn" scroll={false} className="text-sm font-semibold leading-6 text-gray-500">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
          <div id="learn" className="flex min-h-screen flex-col items-center justify-center gap-24 p-12">
            <div className="flex w-full items-center justify-center">
              <div className="flex w-full flex-col">
                <div className="pr-4">
                  <h1 className="text-3xl font-bold">We connect Subscriptions, Consumers and Providers alike</h1>
                  <h2 className="text-2xl font-bold text-gray-400">Get close to your customers, with SubM.</h2>
                </div>
                <Link
                  href="/auth?register=true"
                  className="mt-4 w-fit rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Join us
                </Link>
              </div>
              <Image width={400} height={400} src="/favicon.ico" alt="SubM" />
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-12">
                <div>
                  <h1 className="text-3xl font-bold">Designed for businesses to succeed</h1>
                  <h2 className="text-2xl font-bold text-gray-400">
                    SubM provides a Platform for your business to grow, with the right analytics to make sure the business always stays on
                    the right path.
                  </h2>
                </div>
                <div className="grid-cols-[repeat(auto-fill, minmax(px,_1fr))] grid grid-flow-col grid-rows-2 gap-4">
                  <div className="ml-2 flex place-items-center gap-4">
                    <Activity />
                    <div>
                      <h1 className="text-xl font-bold">Real Time Analytics</h1>
                      <h2 className="font-bold text-gray-400">Get real time updates on your product.</h2>
                    </div>
                  </div>
                  <div className="ml-2 flex place-items-center gap-4">
                    <Construction />
                    <div>
                      <h1 className="text-xl font-bold">Unbiased Advertising</h1>
                      <h2 className="font-bold text-gray-400">Products are promoted based on users interests.</h2>
                    </div>
                  </div>
                  <div className="ml-2 flex place-items-center gap-4">
                    <FolderLock />
                    <div>
                      <h1 className="text-xl font-bold">Private Data</h1>
                      <h2 className="font-bold text-gray-400">All your data, including the user data, stays between us.</h2>
                    </div>
                  </div>
                  <div className="ml-2 flex place-items-center gap-4">
                    <LineChart />
                    <div>
                      <h1 className="text-xl font-bold">Growth opportunities</h1>
                      <h2 className="font-bold text-gray-400">Build your business with our platform</h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I start promoting my subscriptions?</AccordionTrigger>
                    <AccordionContent>
                      To get started, you will need to create an Account. Once you have created an account, you can create your products and
                      sell them.{" "}
                      <Link className="text-blue-300 hover:underline" href="/auth?register=true">
                        Click here to get started.
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do i sell products on SubM?</AccordionTrigger>
                    <AccordionContent>
                      SubM is a subscription management platform meant to promote and advertise products, not sell it.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I access analytics?</AccordionTrigger>
                    <AccordionContent>
                      Analytics can be seen on products pages and the dashboard it self, get started with SubM to track your product growth.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What if I have technical problems?</AccordionTrigger>
                    <AccordionContent>
                      If you have technical problems or suggestions to our service, you can contact us through{" "}
                      <Link className="text-blue-300 hover:underline" href="mailto:subapp.ud@gmail.com">
                        subapp.ud@gmail.com
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do i delete my products or tiers?</AccordionTrigger>
                    <AccordionContent>
                      You are not allowed to delete products or tiers as it will disrupt users who are using those products, contact us if
                      any issues arise.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
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
