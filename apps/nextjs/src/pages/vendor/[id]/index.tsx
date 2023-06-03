import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { BadgeCheck, LinkIcon, UserCircle2 } from "lucide-react";
import { getSession } from "next-auth/react";

import { supabase } from "@acme/api/src/lib/supabase";
import { prisma, type Vendor } from "@acme/db";

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

  const vendor = await prisma.vendor.findUnique({
    where: {
      id: context.params?.id as string,
    },
  });

  if (session.user.id !== vendor?.id && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const { data: avatarFolder } = await supabase.storage.from(env.NEXT_PUBLIC_USER_ICON).list(vendor?.id, { limit: 1 });

  let avatar = "";

  if (avatarFolder) {
    const { data } = supabase.storage.from(env.NEXT_PUBLIC_USER_ICON).getPublicUrl(`${vendor?.id}/${avatarFolder[0]?.name}`);
    avatar = data.publicUrl;
  }
  return {
    props: {
      vendor: {
        ...vendor,
        createdAt: generalizeDate(vendor?.createdAt),
      },
      avatar,
    },
  };
};

interface pageProps {
  vendor: Vendor & { count: number };
  avatar: string;
}

export default function Vendor({ vendor, avatar }: pageProps) {
  return (
    <>
      <Head>
        <title>Vendor - {vendor.name}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="mb-12 flex items-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-8 ">
              <Avatar>
                <AvatarImage src={avatar} alt="Vendor Avatar" width={100} height={100} />
                <AvatarFallback>
                  <UserCircle2 width={100} height={100} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="flex max-w-[200px] items-center gap-2 overflow-hidden truncate text-ellipsis text-xl font-semibold">
                  {vendor.name}
                  {vendor.accountVerified && <BadgeCheck className="text-green-500" />}
                </div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Joined {String(vendor.createdAt)}</div>
                <Link className="flex items-center gap-2 text-sm font-light text-gray-400" href={"/product/?search=" + vendor.id}>
                  <LinkIcon className="h-4 w-4" /> View products by {vendor.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
