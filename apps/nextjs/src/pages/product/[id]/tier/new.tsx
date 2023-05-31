import React from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma } from "@acme/db";

import { api } from "~/utils/api";
import { TierSchema, type TierFormData } from "~/utils/validators";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

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

  const product = await prisma.product.findUnique({ where: { id: context.query.id as string }, select: { vendorId: true } });

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
    props: {},
  };
};

export default function NewTier() {
  const router = useRouter();

  const form = useForm<TierFormData>({
    resolver: yupResolver(TierSchema),
  });

  const { mutate, isLoading } = api.tier.create.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Tier has been created"),
  });

  const onSubmit = async (data: TierFormData) => {
    mutate({ name: data.Name, description: data.Description, productId: router.query.id as string, price: data.Price, period: data.Period });
  };

  return (
    <>
      <Head>
        <title>SubM - Create Tier</title>
      </Head>
      <main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="A Unique name for the tier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of the tier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="Price of the tier in USD" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <FormControl>
                    <Input placeholder="Periodic Cycle of the Subscription" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" loading={isLoading}>
              Submit
            </Button>
          </form>
        </Form>
      </main>
    </>
  );
}