import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Edit, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type User } from "@acme/db";

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

  if (!session || session.user.role !== "Admin") {
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
            ...vendorQuery,
            ...searchQuery,
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
    include: {
      _count: {
        select: {
          subscriptions: {
            where: { active: true },
          },
        },
      },
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

type UserType = User & {
  _count: {
    subscriptions: number;
  };
};

interface pageProps {
  users: UserType[];
  count: number;
  total: number;
}

export default function Index({ users: serverUsers, count, total }: pageProps) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserType[]>(serverUsers);

  useEffect(() => {
    setUsers(serverUsers);
  }, [serverUsers]);

  return (
    <>
      <Head>
        <title>Users {router.query.page && `- Page ${router.query.page as string}`}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>A list of all users.</CardDescription>
            <Search
              search={router.query.search as string}
              placeholder="Search for users"
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
                  <TableHead className="text-center">Subscriptions</TableHead>
                  <TableHead className="text-center">Action</TableHead>
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
                        <TableCell className="text-center">{user._count.subscriptions}</TableCell>
                        {session?.user.role === "Admin" && (
                          <TableCell>
                            <div className="flex gap-4">
                              <DeleteUser id={user.id} onSuccess={() => setUsers(users.filter((p) => p.id !== user.id))} />
                              <Link href={`/user/${user.id}/edit`}>
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>
                <p>Currently, a total of {total} Users are on SubM</p>
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
      toast.success("User has been deleted");
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
      <button onClick={() => setDeleteMenu(true)}>
        <Trash />
      </button>
    </>
  );
};
