import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type User } from "@acme/db";

import { api } from "~/utils/api";
import Loader from "~/components/Loader";
import PageNumbers from "~/components/PageNumbers";
import Search from "~/components/Search";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";
import { ReloadButton } from "../vendor";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session ) {
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
    OR: [{ name: { search: search } }],
  };

  const vendorQuery = {
    subscriptions: {
      some: {
        product: {
          vendorId: { equals: session?.user.id },
        },
      },
    },
  };

  const where =
    search !== ""
      ? session.user.role === "Admin"
        ? searchQuery
        : {
            vendorQuery,
            searchQuery,
          }
      : session.user.role === "Admin"
      ? {}
      : {
          subscriptions: {
            some: {
              product: {
                vendorId: { equals: session?.user.id },
              },
            },
          },
        };

  const users = await prisma.user.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  const count = await prisma.user.count({
    where,
  });

  const total =
    session?.user.role === "Admin"
      ? await prisma.user.count()
      : await prisma.user.count({
          where: vendorQuery,
        });

  return {
    props: {
      users: users.map((user) => ({
        ...user,
        createdAt: formalizeDate(user.createdAt),
      })),
      count,
      total,
    },
  };
};

export default function Index({ users, count, total }: { users: User[]; count: number; total: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [refresh, setRefresh] = useState(false);

  return (
    <>
      <Head>
        <title>Users {router.query.page && `- Page ${router.query.page}`}</title>
      </Head>
      <main className="flex flex-col items-center">
        {refresh && <ReloadButton />}
        <Search search={router.query.search as string} placeholder="Search for users" path={router.asPath} params={router.query} count={count} />

        <>
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
              {users.length !== 0 ? (
                users.map((user, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <Link href={`/user/${user.id}`}>{user.id}</Link>
                      </TableCell>
                      <TableCell className="text-center">{user.name}</TableCell>
                      <TableCell className="text-center">{user.createdAt.toString()}</TableCell>
                      {session?.user.role === "Admin" && <DeleteUser id={user.id} onSuccess={() => setRefresh(true)} />}
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
            <TableCaption>{session?.user.role === "Admin" ? <p>Currently, a total of {total} Users are on SubM</p> : <p>A list of Users you own ({total})</p>}</TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} path={router.asPath} params={router.query} />
            </TableCaption>
          </Table>
        </>
      </main>
    </>
  );
}

const DeleteUser = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(false);

  const { mutate: deleteUser } = api.user.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete user"),
    onSuccess: () => {
      props.onSuccess();
      setDeleteMenu(false);
      toast.success("User has been delete");
    },
  });

  return (
    <>
      {deleteMenu && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the user.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
              <Button onClick={() => deleteUser({ id: props.id })}>{loading ? <Loader /> : <button>Delete</button>}</Button>
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
