import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { LinkIcon, XCircle } from "lucide-react";
import { getSession } from "next-auth/react";

import { prisma, type Category } from "@acme/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Atoms/Avatar";
import { Card } from "~/components/Molecules/Card";
import { env } from "~/env.mjs";
import { generalizeDate } from "~/lib/utils";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session || session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const category = await prisma.category.findUnique({
    where: {
      id: context.params?.id as string,
    },
  });

  if (!category) return { props: {} };

  return {
    props: {
      category: {
        ...category,
        createdAt: generalizeDate(category?.createdAt),
      },
      logo: `${env.NEXT_PUBLIC_SUPABASE_URL}/${env.NEXT_PUBLIC_CATEGORY_ICON}/${category.id}/0.jpg`,
    },
  };
};

interface pageProps {
  category: Category;
  logo: string;
}

export default function CategoryPage({ category, logo }: pageProps) {
  if (!category) return <div>Category not found</div>;

  return (
    <>
      <Head>
        <title>{category.name} - SubM</title>
      </Head>
      <Card className="flex flex-col justify-center gap-4 p-4">
        <div className="flex justify-center gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-12">
              <Avatar>
                <AvatarImage src={logo} alt="Category Logo" width={200} height={200} />
                <AvatarFallback>
                  <XCircle width={200} height={200} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis text-xl font-semibold">{category.name}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">
                  Created {String(category.createdAt)}
                </div>
                <Link
                  className="flex items-center gap-2 text-sm font-light text-gray-400"
                  href={`/product?search=${category.id}&showall=true`}>
                  <LinkIcon className="h-4 w-4" /> View all products of this category
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border p-8">
              <div className="text-lg font-semibold">About {category.name}</div>
              <div className={"mr-2 grid max-w-[800px] grid-flow-col break-all"}>{category.description}</div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
