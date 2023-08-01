import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
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
      images: true,
    },
  });

  if (!product) return { props: {} };

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
  images: string[];
}

interface pageProps {
  product: Product;
  categories: Category[];
}

type ImageState = {
  completed: boolean;
  loading: boolean;
};

export default function EditProduct({ product, categories }: pageProps) {
  const router = useRouter();
  const [upload, setUpload] = useState(false);
  const [images, setImages] = useState<string[]>(product.images);
  const [logoState, setLogoState] = useState<ImageState>({ completed: false, loading: false });
  const [imagesState, setImagesState] = useState<ImageState>({ completed: false, loading: false });

  const form = useForm<ProductFormData>({
    resolver: yupResolver(ProductSchema),
  });

  const { mutate, isLoading, data } = api.product.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      setLogoState({ completed: false, loading: true });
      setImagesState({ completed: false, loading: true });
    },
  });

  const { mutate: UpdateImages, isLoading: isUpdatingImages } = api.product.updateImages.useMutation({
    onSuccess: () => {
      toast.success("Product has been updated");
      router.push(`/product/${product.id}`);
    },
  });

  const { mutate: deleteImage } = api.product.deleteImage.useMutation({});

  const onSubmit = (data: ProductFormData) => {
    mutate({ id: product.id, name: data.Name, description: data.Description, link: data.Link, category: data.Category });
  };

  useEffect(() => {
    if (product) {
      form.setValue("Name", product.name);
      form.setValue("Description", product.description);
      form.setValue("Link", product.link || "");
      form.setValue("Category", product.category.id);
    }
  }, [product]);

  useEffect(() => {
    if (logoState.completed && imagesState.completed)
      JSON.stringify(images) !== JSON.stringify(product.images)
        ? UpdateImages({ id: data?.id ?? "", images })
        : toast.success("Product has been updated");
  }, [logoState.completed, imagesState.completed]);

  if (!product) return <div>Product not found</div>;

  return (
    <>
      <Head>
        <title>Edit Product - {product.name}</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Product</CardTitle>
            <CardDescription>Edit &quot;{product.name}&quot;</CardDescription>
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
                          itemId={product.id}
                          onUpload={() => setLogoState({ completed: true, loading: false })}
                          setUpload={(value: boolean) => setUpload(value)}
                          setLoading={(value: boolean) =>
                            setLogoState((prev) => {
                              return { ...prev, loading: value };
                            })
                          }
                          setValue={(value: string) => form.setValue("Logo", value)}
                          bucket={env.NEXT_PUBLIC_PRODUCT_LOGO}
                          previewImages={[product.id]}
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
                  render={({}) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          itemId={product.id}
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
                          previewImages={[...product.images]}
                          onDelete={(image) => deleteImage({ id: product.id, image })}
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
