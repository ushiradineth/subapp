import React, { useEffect } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Category } from "@acme/db";

import { api } from "~/utils/api";
import { CategorySchema, type CategoryFormData } from "~/utils/validators";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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

  const category = await prisma.category.findUnique({ where: { id: context.params?.id as string } });

  return {
    props: {
      category: {
        ...category,
        createdAt: formalizeDate(category?.createdAt),
      },
    },
  };
};

export default function EditCategory({ category }: { category: Category }) {
  const form = useForm<CategoryFormData>({
    resolver: yupResolver(CategorySchema),
  });

  const { mutate, isLoading } = api.category.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Category has been created"),
  });

  const onSubmit = (data: CategoryFormData) => {
    mutate({ id: category.id, name: data.Name, description: data.Description });
  };

  useEffect(() => {
    form.setValue("Name", category.name);
    form.setValue("Description", category.description);
  }, [category]);

  return (
    <>
      <Head>
        <title>SubM - Edit Category {category.name}</title>
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
                    <Input placeholder="Name" {...field} />
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
                    <Textarea placeholder="Description" {...field} />
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
