import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { LinkIcon } from "lucide-react";

import { prisma, type Category } from "@acme/db";

import PageNumbers from "~/components/PageNumbers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context.query);

  const categories = await prisma.category.findMany({ take: ITEMS_PER_PAGE, skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0 });
  const count = await prisma.category.count();

  return { props: { categories, count } };
};

export default function Index({ categories, count }: { categories: Category[]; count: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);

  return (
    <>
      <Head>
        <title>Categories - Page {router.query.page || 1}</title>
      </Head>
      <main className="flex flex-col items-center">
        {categories.length === 0 ? (
          <>No data found</>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="text-center">{category.id}</TableCell>
                    <TableCell className="text-center">{category.name}</TableCell>
                    <TableCell className="text-center" onClick={() => router.push(`/category/${category.id}`)}>
                      <LinkIcon />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableCaption>
              <p>A list of categories</p>
              <p>Currently, a total of {count} categories are on SubM</p>
            </TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} route="/category" />
            </TableCaption>
          </Table>
        )}
      </main>
    </>
  );
}
