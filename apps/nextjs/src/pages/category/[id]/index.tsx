import { type GetServerSideProps } from "next";
import Head from "next/head";
import moment from "moment";
import { getSession } from "next-auth/react";

import { prisma, type Category } from "@acme/db";

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

  return {
    props: {
      category: {
        ...category,
        createdAt: moment(category?.createdAt).fromNow(),
      },
    },
  };
};

export default function Category({ category }: { category: Category }) {
  return (
    <>
      <Head>
        <title>Category - {category.name}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="mb-12 flex items-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-8 ">
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="flex max-w-[200px] items-center gap-2 overflow-hidden truncate text-ellipsis text-xl font-semibold">{category.name}</div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Created {String(category.createdAt)}</div>
              </div>
              <div className="rounded-2xl border p-8">
                <div className="text-lg font-semibold">About {category.name}</div>
                <div className={"mr-2 grid max-w-[800px] grid-flow-col break-all"}>{category.description}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
