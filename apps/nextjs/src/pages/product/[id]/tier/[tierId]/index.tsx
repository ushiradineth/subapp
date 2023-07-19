import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { LinkIcon, XCircle } from "lucide-react";
import { getSession } from "next-auth/react";

import { prisma, type Tier } from "@acme/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Atoms/Avatar";
import { Card } from "~/components/Molecules/Card";
import { env } from "~/env.mjs";
import { generalizeDate } from "~/lib/utils";

const PERIODS = [
  { period: 1, label: "Day" },
  { period: 7, label: "Week" },
  { period: 28, label: "Month" },
  { period: 365, label: "Year" },
];

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

  const tier = await prisma.tier.findUnique({
    where: {
      id: context.params?.tierId as string,
    },
    include: {
      product: {
        select: {
          name: true,
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          subscriptions: {
            where: {
              active: true,
            },
          },
        },
      },
    },
  });

  if (!tier || tier.productId !== context.query.id) return { props: {} };

  if (session.user.id !== tier?.product?.vendor?.id && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {
      tier: {
        ...tier,
        createdAt: generalizeDate(tier?.createdAt),
      },
      logo: `${env.NEXT_PUBLIC_SUPABASE_URL}/${env.NEXT_PUBLIC_PRODUCT_LOGO}/${tier.productId}/0.jpg`,
    },
  };
};

interface pageProps {
  tier: Tier & {
    product: {
      name: string;
      vendor: {
        name: string;
      };
    };
    _count: {
      subscriptions: number;
    };
  };
  logo: string;
}

export default function TierPage({ tier, logo }: pageProps) {
  if (!tier) return <div>Tier not found</div>;

  return (
    <>
      <Head>
        <title>Tier - {tier.name}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <Card className="flex flex-col justify-center gap-4 p-4">
          <div className="grid grid-flow-row grid-cols-3 gap-4">
            <div className="col-span-2 flex h-fit items-center justify-center gap-8 rounded-2xl border p-8">
              <Avatar>
                <AvatarImage src={logo} alt="Vendor Avatar" width={100} height={100} />
                <AvatarFallback>
                  <XCircle width={100} height={100} />
                </AvatarFallback>
              </Avatar>
              <div className="grid max-w-[400px] grid-flow-row gap-3">
                <div className="flex items-center gap-2 overflow-hidden truncate text-ellipsis text-xl font-semibold">{tier.name}</div>
                <div className="overflow-hidden truncate text-ellipsis text-sm">
                  {tier.product.name} by {tier.product.vendor.name}
                </div>
                <div className="overflow-hidden truncate text-ellipsis font-semibold">Created {String(tier.createdAt)}</div>
                <Link className="flex items-center gap-2 text-sm font-light text-gray-400" href={`/product/${tier.productId}`}>
                  <LinkIcon className="h-4 w-4" /> View product
                </Link>
              </div>
            </div>
            <div className="col-span-1 flex w-full flex-col items-center justify-center rounded-2xl border p-8 text-xl">
              <p>
                ${tier.price} per {PERIODS.find((p) => p.period === tier.period)?.label}
              </p>
              <p>{tier._count.subscriptions} Concurrent subscriptions</p>
            </div>
          </div>
          <div className="rounded-2xl border p-8">
            <div className="text-lg font-semibold">About {tier.name}</div>
            <div className={"mr-2 grid max-w-[800px] grid-flow-col break-all"}>{tier.description}</div>
            <ul className="mx-8 mt-2 list-disc">
              {tier.points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </Card>
      </main>
    </>
  );
}
