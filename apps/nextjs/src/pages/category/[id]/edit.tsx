import { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { yupResolver } from "@hookform/resolvers/yup";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Category } from "@acme/db";

import { api } from "~/utils/api";
import { CategorySchema, type CategoryFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Textarea } from "~/components/Atoms/Textarea";
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

  const category = await prisma.category.findUnique({ where: { id: context.params?.id as string } });

  if (!category) return { props: {} };

  return {
    props: {
      category: {
        ...category,
        createdAt: formalizeDate(category?.createdAt),
      },
    },
  };
};

interface pageProps {
  category: Category;
}

type ImageState = {
  completed: boolean;
  loading: boolean;
};

export default function EditCategory({ category }: pageProps) {
  const [upload, setUpload] = useState(false);
  const [iconState, setIconState] = useState<ImageState>({ completed: false, loading: false });

  const form = useForm<CategoryFormData>({
    resolver: yupResolver(CategorySchema),
  });

  const { mutate, isLoading } = api.category.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      setUpload(true);
      setIconState({ completed: false, loading: true });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutate({ id: category.id, name: data.Name, description: data.Description });
  };

  useEffect(() => {
    if (category) {
      form.setValue("Name", category.name);
      form.setValue("Description", category.description);
    }
  }, [category]);

  useEffect(() => {
    if (iconState.completed) {
      toast.success("Category has been updated");
    }
  }, [iconState.completed]);

  if (!category) return <div>Category not found</div>;

  return (
    <>
      <Head>
        <title>Edit {category.name} - SubM</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Category</CardTitle>
            <CardDescription>Edit &quot;{category.name}&quot;</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
                <FormField
                  control={form.control}
                  name="Icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Icon</FormLabel>
                      <FormControl>
                        <ImageUpload
                          upload={upload}
                          itemId={category.id}
                          onUpload={() => setIconState({ completed: true, loading: false })}
                          setUpload={(value: boolean) => setUpload(value)}
                          setLoading={(value: boolean) =>
                            setIconState((prev) => {
                              return { ...prev, loading: value };
                            })
                          }
                          setValue={(value: string) => form.setValue("Icon", value)}
                          bucket={env.NEXT_PUBLIC_CATEGORY_ICON}
                          previewImages={[category.id]}
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
                        <Input placeholder="Name of the Category" {...field} />
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
                        <Textarea placeholder="Brief description of the Category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" loading={isLoading || iconState.loading}>
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
