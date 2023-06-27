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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

export interface ProductWithDetails extends Product {
  vendor: { name: string; id: string };
  category: { name: string; id: string };
  _count: {
    tiers: number;
    subscriptions: number;
  };
}

interface pageProps {
  products: ProductWithDetails[];
  count: number;
  total: number;
  itemsPerPage: number;
  requests?: boolean;
  title?: string;
  description?: string;
}

export default function Products({
  products: serverProducts,
  count,
  total,
  itemsPerPage,
  requests = false,
  title = "Products",
  description = "A list of all products.",
}: pageProps) {
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
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for products"
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
                  <TableHead className="text-center">Vendor Name</TableHead>
                  <TableHead className="text-center">Category</TableHead>
                  <TableHead className="text-center">Created At</TableHead>
                  <TableHead className="text-center">Verifed</TableHead>
                  <TableHead className="text-center">Tiers</TableHead>
                  {products[0]?.verified && <TableHead className="text-center">Subscriptions</TableHead>}
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
                        <TableCell className="mt-1 flex justify-center">
                          {product.verified ? <BadgeCheck className="text-green-500" /> : <BadgeX className="text-red-500" />}
                        </TableCell>
                        <TableCell>
                          <Link className="flex items-center justify-center gap-2" href={`/product/${product.id}/tier`}>
                            <Layers className="ml-1" />
                            {product._count.tiers}
                          </Link>
                        </TableCell>
                        {products[0]?.verified && <TableCell className="text-center">{product._count.subscriptions}</TableCell>}
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
                    <TableCell
                      colSpan={session?.user.role === "Admin" ? (products[0]?.verified ? 9 : 8) : products[0]?.verified ? 8 : 7}
                      className="h-24 text-center">
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
            </Table>
          </CardContent>
          {count !== 0 && count > itemsPerPage && (
            <CardFooter className="flex justify-center">
              <TableCaption>
                <PageNumbers count={count} itemsPerPage={itemsPerPage} pageNumber={pageNumber} path={router.asPath} params={router.query} />
              </TableCaption>
            </CardFooter>
          )}
        </Card>
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
      toast.success("Product has been deleted");
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
                This action cannot be undone. This will permanently delete the product, including all the tiers and subsciptions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
              <Button onClick={() => deleteProduct({ id: props.id })}>{loading ? <Loader /> : <button>Delete</button>}</Button>
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
