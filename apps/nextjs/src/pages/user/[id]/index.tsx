import { type GetServerSideProps } from "next";
import Head from "next/head";
import { UserCircle2 } from "lucide-react";
import { getSession } from "next-auth/react";

import { supabase } from "@acme/api/src/lib/supabase";
import { prisma, type User } from "@acme/db";

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

  const user = await prisma.user.findUnique({
    where: {
      id: context.params?.id as string,
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

  const { data: avatarFolder } = await supabase.storage.from(env.NEXT_PUBLIC_USER_ICON).list(user?.id, { limit: 1 });

  let avatar = "";

  if (avatarFolder) {
    const { data } = supabase.storage.from(env.NEXT_PUBLIC_USER_ICON).getPublicUrl(`${user?.id}/${avatarFolder[0]?.name}`);
    avatar = data.publicUrl;
  }
  return {
    props: {
      user: {
        ...user,
        createdAt: generalizeDate(user?.createdAt),
      },
      avatar,
    },
  };
};

interface pageProps {
  user: User & { count: number };
  avatar: string;
}

export default function User({ user, avatar }: pageProps) {
  if (!user) return <div>User not found</div>;

  return (
    <>
      <Head>
        <title>User - {user.name}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="mb-12 flex items-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-8 ">
              <Avatar>
                <AvatarImage src={avatar} alt="User Avatar" width={100} height={100} />
                <AvatarFallback>
                  <UserCircle2 width={100} height={100} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="flex max-w-[200px] items-center gap-2 overflow-hidden truncate text-ellipsis text-xl font-semibold">{user.name}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Joined {String(user.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
