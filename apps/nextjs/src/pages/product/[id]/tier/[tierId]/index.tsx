import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { BadgeCheck, LinkIcon, XCircle } from "lucide-react";
import { getSession } from "next-auth/react";

import { supabase } from "@acme/api/src/lib/supabase";
import { prisma, type Tier } from "@acme/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { env } from "~/env.mjs";
import { generalizeDate } from "~/lib/utils";

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
    },
  });

  if (session.user.id !== tier?.product.vendor?.id && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const { data: avatarFolder } = await supabase.storage.from(env.NEXT_PUBLIC_PRODUCT_IMAGE).list(tier?.productId, { limit: 1 });

  let logo = "";

  if (avatarFolder) {
    const { data } = supabase.storage.from(env.NEXT_PUBLIC_PRODUCT_IMAGE).getPublicUrl(`${tier?.productId}/${avatarFolder[0]?.name}`);
    logo = data.publicUrl;
  }

  return {
    props: {
      tier: {
        ...tier,
        createdAt: generalizeDate(tier?.createdAt),
      },
      logo,
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
  };
  logo: string;
}

export default function Tier({ tier, logo }: pageProps) {
  return (
    <>
      <Head>
        <title>Tier - {tier.name}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="mb-12 flex items-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-8 ">
              <Avatar>
                <AvatarImage src={logo} alt="Vendor Avatar" width={100} height={100} />
                <AvatarFallback>
                  <XCircle width={100} height={100} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="flex max-w-[200px] items-center gap-2 overflow-hidden truncate text-ellipsis text-xl font-semibold">{tier.name}</div>
                <div className="verflow-hidden max-w-[200px] truncate text-ellipsis text-sm">
                  {tier.product.name} by {tier.product.vendor.name}
                </div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Joined {String(tier.createdAt)}</div>
                <Link className="flex items-center gap-2 text-sm font-light text-gray-400" href={"/product/" + tier.productId}>
                  <LinkIcon className="h-4 w-4" /> View product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
