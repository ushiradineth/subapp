import React, { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Vendor } from "@acme/db";

import { api } from "~/utils/api";
import { UserEditFormSchema, type UserEditFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { ImageUpload } from "~/components/Molecules/ImageUpload";
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

  const vendor = await prisma.vendor.findUnique({ where: { id: context.params?.id as string } });

  if (!vendor) return { props: {} };

  return {
    props: {
      vendor: {
        ...vendor,
        createdAt: formalizeDate(vendor?.createdAt),
      },
    },
  };
};

interface pageProps {
  vendor: Vendor;
}

export default function EditVendor({ vendor }: pageProps) {
  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState(false);

  const form = useForm<UserEditFormData>({
    resolver: yupResolver(UserEditFormSchema),
  });

  const { mutate, isLoading } = api.vendor.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      toast.success("Vendor has been updated");
    },
  });

  const onSubmit = (data: UserEditFormData) => {
    if (data.Name !== vendor.name || data.Password !== "") {
      mutate({ id: vendor.id, name: data.Name, password: data.Password || "" });
    }
    if (typeof form.watch("Image") !== "undefined" && form.watch("Image") !== "") {
      setUpload(true);
    }
  };

  useEffect(() => {
    if (vendor && vendor.email) {
      form.setValue("Name", vendor.name);
      form.setValue("Email", vendor.email);
    }
  }, [vendor]);

  if (!vendor) return <div>Vendor not found</div>;

  return (
    <>
      <Head>
        <title>Edit Vendor {vendor.name}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Vendor</CardTitle>
            <CardDescription>Edit &quot;{vendor.name}&quot;</CardDescription>
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
                        <ImageUpload
                          upload={upload}
                          setUpload={(value: boolean) => setUpload(value)}
                          itemId={vendor.id}
                          setLoading={(value: boolean) => setLoading(value)}
                          setValue={(value: string) => form.setValue("Image", value)}
                          bucket={env.NEXT_PUBLIC_USER_ICON}
                        />
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
                        <Input placeholder="Email of the vendor" disabled={true} {...field} />
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
                        <Input placeholder="Name of the vendor" {...field} />
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
                <Button
                  type="submit"
                  loading={isLoading || loading}
                  disabled={
                    form.watch("Name") === vendor.name &&
                    (typeof form.watch("Image") === "undefined" || form.watch("Image") === "") &&
                    form.watch("Password") === ""
                  }>
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
