import React, { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Vendor } from "@acme/db";

import { api } from "~/utils/api";
import { UserSchema, type UserFormData } from "~/utils/validators";
import { ImageUpload } from "~/components/ImageUpload";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { env } from "~/env.mjs";
import { formalizeDate } from "~/lib/utils";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session || session.user.role === "Vendor") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: context.params?.id as string } });

  return {
    props: {
      vendor: {
        ...vendor,
        createdAt: formalizeDate(vendor?.createdAt),
      },
    },
  };
};

export default function EditVendor({ vendor }: { vendor: Vendor }) {
  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState(false);

  const form = useForm<UserFormData>({
    resolver: yupResolver(UserSchema),
  });

  const { mutate, isLoading } = api.vendor.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      toast.success("Account has been updated");
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (data.Name !== vendor.name) {
      mutate({ id: vendor.id, name: data.Name });
    }
    if (typeof form.watch("Image") !== "undefined" && form.watch("Image") !== "") {
      setUpload(true);
    }
  };

  useEffect(() => {
    if (vendor.name && vendor.email) {
      form.setValue("Name", vendor.name);
      form.setValue("Email", vendor.email);
    }
  }, [vendor]);

  return (
    <>
      <Head>
        <title>SubM - Edit Vendor {vendor.name}</title>
      </Head>
      <main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
            <FormField
              control={form.control}
              name="Image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Image</FormLabel>
                  <FormControl>
                    <ImageUpload upload={upload} setUpload={(value: boolean) => setUpload(value)} itemId={vendor.id} loading={(value: boolean) => setLoading(value)} setValue={(value: string) => form.setValue("Image", value)} onUpload={() => toast.success("Image has been uploaded")} bucket={env.NEXT_PUBLIC_USER_ICON} delete={true} />
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
                    <Input placeholder="Email" disabled={true} {...field} />
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
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={isLoading || loading} disabled={form.watch("Name") === vendor.name && (typeof form.watch("Image") === "undefined" || form.watch("Image") === "")}>
              Submit
            </Button>
          </form>
        </Form>
      </main>
    </>
  );
}
