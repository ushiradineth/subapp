import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";

import { prisma, type Category } from "@acme/db";

import PageNumbers from "~/components/PageNumbers";
import Search from "~/components/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";
import { useEffect } from "react";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session || session.user.role === "Vendor") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const search = context.query.search ? (context.query.search as string).split(" ").join(" | ") : "";

  const where =
    search !== ""
      ? {
          OR: [{ name: { search: search } }, { description: { search: search } }],
        }
      : {};

  const categories = await prisma.category.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  const count = await prisma.category.count({ where });

  const total = await prisma.category.count();

  return {
    props: {
      categories: categories.map((category) => ({
        ...category,
        createdAt: formalizeDate(category.createdAt),
      })),
      count,
      total,
    },
  };
};

export default function Index({ categories, count, total }: { categories: Category[]; count: number; total: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Categories {router.query.page && `- Page ${router.query.page}`}</title>
      </Head>
      <main className="flex flex-col items-center">
        <Search search={router.query.search as string} placeholder="Search for categories" path={router.asPath} params={router.query} count={count} />
        <>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length !== 0 ? (
                categories.map((category, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Link href={`/category/${category.id}`}>{category.id}</Link>
                      </TableCell>
                      <TableCell className="text-center">{category.name}</TableCell>
                      <TableCell className="text-center">{category.createdAt.toString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableCaption>{session?.user.role === "Admin" ? <p>Currently, a total of {total} Categories are on SubM</p> : <p>A list of Categories you own ({total})</p>}</TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} path={router.asPath} params={router.query} />
            </TableCaption>
          </Table>
        </>
      </main>
    </>
  );
}
