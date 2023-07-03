import React, { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type User } from "@acme/db";

import { api } from "~/utils/api";
import { UserEditFormSchema, type UserEditFormData } from "~/utils/validators";
import { ImageUpload } from "~/components/ImageUpload";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { env } from "~/env.mjs";
import { formalizeDate } from "~/lib/utils";

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

  const user = await prisma.user.findUnique({ where: { id: context.params?.id as string } });

  if (!user) return { props: {} };

  return {
    props: {
      user: {
        ...user,
        createdAt: formalizeDate(user?.createdAt),
      },
    },
  };
};

interface pageProps {
  user: User;
}

export default function EditUser({ user }: pageProps) {
  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState(false);

  const form = useForm<UserEditFormData>({
    resolver: yupResolver(UserEditFormSchema),
  });

  const { mutate, isLoading } = api.user.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      toast.success("User has been updated");
    },
  });

  const onSubmit = (data: UserEditFormData) => {
    if (data.Name !== user.name || data.Password !== "") {
      mutate({ id: user.id, name: data.Name, password: data.Password || "" });
    }
    if (typeof form.watch("Image") !== "undefined" && form.watch("Image") !== "") {
      setUpload(true);
    }
  };

  useEffect(() => {
    if (user) {
      form.setValue("Name", user.name);
      form.setValue("Email", user.email);
    }
  }, [user]);

  if (!user) return <div>User not found</div>;

  return (
    <>
      <Head>
        <title>Edit User {user.name}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>User</CardTitle>
            <CardDescription>Edit &quot;{user.name}&quot;</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
                <FormField
                  control={form.control}
                  name="Image"
                  render={() => (
                    <FormItem>
                      <FormLabel>User Image</FormLabel>
                      <FormControl>
                        <ImageUpload upload={upload} setUpload={(value: boolean) => setUpload(value)} itemId={user.id} setLoading={(value: boolean) => setLoading(value)} setValue={(value: string) => form.setValue("Image", value)} bucket={env.NEXT_PUBLIC_USER_ICON} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email of the user" disabled={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of the user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Password of the user" type="password" {...field} value={form.getValues("Password") || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" loading={isLoading || loading} disabled={form.watch("Name") === user.name && (typeof form.watch("Image") === "undefined" || form.watch("Image") === "") && form.watch("Password") === ""}>
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
