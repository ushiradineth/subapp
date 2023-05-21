import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { LinkIcon, Trash } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { prisma, type User } from "@acme/db";

import { api } from "~/utils/api";
import Loader from "~/components/Loader";
import PageNumbers from "~/components/PageNumbers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { formalizeDate } from "~/lib/utils";
import { ReloadButton } from "../vendor";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  const users = session?.user.role === "Admin" ? await prisma.user.findMany({ take: ITEMS_PER_PAGE, skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0 }) : await prisma.user.findMany({ where: { subscriptions: { some: { product: { vendorId: { equals: session?.user.id } } } } } });
  const count = users?.length;

  return {
    props: {
      users: users.map((user) => ({
        ...user,
        createdAt: formalizeDate(user.createdAt),
      })),
      count,
    },
  };
};

export default function Index({ users, count }: { users: User[]; count: number }) {
  const router = useRouter();
  const pageNumber = Number(router.query.page || 1);
  const { data: session } = useSession();
  const [refresh, setRefresh] = useState(false);

  return (
    <>
      <Head>
        <title>Users - Page {router.query.page || 1}</title>
      </Head>
      <main className="flex flex-col items-center">
        {refresh && <ReloadButton />}
        {users.length === 0 ? (
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
                {session?.user.role === "Admin" && <TableHead className="text-center">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="text-center">{user.id}</TableCell>
                    <TableCell className="text-center">{user.name}</TableCell>
                    <TableCell className="text-center">{user.email}</TableCell>
                    <TableCell className="text-center">{user.createdAt.toString()}</TableCell>
                    <TableCell className="text-center" onClick={() => router.push(`/user/${user.id}`)}>
                      <LinkIcon />
                    </TableCell>
                    {session?.user.role === "Admin" && <DeleteUser id={user.id} onSuccess={() => setRefresh(true)} />}
                  </TableRow>
                );
              })}
            </TableBody>
            <TableCaption>
              <p>A list of users</p>
              <p>Currently, a total of {count} users are on SubM</p>
            </TableCaption>
            <TableCaption>
              <PageNumbers count={count} itemsPerPage={ITEMS_PER_PAGE} pageNumber={pageNumber} route="/user" />
            </TableCaption>
          </Table>
        )}
      </main>
    </>
  );
}

const DeleteUser = (props: { id: string; onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);

  const { mutate: deleteUser } = api.user.delete.useMutation({
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
    onError: () => toast.error("Failed to delete user"),
    onSuccess: () => {
      props.onSuccess();
      toast.success("User has been delete");
    },
  });

  return (
    <TableCell>
      <div className="ml-2">{loading ? <Loader /> : <Trash onClick={() => deleteUser({ id: props.id })} />}</div>
    </TableCell>
  );
};
