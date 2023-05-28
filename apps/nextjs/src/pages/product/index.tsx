import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LinkIcon, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type Product } from "@acme/db";

import { api } from "~/utils/api";
import Loader from "~/components/Loader";
import PageNumbers from "~/components/PageNumbers";
import Search from "~/components/Search";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";
import { ReloadButton } from "../vendor";

const ITEMS_PER_PAGE = 10;

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

  const search = context.query.search ? (context.query.search as string).split(" ").join(" | ") : "";

  const searchQuery = {
    OR: [
      { name: { search: search } },
      {
        category: { OR: [{ name: { search: search } }, { description: { search: search } }] },
      },
      { vendor: { name: { search: search } } },
    ],
  };

  const where =
    search !== ""
      ? session.user.role === "Admin"
        ? searchQuery
        : {
            vendorId: { equals: session?.user.id },
            searchQuery,
          }
      : session.user.role === "Admin"
      ? {}
      : { vendorId: { equals: session?.user.id } };

  const products = await prisma.product.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      vendor: {
        select: {
          name: true,
          id: true,
        },
      },
      category: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  const count = await prisma.product.count({ where });

  const total =
    session?.user.role === "Admin"
      ? await prisma.product.count()
      : await prisma.product.count({
          where: {
            vendorId: {
              equals: session?.user.id,
            },
          },
        });

  return {
    props: {
      products: products.map((product) => ({
        ...product,
        createdAt: formalizeDate(product.createdAt),
      })),
      count,
      total,
    },
  };
};

interface ProductWithDetails extends Product {
  vendor: { name: string; id: string };
  category: { name: string; id: string };
}

export default function Index({ products, count, total }: { products: ProductWithDetails[]; count: number; total: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [refresh, setRefresh] = useState(false);

  return (
    <>
      <Head>
        <title>Products {router.query.page && `- Page ${router.query.page}`}</title>
      </Head>
      <main className="flex flex-col items-center">
        {refresh && <ReloadButton />}
        <Search search={router.query.search as string} placeholder="Search for products" path={router.asPath} params={router.query} count={count} />
        <>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Vendor Name</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">Created At</TableHead>
                <TableHead className="text-center">Link</TableHead>
                {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length !== 0 ? (
                products.map((product, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-center">{product.id}</TableCell>
                      <TableCell className="text-center">{product.name}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/vendor/${product.vendor.id}`}>{product.vendor.name}</Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/category/${product.category.id}`}>{product.category.name}</Link>
                      </TableCell>
                      <TableCell className="text-center">{product.createdAt.toString()}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/product/${product.id}`}>
                          <LinkIcon />
                        </Link>
                      </TableCell>
                      {session?.user.role === "Admin" && <DeleleProduct id={product.id} onSuccess={() => setRefresh(true)} />}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={session?.user.role === "Admin" ? 7 : 6} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableCaption>{session?.user.role === "Admin" ? <p>Currently, a total of {total} Products are on SubM</p> : <p>A list of Products you own ({total})</p>}</TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} path={router.asPath} params={router.query} />
            </TableCaption>
          </Table>
        </>
      </main>
    </>
  );
}

const DeleleProduct = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(false);

  const { mutate: deleteProduct } = api.product.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete product"),
    onSuccess: () => {
      props.onSuccess();
      setDeleteMenu(false);
      toast.success("Product has been delete");
    },
  });

  return (
    <>
      {deleteMenu && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the product.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
              <Button onClick={() => deleteProduct({ id: props.id })}>{loading ? <Loader /> : <button>Delete</button>}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <TableCell>
        <button className="ml-2">
          <Trash onClick={() => setDeleteMenu(true)} />
        </button>
      </TableCell>
    </>
  );
};
