import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { LinkIcon } from "lucide-react";

import { prisma, type Vendor } from "@acme/db";

import PageNumbers from "~/components/PageNumbers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const vendors = await prisma.vendor.findMany({ take: ITEMS_PER_PAGE, skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0 });
  const count = vendors.length;

  return {
    props: {
      vendors: vendors.map((vendor) => ({
        ...vendor,
        createdAt: formalizeDate(vendor.createdAt),
      })),
      count,
    },
  };
};

export default function Index({ vendors, count }: { vendors: Vendor[]; count: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);

  return (
    <>
      <Head>
        <title>Vendors - Page {router.query.page || 1}</title>
      </Head>
      <main className="flex flex-col items-center">
        {vendors.length === 0 ? (
          <>No data found</>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Created At</TableHead>
                <TableHead className="text-center">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="text-center">{vendor.id}</TableCell>
                    <TableCell className="text-center">{vendor.name}</TableCell>
                    <TableCell className="text-center">{vendor.email}</TableCell>
                    <TableCell className="text-center">{vendor.createdAt.toString()}</TableCell>
                    <TableCell className="text-center" onClick={() => router.push(`/vendor/${vendor.id}`)}>
                      <LinkIcon />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableCaption>
              <p>A list of vendors</p>
              <p>Currently, a total of {count} vendors are on SubM</p>
            </TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} route="/vendor" />
            </TableCaption>
          </Table>
        )}
      </main>
    </>
  );
}
