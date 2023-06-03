import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { BadgeCheck, BadgeX, Edit, Layers, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { type Product } from "@acme/db";

import { api } from "~/utils/api";
import Loader from "~/components/Loader";
import PageNumbers from "~/components/PageNumbers";
import Search from "~/components/Search";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export interface ProductWithDetails extends Product {
  vendor: { name: string; id: string };
  category: { name: string; id: string };
}

interface pageProps {
  products: ProductWithDetails[];
  count: number;
  total: number;
  itemsPerPage: number;
  requests?: boolean;
}

export default function Products({ products: serverProducts, count, total, itemsPerPage, requests = false }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [products, setProducts] = useState<ProductWithDetails[]>(serverProducts);

  useEffect(() => {
    setProducts(serverProducts);
  }, [serverProducts]);

  return (
    <>
      <Head>
        <title>Products {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main className="flex flex-col items-center">
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
                <TableHead className="text-center">Verifed</TableHead>
                <TableHead className="text-center">Tiers</TableHead>
                {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length !== 0 ? (
                products.map((product, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Link href={`/product/${product.id}`}>{product.id}</Link>
                      </TableCell>
                      <TableCell className="text-center">{product.name}</TableCell>
                      <TableCell className="text-center">
                        <Link href={`/vendor/${product.vendor.id}`}>{product.vendor.name}</Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/category/${product.category.id}`}>{product.category.name}</Link>
                      </TableCell>
                      <TableCell className="text-center">{product.createdAt.toString()}</TableCell>
                      <TableCell className="mt-1 flex justify-center">{product.verified ? <BadgeCheck className="text-green-500" /> : <BadgeX className="text-red-500" />}</TableCell>
                      <TableCell>
                        <Link href={`/product/${product.id}/tier`}>
                          <Layers className="ml-1" />
                        </Link>
                      </TableCell>
                      {session?.user.role === "Admin" && (
                        <TableCell>
                          <div className="flex gap-4">
                            <DeleleProduct id={product.id} onSuccess={() => setProducts(products.filter((p) => p.id !== product.id))} />
                            <Link href={`/product/${product.id}/edit`}>
                              <Edit />
                            </Link>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={session?.user.role === "Admin" ? 8 : 7} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableCaption>
              {session?.user.role === "Admin" ? (
                <p>
                  Currently, a total of {total} Product(s) are {requests && "requested"} on SubM
                </p>
              ) : (
                <p>You have {total} Product(s) on total SubM</p>
              )}
            </TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={itemsPerPage} pageNumber={pageNumber} path={router.asPath} params={router.query} />
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
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the product, including all the tiers and subsciptions.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
              <Button onClick={() => deleteProduct({ id: props.id })}>{loading ? <Loader /> : <button>Delete</button>}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Trash onClick={() => setDeleteMenu(true)} />
    </>
  );
};
