import { type GetServerSideProps } from "next";
import Head from "next/head";
import { UserCircle } from "lucide-react";
import { getSession } from "next-auth/react";

import { prisma, type User } from "@acme/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Atoms/Avatar";
import { env } from "~/env.mjs";
import { generalizeDate, getBucketUrl } from "~/lib/utils";

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

  const user = await prisma.user.findUnique({
    where: {
      id: context.params?.id as string,
    },
    include: {
      _count: {
        select: {
          subscriptions: {
            where: { active: true },
          },
        },
      },
    },
  });

  if (!user) return { props: {} };

  if (session.user.id !== user?.id && session.user.role !== "Admin") {
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
      user: {
        ...user,
        createdAt: generalizeDate(user?.createdAt),
      },
      avatar: `${getBucketUrl(env.NEXT_PUBLIC_USER_ICON)}/${user.id}.jpg`,
    },
  };
};

interface pageProps {
  user: User & { _count: { subscriptions: number } };
  avatar: string;
}

export default function UserPage({ user, avatar }: pageProps) {
  if (!user) return <div>User not found</div>;

  return (
    <>
      <Head>
        <title>User - {user.name}</title>
      </Head>
      <main className="flex flex-col justify-center gap-4 p-4">
        <div className="flex justify-center gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-12">
              <Avatar>
                <AvatarImage src={avatar} alt="User Avatar" width={200} height={200} />
                <AvatarFallback>
                  <UserCircle width={200} height={200} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis text-xl font-semibold">{user.name}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Joined {String(user.createdAt)}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">
                  {user._count.subscriptions} subscriptions on SubM
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
