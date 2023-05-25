import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LinkIcon, RotateCcw, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type Vendor } from "@acme/db";

import { api } from "~/utils/api";
import Loader from "~/components/Loader";
import PageNumbers from "~/components/PageNumbers";
import Search from "~/components/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";

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

  const where = search !== "" ? { OR: [{ name: { search: search } }] } : {};

  const vendors = await prisma.vendor.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
  });

  const count = await prisma.vendor.count({
    where,
  });

  const total = await prisma.vendor.count();

  return {
    props: {
      vendors: vendors.map((vendor) => ({
        ...vendor,
        createdAt: formalizeDate(vendor.createdAt),
      })),
      count,
      total,
    },
  };
};

export default function Index({ vendors, count, total }: { vendors: Vendor[]; count: number; total: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [refresh, setRefresh] = useState(false);

  return (
    <>
      <Head>
        <title>Vendors {router.query.page && `- Page ${router.query.page}`}</title>
      </Head>
      <main className="flex flex-col items-center">
        {refresh && <ReloadButton />}
        <Search search={router.query.search as string} placeholder="Search for vendors" path={router.asPath} params={router.query} count={count} />
        {vendors.length === 0 ? (
          <>No data found</>
        ) : (
          <>
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Name</TableHead>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="text-center">Link</TableHead>
                  {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-center">{vendor.id}</TableCell>
                      <TableCell className="text-center">{vendor.name}</TableCell>
                      <TableCell className="text-center">{vendor.createdAt.toString()}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/vendor/${vendor.id}`}>
                          <LinkIcon />
                        </Link>
                      </TableCell>
                      {session?.user.role === "Admin" && <DeleteVendor id={vendor.id} onSuccess={() => setRefresh(true)} />}
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption>{session?.user.role === "Admin" ? <p>Currently, a total of {total} Vendors are on SubM</p> : <p>A list of Vendors you own ({total})</p>}</TableCaption>
              <TableCaption>
                <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} path={router.asPath} params={router.query} />
              </TableCaption>
            </Table>
          </>
        )}
      </main>
    </>
  );
}

const DeleteVendor = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);

  const { mutate: deleteVendor } = api.vendor.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete vendor"),
    onSuccess: () => {
      props.onSuccess();
      toast.success("Vendor has been delete");
    },
  });

  return (
    <TableCell>
      <div className="ml-2">{loading ? <Loader /> : <Trash onClick={() => deleteVendor({ id: props.id })} />}</div>
    </TableCell>
  );
};

export const ReloadButton = () => {
  const router = useRouter();

  return (
    <button onClick={() => router.reload()} className="absolute right-12 top-24 rounded-full border p-4 hover:bg-gray-800">
      <RotateCcw />
    </button>
  );
};
