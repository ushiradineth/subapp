import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Edit, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type Tier } from "@acme/db";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { generalizeDate } from "~/lib/utils";

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

  const where = search !== "" ? { OR: [{ name: { search: search } }] } : {};

  const product = await prisma.product.findFirst({
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where: {
      id: context.query.id as string,
    },
    include: {
      tiers: {
        where,
      },
      _count: true,
    },
  });

  if (product?.vendorId !== session.user.id && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {
      tiers: product?.tiers.map((tier) => ({
        ...tier,
        createdAt: generalizeDate(tier.createdAt),
      })),
      count: product?.tiers.length,
    },
  };
};

interface pageProps {
  tiers: Tier[];
  count: number;
}

export default function Tiers({ tiers: serverTier, count }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [tiers, setTiers] = useState<Tier[]>(serverTier);

  useEffect(() => {
    setTiers(serverTier);
  }, [serverTier]);

  return (
    <>
      <Head>
        <title>Tiers {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>A list of all vendors.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for tiers"
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
                  {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.length !== 0 ? (
                  tiers.map((tier, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          <Link href={`/product/${router.query.id}/tier/${tier.id}`}>{tier.id}</Link>
                        </TableCell>
                        <TableCell className="text-center">{tier.name}</TableCell>
                        <TableCell className="text-center">{tier.createdAt.toString()}</TableCell>
                        {session?.user.role === "Admin" && (
                          <TableCell>
                            <div className="flex gap-4">
                              <DeleteTier id={tier.id} onSuccess={() => setTiers(tiers.filter((p) => p.id !== tier.id))} />
                              <Link href={`/product/${router.query.id}/tier/${tier.id}/edit`}>
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
                    <TableCell colSpan={session?.user.role === "Admin" ? 4 : 3} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

              <TableCaption>
                <PageNumbers
                  count={count}
                  itemsPerPage={ITEMS_PER_PAGE}
                  pageNumber={pageNumber}
                  path={router.asPath}
                  params={router.query}
                />
              </TableCaption>

              <TableCaption className="gap-8">
                <Link href={`/product/${router.query.id}/tier/new`}>
                  <Button className="gap-2">Add new Tier</Button>
                </Link>
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

const DeleteTier = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(false);

  const { mutate: deleteTier } = api.tier.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete tier"),
    onSuccess: () => {
      props.onSuccess();
      setDeleteMenu(false);
      toast.success("Tier has been delete");
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
                This action cannot be undone. This will permanently delete the tier and all its subscriptions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
              <Button onClick={() => deleteTier({ id: props.id })}>{loading ? <Loader /> : <button>Delete</button>}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Trash onClick={() => setDeleteMenu(true)} />
    </>
  );
};
