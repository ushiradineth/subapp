import React, { useState } from "react";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import { ProductSchema, type ProductFormData } from "~/utils/validators";
import { ImageUpload } from "~/components/ImageUpload";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { env } from "~/env.mjs";

export default function NewProduct() {
  const form = useForm<ProductFormData>({
    resolver: yupResolver(ProductSchema),
  });

  const { mutate, isLoading, data } = api.product.create.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      toast.success("Product has been created");
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    mutate({ name: data.Name, description: data.Description, link: data.Link });
  };

  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState(false);

  return (
    <>
      <Head>
        <title>SubM - Create Product</title>
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
                    <ImageUpload upload={upload} setUpload={(value: boolean) => setUpload(value)} itemId={data?.id || ""} loading={(value: boolean) => setLoading(value)} setValue={(value: string) => form.setValue("Logo", value)} bucket={env.NEXT_PUBLIC_PRODUCT_LOGO} />
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
                    <ImageUpload itemId={data?.id || ""} upload={upload} setUpload={(value: boolean) => setUpload(value)} loading={(value: boolean) => setLoading(value)} setValue={(value: string) => form.setValue("Images", value)} multiple bucket={env.NEXT_PUBLIC_PRODUCT_IMAGE} />
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
