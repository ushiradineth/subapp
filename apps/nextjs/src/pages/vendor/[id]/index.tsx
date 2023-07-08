import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { LinkIcon, UserCircle } from "lucide-react";
import { getSession } from "next-auth/react";

import { prisma, type Vendor } from "@acme/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Atoms/Avatar";
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

  const vendor = await prisma.vendor.findUnique({
    where: {
      id: context.params?.id as string,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!vendor) return { props: {} };

  if (session.user.id !== vendor?.id && session.user.role !== "Admin") {
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
      vendor: {
        ...vendor,
        createdAt: generalizeDate(vendor?.createdAt),
      },
      avatar: `${env.NEXT_PUBLIC_SUPABASE_URL}/${env.NEXT_PUBLIC_USER_ICON}/${vendor.id}/0.jpg`,
    },
  };
};

interface pageProps {
  vendor: Vendor & { _count: { products: number } };
  avatar: string;
}

export default function Vendor({ vendor, avatar }: pageProps) {
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <>
      <Head>
        <title>Vendor - {vendor.name}</title>
      </Head>
      <main className="flex flex-col justify-center gap-4 p-4">
        <div className="flex justify-center gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-12">
              <Avatar>
                <AvatarImage src={avatar} alt="Vendor Avatar" width={200} height={200} />
                <AvatarFallback>
                  <UserCircle width={200} height={200} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis text-xl font-semibold">{vendor.name}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Joined {String(vendor.createdAt)}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">{vendor._count.products} products on SubM</div>
                <Link
                  className="flex items-center gap-2 text-sm font-light text-gray-400"
                  href={`/product?search=${vendor.id}&showall=true`}>
                  <LinkIcon className="h-4 w-4" /> View all products by {vendor.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
