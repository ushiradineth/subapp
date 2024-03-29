import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Edit } from "lucide-react";
import { getSession, useSession } from "next-auth/react";

import { prisma, type Category } from "@acme/db";

import PageNumbers from "~/components/Atoms/PageNumbers";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
import { formalizeDate } from "~/lib/utils";

const ITEMS_PER_PAGE = 10;

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
    include: {
      _count: {
        select: {
          products: {
            where: { verified: true },
          },
        },
      },
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

type CategoryType = Category & {
  _count: {
    products: number;
  };
};

interface pageProps {
  categories: CategoryType[];
  count: number;
  total: number;
}

export default function Categories({ categories, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Categories {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>A list of all categories.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for categories"
              path={router.asPath}
              params={router.query}
              count={count}
            />
          </CardHeader>
          <CardContent>
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-center">Action</TableHead>
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
                        <TableCell className="text-center">
                          <Link href={`/product?search=${category.id}`}>{category._count.products}</Link>
                        </TableCell>
                        {session?.user.role === "Admin" && (
                          <TableCell>
                            <Link href={`/category/${category.id}/edit`}>
                              <Edit className="ml-2" />
                            </Link>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>
                <p>Currently, a total of {total} Categories are on SubM</p>
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
