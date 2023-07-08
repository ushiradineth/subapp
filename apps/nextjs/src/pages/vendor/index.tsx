import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Edit, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type Vendor } from "@acme/db";

import { api } from "~/utils/api";
import { Button } from "~/components/Atoms/Button";
import Loader from "~/components/Atoms/Loader";
import PageNumbers from "~/components/Atoms/PageNumbers";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/Molecules/AlertDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";
import Search from "~/components/Molecules/Search";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/Molecules/Table";
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
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
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

type VendorType = Vendor & {
  _count: {
    products: number;
  };
};

interface pageProps {
  vendors: VendorType[];
  count: number;
  total: number;
}

export default function Vendors({ vendors: serverVendors, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [vendors, setVendors] = useState<VendorType[]>(serverVendors);

  useEffect(() => {
    setVendors(serverVendors);
  }, [serverVendors]);

  return (
    <>
      <Head>
        <title>Vendors {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>A list of all vendors.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for vendors"
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
                  {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length !== 0 ? (
                  vendors.map((vendor, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          <Link href={`/vendor/${vendor.id}`}>{vendor.id}</Link>
                        </TableCell>
                        <TableCell className="text-center">{vendor.name}</TableCell>
                        <TableCell className="text-center">{vendor.createdAt.toString()}</TableCell>
                        <TableCell className="text-center">{vendor._count.products}</TableCell>
                        <TableCell>
                          <div className="flex gap-4">
                            <DeleteVendor id={vendor.id} onSuccess={() => setVendors(vendors.filter((p) => p.id !== vendor.id))} />
                            <Link href={`/vendor/${vendor.id}/edit`}>
                              <Edit />
                            </Link>
                          </div>
                        </TableCell>
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
              <TableCaption>Currently, a total of {total} Vendors are on SubM</TableCaption>
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

const DeleteVendor = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(false);

  const { mutate: deleteVendor } = api.vendor.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete vendor"),
    onSuccess: () => {
      props.onSuccess();
      setDeleteMenu(false);
      toast.success("Vendor has been deleted");
    },
  });

  return (
    <>
      {deleteMenu && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the vendor, including all their products and related
                subscriptions and tiers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
              <Button onClick={() => deleteVendor({ id: props.id })}>{loading ? <Loader /> : <button>Delete</button>}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <button onClick={() => setDeleteMenu(true)}>
        <Trash />
      </button>
    </>
  );
};
