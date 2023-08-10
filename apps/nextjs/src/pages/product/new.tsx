import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Category } from "@acme/db";

import { api } from "~/utils/api";
import { ProductSchema, type ProductFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Textarea } from "~/components/Atoms/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { ImageUpload } from "~/components/Molecules/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/Molecules/Select";
import { env } from "~/env.mjs";

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

  const categories = await prisma.category.findMany({ select: { name: true, id: true } });

  return {
    props: {
      categories: categories.map((category) => ({
        ...category,
      })),
    },
  };
};

interface pageProps {
  categories: Category[];
}

type ImageState = {
  completed: boolean;
  loading: boolean;
};

export default function NewProduct({ categories }: pageProps) {
  const { data: session } = useSession();
  const [upload, setUpload] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [logoState, setLogoState] = useState<ImageState>({ completed: false, loading: false });
  const [imagesState, setImagesState] = useState<ImageState>({ completed: false, loading: false });

  const form = useForm<ProductFormData>({
    resolver: yupResolver(ProductSchema),
  });

  const { mutate, isLoading, data } = api.product.create.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      setLogoState({ completed: false, loading: true });
      setImagesState({ completed: false, loading: true });
    },
  });

  const { mutate: UpdateImages, isLoading: isUpdatingImages } = api.product.updateImages.useMutation({
    onSuccess: () =>
      session?.user.role === "Admin" ? toast.success("Product has been created") : toast.success("Product has been requested"),
  });

  const onSubmit = (data: ProductFormData) => {
    mutate({ name: data.Name, description: data.Description, link: data.Link, category: data.Category });
  };

  useEffect(() => {
    if (logoState.completed && imagesState.completed) {
      UpdateImages({ id: data?.id ?? "", images });
    }
  }, [logoState.completed, imagesState.completed, UpdateImages, data?.id, images]);

  return (
    <>
      <Head>
        <title>Create Product - SubM</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Product</CardTitle>
            <CardDescription>Create a new Product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
                <FormField
                  control={form.control}
                  name="Logo"
                  render={({}) => (
                    <FormItem>
                      <FormLabel>Product Logo</FormLabel>
                      <FormControl>
                        <ImageUpload
                          upload={upload}
                          itemId={data?.id || ""}
                          onUpload={() => setLogoState({ completed: true, loading: false })}
                          setUpload={(value: boolean) => setUpload(value)}
                          setLoading={(value: boolean) =>
                            setLogoState((prev) => {
                              return { ...prev, loading: value };
                            })
                          }
                          setValue={(value: string) => form.setValue("Logo", value)}
                          bucket={env.NEXT_PUBLIC_PRODUCT_LOGO}
                        />
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
                        <Input placeholder="Name of the Product" {...field} />
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
                        <Textarea placeholder="Brief description of the Product" {...field} />
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
                            <SelectValue placeholder="Select a Category" />
                          </SelectTrigger>
                          <SelectContent className="w-max">
                            {categories.map((category, index) => {
                              return (
                                <SelectItem key={index} value={category.id}>
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
                        <Input placeholder="Link to the Product Home page" type="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Images"
                  render={({}) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          itemId={data?.id || ""}
                          upload={upload}
                          onUpload={(images) => {
                            setImagesState({ completed: true, loading: false });
                            setImages(images);
                          }}
                          setUpload={(value: boolean) => setUpload(value)}
                          setLoading={(value: boolean) =>
                            setImagesState((prev) => {
                              return { ...prev, loading: value };
                            })
                          }
                          setValue={(value: string) => form.setValue("Images", value)}
                          multiple
                          bucket={env.NEXT_PUBLIC_PRODUCT_IMAGE}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" loading={isLoading || logoState.loading || imagesState.loading || isUpdatingImages}>
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
