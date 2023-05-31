import React, { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Category } from "@acme/db";

import { api } from "~/utils/api";
import { ProductSchema, type ProductFormData } from "~/utils/validators";
import { ImageUpload } from "~/components/ImageUpload";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { env } from "~/env.mjs";

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

  const product = await prisma.product.findFirst({
    where: { id: context.params?.id as string },
    select: {
      id: true,
      name: true,
      description: true,
      link: true,
      category: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  const categories = await prisma.category.findMany({ select: { name: true, id: true } });

  return {
    props: {
      product,
      categories: categories.map((category) => ({
        ...category,
      })),
    },
  };
};

interface Product {
  id: string;
  name: string;
  description: string;
  link: string;
  category: {
    name: string;
    id: string;
  };
}

export default function EditProduct({ product, categories }: { product: Product; categories: Category[] }) {
  const form = useForm<ProductFormData>({
    resolver: yupResolver(ProductSchema),
  });

  useEffect(() => {
    form.setValue("Name", product.name);
    form.setValue("Description", product.description);
    form.setValue("Link", product.link || "");
    form.setValue("Category", product.category.id);
  }, []);

  const { mutate, isLoading } = api.product.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      toast.success("Product has been Updated");
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    mutate({ id: product.id, name: data.Name, description: data.Description, link: data.Link, category: data.Category });
  };

  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState(false);

  return (
    <>
      <Head>
        <title>SubM - Edit Product {product.name}</title>
      </Head>
      <main>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
            <FormField
              control={form.control}
              name="Logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Logo</FormLabel>
                  <FormControl>
                    <ImageUpload upload={upload} setUpload={(value: boolean) => setUpload(value)} itemId={product.id} loading={(value: boolean) => setLoading(value)} setValue={(value: string) => form.setValue("Logo", value)} bucket={env.NEXT_PUBLIC_PRODUCT_LOGO} delete />
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
            <FormField
              control={form.control}
              name="Category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder={product.category.name} />
                      </SelectTrigger>
                      <SelectContent className="w-max">
                        {categories.map((category, index) => {
                          return (
                            <SelectItem key={index} defaultChecked={category.id === product.category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Link" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <ImageUpload itemId={product.id} upload={upload} setUpload={(value: boolean) => setUpload(value)} loading={(value: boolean) => setLoading(value)} setValue={(value: string) => form.setValue("Images", value)} multiple bucket={env.NEXT_PUBLIC_PRODUCT_IMAGE} delete />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={isLoading || loading}>
              Submit
            </Button>
          </form>
        </Form>
      </main>
    </>
  );
}