import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import moment from "moment";
import { getSession } from "next-auth/react";

import { prisma, type Subscription } from "@acme/db";

import PageNumbers from "~/components/Atoms/PageNumbers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
import { formalizeDate } from "~/lib/utils";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const search = context.query.search ? (context.query.search as string).split(" ").join(" | ") : "";

  const searchQuery = {
    OR: [
      { product: { OR: [{ id: { search } }, { name: { search } }] } },
      { user: { OR: [{ id: { search } }, { name: { search } }] } },
      { tier: { OR: [{ id: { search } }, { name: { search } }] } },
    ],
  };

  const filter = {
    product: {
      name: {
        not: undefined,
      },
    },
  };

  const where =
    search !== ""
      ? session.user.role === "Admin"
        ? { ...searchQuery, ...filter }
        : {
            product: {
              name: {
                not: undefined,
              },
              vendorId: { equals: session?.user.id },
            },
            ...searchQuery,
          }
      : session.user.role === "Admin"
      ? { ...filter }
      : {
          product: {
            name: {
              not: undefined,
            },
            vendorId: { equals: session?.user.id },
          },
        };

  const subscriptions = await prisma.subscription.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    include: {
      tier: {
        select: {
          name: true,
          price: true,
          period: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
      template: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const count = await prisma.subscription.count({ where });

  const total = await prisma.subscription.count();

  return {
    props: {
      subscriptions: subscriptions.map((subscription) => ({
        ...subscription,
        createdAt: formalizeDate(subscription.createdAt),
        startedAt: formalizeDate(subscription.startedAt),
        deletedAt: subscription.deletedAt ? formalizeDate(subscription.deletedAt) : null,
        total:
          Math.floor(
            moment(subscription?.active ? moment.now() : subscription?.deletedAt).diff(subscription?.startedAt, "days", false) /
              (subscription?.tier.period ?? 1),
          ) * subscription.tier.price,
      })),
      count,
      total,
    },
  };
};

interface SubscriptionType extends Subscription {
  tier: {
    name: string;
    price: number;
  };
  product: {
    name: string;
  };
  template: {
    name: string;
  };
  user: {
    name: string;
  };
  total: number;
}

interface pageProps {
  subscriptions: SubscriptionType[];
  count: number;
  total: number;
}

export default function Subscriptions({ subscriptions, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);

  return (
    <>
      <Head>
        <title>Subscriptions {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>A list of all subscriptions.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for subscriptions"
              path={router.asPath}
              params={router.query}
              count={count}
            />
          </CardHeader>
          <CardContent>
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">User</TableHead>
                  <TableHead className="text-center">Product</TableHead>
                  <TableHead className="text-center">Tier</TableHead>
                  <TableHead className="text-center">Subscribed At</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Total Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length !== 0 ? (
                  subscriptions.map((subscription, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          <Link href={`/user/${subscription.userId}`}>{subscription.user.name}</Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {subscription.product ? (
                            <Link href={`/product/${subscription.productId}`}>{subscription.product.name}</Link>
                          ) : (
                            subscription.template.name
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {subscription.product ? (
                            <Link href={`/product/${subscription.productId}/tier/${subscription.tierId}`}>{subscription.tier.name}</Link>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">{subscription.startedAt.toString()}</TableCell>
                        <TableCell className="text-center">{subscription.active ? "Active" : "Deleted"}</TableCell>
                        <TableCell className="text-center">${subscription.total}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>
                <p>Currently, a total of {total} Subscriptions are on SubM</p>
              </TableCaption>
            </Table>
          </CardContent>
          {count !== 0 && count > ITEMS_PER_PAGE && (
            <CardFooter className="flex justify-center">
              <TableCaption>
                <PageNumbers
                  count={count}
                  itemsPerPage={ITEMS_PER_PAGE}
                  pageNumber={pageNumber}
                  path={router.asPath}
                  params={router.query}
                />
              </TableCaption>
            </CardFooter>
          )}
        </Card>
      </main>
    </>
  );
}
