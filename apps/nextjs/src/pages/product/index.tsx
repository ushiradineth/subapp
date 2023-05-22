import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { LinkIcon, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type Product, type Vendor } from "@acme/db";

import { api } from "~/utils/api";
import Loader from "~/components/Loader";
import PageNumbers from "~/components/PageNumbers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";
import { ReloadButton } from "../vendor";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  const products =
    session?.user.role === "Admin"
      ? await prisma.product.findMany({ take: ITEMS_PER_PAGE, skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0, include: { vendor: true } })
      : await prisma.product.findMany({
          where: {
            vendorId: {
              equals: session?.user.id,
            },
          },
        });
  const count = products.length;

  return {
    props: {
      products: products.map((product) => ({
        ...product,
        createdAt: formalizeDate(product.createdAt),
      })),
      count,
    },
  };
};

interface ProductWithVendor extends Product {
  vendor: Vendor;
}

export default function Index({ products, count }: { products: ProductWithVendor[]; count: number }) {
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
        {products.length === 0 ? (
          <>No data found</>
        ) : (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Vendor Name</TableHead>
                <TableHead className="text-center">Created At</TableHead>
                <TableHead className="text-center">Link</TableHead>
                {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="text-center">{product.id}</TableCell>
                    <TableCell className="text-center">{product.name}</TableCell>
                    <TableCell className="text-center">{product.vendor.name}</TableCell>
                    <TableCell className="text-center">{product.createdAt.toString()}</TableCell>
                    <TableCell className="text-center" onClick={() => router.push(`/product/${product.id}`)}>
                      <LinkIcon />
                    </TableCell>
                    {session?.user.role === "Admin" && <DeleleProduct id={product.id} onSuccess={() => setRefresh(true)} />}
                  </TableRow>
                );
              })}
            </TableBody>
            <TableCaption>
              <p>A list of Products {session?.user.role === "Vendor" && `you own (${count})`}</p>
              {session?.user.role === "Admin" && <p>Currently, a total of {count} Products are on SubM</p>}
            </TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} route="/product" />
            </TableCaption>
          </Table>
        )}
      </main>
    </>
  );
}

const DeleleProduct = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);

  const { mutate: deleteProduct } = api.product.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete product"),
    onSuccess: () => {
      props.onSuccess();
      toast.success("Product has been delete");
    },
  });

  return (
    <TableCell>
      <div className="ml-2">{loading ? <Loader /> : <Trash onClick={() => deleteProduct({ id: props.id })} />}</div>
    </TableCell>
  );
};
